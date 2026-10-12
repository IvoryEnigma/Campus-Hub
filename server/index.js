import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Auth & Session Simulation Middleware
// Reads 'x-user-id' from headers; defaults to 'user_stu_ananya' (Female student in Girls' Hostel)
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'] || 'user_stu_ananya';
  const rawUser = db.findRawUserById(userId);
  req.user = rawUser;
  next();
});

// Helper for error responses
const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'AIT Campus Hub API',
    institution: 'Army Institute of Technology, Pune',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth & Current User
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, 'User session not found');
  }
  // Returns safe session object with permissions
  res.json({
    success: true,
    user: db.getPrivateUserProfile(req.user.id),
  });
});

// Switch active user role for evaluation and testing
app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const target = db.findRawUserById(userId);
  if (!target) {
    return errorResponse(res, 404, 'Demo user account not found');
  }
  res.json({
    success: true,
    user: db.getPrivateUserProfile(target.id),
  });
});

// List demo users for quick role testing
app.get('/api/users/demo-accounts', (req, res) => {
  // Returns list of available demo personas
  const personas = db.data.users.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    role: u.role,
    hostelAssignment: u.hostelAssignment,
    verified: u.verified,
    designation: u.designation || u.branch || u.company || '',
  }));
  res.json({ success: true, personas });
});

// Public profile endpoint (strictly sanitizes and protects privacy)
app.get('/api/users/public/:id', (req, res) => {
  const sanitized = db.findUserById(req.params.id);
  if (!sanitized) {
    return errorResponse(res, 404, 'User not found');
  }
  res.json({ success: true, user: sanitized });
});

// Current user private profile
app.get('/api/users/profile', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Unauthorized');
  const profile = db.getPrivateUserProfile(req.user.id);
  res.json({ success: true, profile });
});

app.put('/api/users/profile', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Unauthorized');
  const updated = db.updateUserProfile(req.user.id, req.body);
  res.json({ success: true, profile: updated });
});

// 3. Communities
app.get('/api/communities', (req, res) => {
  const list = db.getCommunities(req.user);
  res.json({ success: true, communities: list });
});

app.get('/api/communities/:slug', (req, res) => {
  const comm = db.findCommunityBySlug(req.params.slug);
  if (!comm) return errorResponse(res, 404, 'Community not found');

  const hasAccess = db.checkCommunityAccess(req.user, comm);
  if (comm.isRestricted && !hasAccess) {
    return errorResponse(
      res,
      403,
      `Access Denied: You do not have permission to view ${comm.name}. Hostel content is strictly restricted to authorized residents and wardens.`
    );
  }

  res.json({
    success: true,
    community: {
      ...comm,
      hasAccess,
    },
  });
});

app.get('/api/communities/:slug/messages', (req, res) => {
  const comm = db.findCommunityBySlug(req.params.slug);
  if (!comm) return errorResponse(res, 404, 'Community not found');

  if (!db.checkCommunityAccess(req.user, comm)) {
    return errorResponse(
      res,
      403,
      `Access Denied: Content in ${comm.name} is restricted. Unauthorized access is prohibited by campus access control policy.`
    );
  }

  const messages = db.getMessages(req.user, {
    communitySlug: req.params.slug,
    type: req.query.type,
    search: req.query.search,
  });

  res.json({ success: true, messages });
});

// 4. Messages & Publishing
app.post('/api/messages', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');

  const { communitySlug, title, content, type, isOfficial } = req.body;
  if (!communitySlug || !title || !content) {
    return errorResponse(res, 400, 'Community slug, title, and content are required');
  }

  try {
    const newMessage = db.createMessage(req.user, {
      communitySlug,
      title,
      content,
      type,
      isOfficial,
    });
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    const status = err.message.includes('Unauthorized') || err.message.includes('Access denied') ? 403 : 400;
    return errorResponse(res, status, err.message);
  }
});

app.post('/api/messages/:id/pin', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  try {
    const updated = db.togglePinMessage(req.user, req.params.id);
    res.json({ success: true, message: updated });
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
});

app.post('/api/messages/:id/save', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  try {
    const result = db.toggleSaveMessage(req.user, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.post('/api/messages/:id/read', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const result = db.markMessageRead(req.user, req.params.id);
  res.json({ success: true, ...result });
});

app.get('/api/messages/:id/replies', (req, res) => {
  try {
    const replies = db.getReplies(req.user, req.params.id);
    res.json({ success: true, replies });
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
});

app.post('/api/messages/:id/replies', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { content } = req.body;
  if (!content || !content.trim()) {
    return errorResponse(res, 400, 'Reply content cannot be empty');
  }
  try {
    const reply = db.createReply(req.user, req.params.id, content);
    res.status(201).json({ success: true, reply });
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
});

// 5. Unified Campus Inbox
app.get('/api/inbox', (req, res) => {
  const { filter = 'all', type = 'all', search = '', source = '' } = req.query;

  const filters = {
    search,
    type: type !== 'all' ? type : undefined,
    communitySlug: source || undefined,
  };

  if (filter === 'unread') filters.unreadOnly = true;
  if (filter === 'pinned') filters.pinnedOnly = true;
  if (filter === 'saved') filters.savedOnly = true;

  const messages = db.getMessages(req.user, filters);

  // Compute inbox summary counts
  const allMessages = db.getMessages(req.user, {});
  const unreadCount = allMessages.filter((m) => !m.isRead).length;
  const pinnedCount = allMessages.filter((m) => m.isPinned).length;
  const savedCount = allMessages.filter((m) => m.isSaved).length;

  res.json({
    success: true,
    counts: {
      total: allMessages.length,
      unread: unreadCount,
      pinned: pinnedCount,
      saved: savedCount,
    },
    messages,
  });
});

// 6. Innovation Hub
app.get('/api/ideas', (req, res) => {
  const { category, search } = req.query;
  const ideas = db.getIdeas(req.user, { category, search });
  res.json({ success: true, ideas });
});

app.post('/api/ideas', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { title, description, category, tags, seekingTeammates, neededSkills } = req.body;
  if (!title || !description) {
    return errorResponse(res, 400, 'Title and description are required');
  }
  try {
    const idea = db.createIdea(req.user, {
      title,
      description,
      category,
      tags,
      seekingTeammates,
      neededSkills,
    });
    res.status(201).json({ success: true, idea });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.post('/api/ideas/:id/like', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  try {
    const result = db.toggleLikeIdea(req.user, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.get('/api/ideas/:id/comments', (req, res) => {
  const comments = db.getIdeaComments(req.params.id);
  res.json({ success: true, comments });
});

app.post('/api/ideas/:id/comments', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { content } = req.body;
  if (!content || !content.trim()) return errorResponse(res, 400, 'Comment content required');
  try {
    const comment = db.addIdeaComment(req.user, req.params.id, content);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.get('/api/projects', (req, res) => {
  const projects = db.getProjects();
  res.json({ success: true, projects });
});

// 7. Opportunities & Applications
app.get('/api/opportunities', (req, res) => {
  const opportunities = db.getOpportunities();
  res.json({ success: true, opportunities });
});

app.post('/api/opportunities', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { title, company, role, location, type, stipend, description, deadline } = req.body;
  if (!title || !company || !role || !description) {
    return errorResponse(res, 400, 'Title, company, role, and description are required');
  }

  try {
    const opp = db.createOpportunity(req.user, {
      title,
      company,
      role,
      location,
      type,
      stipend,
      description,
      deadline,
    });
    res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    return errorResponse(res, status, err.message);
  }
});

app.post('/api/opportunities/:id/apply', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { coverNote, resumeUrl } = req.body;
  try {
    const appRecord = db.applyToOpportunity(req.user, req.params.id, { coverNote, resumeUrl });
    res.status(201).json({ success: true, application: appRecord });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.get('/api/applications/my', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const applications = db.getUserApplications(req.user);
  res.json({ success: true, applications });
});

// 8. Alumni Verification Workflow
app.post('/api/alumni/register', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { graduationYear, company, designation, linkedInUrl } = req.body;
  if (!company || !designation) {
    return errorResponse(res, 400, 'Company and designation are required for alumni registration');
  }
  try {
    const record = db.registerAlumni(req.user, { graduationYear, company, designation, linkedInUrl });
    res.status(201).json({ success: true, verification: record });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
});

app.get('/api/alumni/pending', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  try {
    const list = db.getPendingAlumniVerifications(req.user);
    res.json({ success: true, verifications: list });
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
});

app.post('/api/alumni/verify/:id', (req, res) => {
  if (!req.user) return errorResponse(res, 401, 'Authentication required');
  const { approve = true } = req.body;
  try {
    const updated = db.reviewAlumniVerification(req.user, req.params.id, approve);
    res.json({ success: true, verification: updated });
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
});

// 9. Notifications
app.get('/api/notifications', (req, res) => {
  const list = db.getNotifications(req.user);
  const unreadCount = list.filter((n) => !n.isRead).length;
  res.json({ success: true, count: unreadCount, notifications: list });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const success = db.markNotificationRead(req.user, req.params.id);
  res.json({ success });
});

app.listen(PORT, () => {
  console.log(`[AIT Campus Hub Server] Running on http://localhost:${PORT}`);
});
