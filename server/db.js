import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_USERS,
  getInitialCommunities,
  getInitialMessages,
  getInitialIdeas,
  getInitialProjects,
  getInitialOpportunities,
  getInitialCampusProblems,
  getInitialProblemSolutions,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure new collections exist in existing json
        if (!this.data.campusProblems) {
          this.data.campusProblems = getInitialCampusProblems();
        }
        if (!this.data.problemComments) {
          this.data.problemComments = [
            {
              id: 'pcom_01',
              problemId: 'prob_01',
              authorId: 'user_stu_rohan',
              authorDisplayName: 'Rohan Verma',
              isAnonymous: false,
              content: 'Fully agree. During exam preparation past 10 PM, having coffee or light snacks in the hostel common lounge would be a massive relief.',
              createdAt: '2026-10-10T13:00:00Z',
            },
          ];
        }
        if (!this.data.problemSolutions) {
          this.data.problemSolutions = getInitialProblemSolutions();
        }
        this.persist();
      } catch (err) {
        console.error('Error parsing data.json, re-seeding:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  seed() {
    this.data = {
      users: INITIAL_USERS,
      communities: getInitialCommunities(),
      messages: getInitialMessages(),
      replies: [
        {
          id: 'rep_01',
          messageId: 'msg_robotics_01',
          authorId: 'user_stu_rohan',
          authorDisplayName: 'Rohan Verma',
          content: 'I will be there with the LiDAR point cloud visualization script on ROS2 RViz!',
          createdAt: '2026-10-11T12:30:00Z',
          isDemo: true,
        },
      ],
      readStates: [
        { id: 'rd_01', userId: 'user_stu_ananya', messageId: 'msg_fe_01', readAt: '2026-10-10T10:00:00Z' },
      ],
      savedItems: [
        { id: 'sv_01', userId: 'user_stu_ananya', messageId: 'msg_fe_01', savedAt: '2026-10-10T10:05:00Z' },
      ],
      ideas: getInitialIdeas(),
      ideaLikes: [
        { id: 'lk_01', ideaId: 'idea_01', userId: 'user_stu_ananya' },
      ],
      ideaComments: [
        {
          id: 'ic_01',
          ideaId: 'idea_01',
          authorId: 'user_faculty_deshmukh',
          authorDisplayName: 'Prof. K. S. Deshmukh',
          content: 'Excellent problem statement. Have you considered thermal signature drift during high wind conditions?',
          createdAt: '2026-10-06T11:00:00Z',
        },
      ],
      projects: getInitialProjects(),
      opportunities: getInitialOpportunities(),
      applications: [
        {
          id: 'app_01',
          opportunityId: 'opp_01',
          applicantId: 'user_stu_rohan',
          applicantDisplayName: 'Rohan Verma',
          coverNote: 'Interested in distributed storage and consensus protocols. Built Project Garuda with ROS2/C++.',
          resumeUrl: 'https://example.com/rohan-resume-demo.pdf',
          status: 'Under Review',
          appliedAt: '2026-10-10T16:00:00Z',
        },
      ],
      notifications: [
        {
          id: 'notif_01',
          userId: 'user_stu_ananya',
          title: 'Official Academic Notice',
          content: 'SPPU Practical Examination Schedule released in FE Announcements.',
          type: 'announcement',
          link: '/communities/fe-announcements',
          isRead: false,
          createdAt: '2026-10-10T09:35:00Z',
        },
        {
          id: 'notif_02',
          userId: 'user_stu_ananya',
          title: "Girls' Hostel Maintenance",
          content: 'Solar Water Heater maintenance scheduled for tomorrow 10:00 AM.',
          type: 'announcement',
          link: '/communities/hostel-girls',
          isRead: false,
          createdAt: '2026-10-11T08:05:00Z',
        },
      ],
      alumniVerifications: [
        {
          id: 'av_01',
          userId: 'user_alumni_vikram',
          displayName: 'Vikram Choudhary',
          graduationYear: 2024,
          company: 'AeroDrone Technologies',
          designation: 'Co-founder',
          linkedInUrl: 'https://linkedin.com/in/vikram-demo',
          status: 'pending',
          submittedAt: '2026-10-09T10:00:00Z',
        },
      ],
      campusProblems: getInitialCampusProblems(),
      problemComments: [
        {
          id: 'pcom_01',
          problemId: 'prob_01',
          authorId: 'user_stu_rohan',
          authorDisplayName: 'Rohan Verma',
          isAnonymous: false,
          content: 'Fully agree. During exam preparation past 10 PM, having coffee or light snacks in the hostel common lounge would be a massive relief.',
          createdAt: '2026-10-10T13:00:00Z',
        },
      ],
      problemSolutions: getInitialProblemSolutions(),
      notificationPreferences: {
        announcements: true,
        hostel: true,
        opportunities: true,
        mentions: true,
        problems: true,
      },
    };
    this.persist();
  }

  persist() {
    try {
      const tempPath = DATA_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
    } catch (err) {
      console.error('Error writing database:', err);
    }
  }

  // --- Users & Privacy ---
  getUsers() {
    return this.data.users.map((u) => this.sanitizeUser(u));
  }

  findRawUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  findUserById(id) {
    const raw = this.findRawUserById(id);
    return raw ? this.sanitizeUser(raw) : null;
  }

  // MANDATORY PRIVACY REDACTION:
  // Public profiles, lists, comments, and messages must never leak registration numbers,
  // phone numbers, emails, branch, academic year, or personal private details.
  sanitizeUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      displayName: user.displayName,
      role: user.role,
      verified: !!user.verified,
      department: user.department || null,
      designation: user.designation || null,
      company: user.company || null,
      graduationYear: user.graduationYear || null,
      managedClub: user.managedClub || null,
      assignedHostel: user.assignedHostel || null,
      // Private fields (regNumber, email, phone, branch, academicYear, admissionBatch) omitted
    };
  }

  getPrivateUserProfile(userId) {
    const raw = this.findRawUserById(userId);
    if (!raw) return null;
    return {
      ...raw,
      isSelf: true,
    };
  }

  updateUserProfile(userId, updates) {
    const user = this.findRawUserById(userId);
    if (!user) return null;
    if (updates.displayName) user.displayName = updates.displayName.trim();
    this.persist();
    return this.getPrivateUserProfile(userId);
  }

  // --- Communities & Access Control ---
  checkCommunityAccess(user, community) {
    if (!community) return false;
    if (!community.isRestricted) return true;

    if (community.category === 'hostel') {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'warden') {
        return user.assignedHostel === community.hostelAssignment;
      }
      if (user.role === 'student') {
        return user.hostelAssignment === community.hostelAssignment;
      }
      return false;
    }

    return true;
  }

  getCommunities(user) {
    return this.data.communities.map((comm) => ({
      ...comm,
      hasAccess: this.checkCommunityAccess(user, comm),
    }));
  }

  findCommunityBySlug(slug) {
    return this.data.communities.find((c) => c.slug === slug) || null;
  }

  // --- Messages & Announcements ---
  getMessages(user, filters = {}) {
    let result = this.data.messages.filter((msg) => {
      const comm = this.findCommunityBySlug(msg.communitySlug);
      if (!this.checkCommunityAccess(user, comm)) {
        return false;
      }
      return true;
    });

    if (filters.communitySlug) {
      result = result.filter((m) => m.communitySlug === filters.communitySlug);
    }

    if (filters.type && filters.type !== 'all') {
      result = result.filter((m) => m.type === filters.type);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.authorDisplayName.toLowerCase().includes(q)
      );
    }

    if (filters.pinnedOnly) {
      result = result.filter((m) => m.isPinned);
    }

    const readMessageIds = new Set(
      this.data.readStates
        .filter((r) => r.userId === (user ? user.id : ''))
        .map((r) => r.messageId)
    );

    const savedMessageIds = new Set(
      this.data.savedItems
        .filter((s) => s.userId === (user ? user.id : ''))
        .map((s) => s.messageId)
    );

    if (filters.unreadOnly) {
      result = result.filter((m) => !readMessageIds.has(m.id));
    }

    if (filters.savedOnly) {
      result = result.filter((m) => savedMessageIds.has(m.id));
    }

    return result
      .map((m) => ({
        ...m,
        isRead: readMessageIds.has(m.id),
        isSaved: savedMessageIds.has(m.id),
        repliesCount: this.data.replies.filter((r) => r.messageId === m.id).length,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  canPublishOfficial(user, communitySlug) {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const comm = this.findCommunityBySlug(communitySlug);
    if (!comm) return false;

    if (user.role === 'faculty') {
      return comm.category === 'department' || comm.category === 'fe';
    }

    if (user.role === 'club_lead') {
      return comm.name === user.managedClub;
    }

    if (user.role === 'warden') {
      return comm.category === 'hostel' && comm.hostelAssignment === user.assignedHostel;
    }

    return false;
  }

  createMessage(user, { communitySlug, title, content, type = 'discussion', isOfficial = false }) {
    const comm = this.findCommunityBySlug(communitySlug);
    if (!comm) throw new Error('Community not found');

    if (!this.checkCommunityAccess(user, comm)) {
      throw new Error('Access denied to this community');
    }

    if (isOfficial && !this.canPublishOfficial(user, communitySlug)) {
      throw new Error('Unauthorized: only authorized faculty, club leads, wardens, or admins can publish official notices.');
    }

    const newMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      communitySlug,
      authorId: user.id,
      authorDisplayName: user.displayName,
      roleBadge: user.role.replace('_', ' ').toUpperCase(),
      title: title.trim(),
      content: content.trim(),
      type: isOfficial ? 'notice' : type,
      isOfficial: !!isOfficial,
      isPinned: false,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    this.data.messages.unshift(newMessage);
    this.persist();
    return newMessage;
  }

  togglePinMessage(user, messageId) {
    const msg = this.data.messages.find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found');

    if (!this.canPublishOfficial(user, msg.communitySlug) && user.role !== 'admin') {
      throw new Error('Unauthorized to pin messages in this community');
    }

    msg.isPinned = !msg.isPinned;
    this.persist();
    return msg;
  }

  toggleSaveMessage(user, messageId) {
    if (!user) throw new Error('Authentication required');
    const idx = this.data.savedItems.findIndex(
      (s) => s.userId === user.id && s.messageId === messageId
    );
    let isSaved = false;
    if (idx >= 0) {
      this.data.savedItems.splice(idx, 1);
      isSaved = false;
    } else {
      this.data.savedItems.push({
        id: 'sv_' + Date.now(),
        userId: user.id,
        messageId,
        savedAt: new Date().toISOString(),
      });
      isSaved = true;
    }
    this.persist();
    return { isSaved };
  }

  markMessageRead(user, messageId) {
    if (!user) return { isRead: false };
    const exists = this.data.readStates.some(
      (r) => r.userId === user.id && r.messageId === messageId
    );
    if (!exists) {
      this.data.readStates.push({
        id: 'rd_' + Date.now(),
        userId: user.id,
        messageId,
        readAt: new Date().toISOString(),
      });
      this.persist();
    }
    return { isRead: true };
  }

  getReplies(user, messageId) {
    const msg = this.data.messages.find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found');

    const comm = this.findCommunityBySlug(msg.communitySlug);
    if (!this.checkCommunityAccess(user, comm)) {
      throw new Error('Access denied to view replies in this community');
    }

    return this.data.replies
      .filter((r) => r.messageId === messageId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  createReply(user, messageId, content) {
    const msg = this.data.messages.find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found');

    const comm = this.findCommunityBySlug(msg.communitySlug);
    if (!this.checkCommunityAccess(user, comm)) {
      throw new Error('Access denied to reply in this community');
    }

    const reply = {
      id: 'rep_' + Date.now(),
      messageId,
      authorId: user.id,
      authorDisplayName: user.displayName,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    this.data.replies.push(reply);
    this.persist();
    return reply;
  }

  // --- Innovation Hub: Ideas, Likes, Comments, Projects ---
  getIdeas(user, filters = {}) {
    let result = [...this.data.ideas];
    if (filters.category && filters.category !== 'all') {
      result = result.filter((i) => i.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    const userLikes = new Set(
      this.data.ideaLikes
        .filter((l) => l.userId === (user ? user.id : ''))
        .map((l) => l.ideaId)
    );

    return result.map((idea) => ({
      ...idea,
      hasLiked: userLikes.has(idea.id),
      commentsCount: this.data.ideaComments.filter((c) => c.ideaId === idea.id).length,
    })).sort((a, b) => b.likesCount - a.likesCount);
  }

  createIdea(user, { title, description, category, tags = [], seekingTeammates = false, neededSkills = [] }) {
    if (!user) throw new Error('Authentication required');
    const newIdea = {
      id: 'idea_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category || 'General Innovation',
      tags: Array.isArray(tags) ? tags : [],
      authorId: user.id,
      authorDisplayName: user.displayName,
      seekingTeammates: !!seekingTeammates,
      neededSkills: Array.isArray(neededSkills) ? neededSkills : [],
      status: 'Active',
      likesCount: 0,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    this.data.ideas.unshift(newIdea);
    this.persist();
    return newIdea;
  }

  toggleLikeIdea(user, ideaId) {
    if (!user) throw new Error('Authentication required');
    const idea = this.data.ideas.find((i) => i.id === ideaId);
    if (!idea) throw new Error('Idea not found');

    const idx = this.data.ideaLikes.findIndex((l) => l.ideaId === ideaId && l.userId === user.id);
    let hasLiked = false;
    if (idx >= 0) {
      this.data.ideaLikes.splice(idx, 1);
      idea.likesCount = Math.max(0, (idea.likesCount || 0) - 1);
      hasLiked = false;
    } else {
      this.data.ideaLikes.push({ id: 'lk_' + Date.now(), ideaId, userId: user.id });
      idea.likesCount = (idea.likesCount || 0) + 1;
      hasLiked = true;
    }
    this.persist();
    return { hasLiked, likesCount: idea.likesCount };
  }

  getIdeaComments(ideaId) {
    return this.data.ideaComments
      .filter((c) => c.ideaId === ideaId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  addIdeaComment(user, ideaId, content) {
    if (!user) throw new Error('Authentication required');
    const idea = this.data.ideas.find((i) => i.id === ideaId);
    if (!idea) throw new Error('Idea not found');

    const comment = {
      id: 'ic_' + Date.now(),
      ideaId,
      authorId: user.id,
      authorDisplayName: user.displayName,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    this.data.ideaComments.push(comment);
    this.persist();
    return comment;
  }

  getProjects() {
    return this.data.projects;
  }

  // --- Alumni Opportunities & Applications ---
  getOpportunities() {
    return this.data.opportunities.map((opp) => ({
      ...opp,
      applicationsCount: this.data.applications.filter((a) => a.opportunityId === opp.id).length,
    }));
  }

  createOpportunity(user, oppData) {
    if (!user) throw new Error('Authentication required');

    const isAuthorized =
      user.role === 'admin' ||
      user.role === 'faculty' ||
      (user.role === 'alumni' && user.verified === true);

    if (!isAuthorized) {
      throw new Error('Unauthorized: Unverified alumni accounts or regular students cannot publish campus opportunities.');
    }

    const opportunity = {
      id: 'opp_' + Date.now(),
      title: oppData.title.trim(),
      company: oppData.company.trim(),
      authorDisplayName: user.displayName,
      authorId: user.id,
      role: oppData.role.trim(),
      location: oppData.location || 'Pune / Remote',
      type: oppData.type || 'Internship',
      stipend: oppData.stipend || 'Competitive',
      description: oppData.description.trim(),
      deadline: oppData.deadline || 'Open until filled',
      isVerified: true,
      isDemo: false,
    };

    this.data.opportunities.unshift(opportunity);
    this.persist();
    return opportunity;
  }

  applyToOpportunity(user, opportunityId, { coverNote, resumeUrl }) {
    if (!user) throw new Error('Authentication required');
    const opp = this.data.opportunities.find((o) => o.id === opportunityId);
    if (!opp) throw new Error('Opportunity not found');

    const existing = this.data.applications.find(
      (a) => a.opportunityId === opportunityId && a.applicantId === user.id
    );
    if (existing) {
      throw new Error('You have already applied for this opportunity');
    }

    const application = {
      id: 'app_' + Date.now(),
      opportunityId,
      opportunityTitle: opp.title,
      company: opp.company,
      applicantId: user.id,
      applicantDisplayName: user.displayName,
      coverNote: (coverNote || '').trim(),
      resumeUrl: (resumeUrl || '').trim(),
      status: 'Pending',
      appliedAt: new Date().toISOString(),
    };

    this.data.applications.unshift(application);
    this.persist();
    return application;
  }

  getUserApplications(user) {
    if (!user) return [];
    return this.data.applications.filter((a) => a.applicantId === user.id);
  }

  // --- Alumni Registration & Admin Verification Workflow ---
  registerAlumni(user, { graduationYear, company, designation, linkedInUrl }) {
    if (!user) throw new Error('Authentication required');

    const rawUser = this.findRawUserById(user.id);
    if (rawUser) {
      rawUser.role = 'alumni';
      rawUser.graduationYear = Number(graduationYear) || 2024;
      rawUser.company = company.trim();
      rawUser.designation = designation.trim();
      rawUser.verified = false;
    }

    const request = {
      id: 'av_' + Date.now(),
      userId: user.id,
      displayName: user.displayName,
      graduationYear: Number(graduationYear) || 2024,
      company: company.trim(),
      designation: designation.trim(),
      linkedInUrl: (linkedInUrl || '').trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.data.alumniVerifications.push(request);
    this.persist();
    return request;
  }

  getPendingAlumniVerifications(adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: only administrators can access pending alumni verifications');
    }
    return this.data.alumniVerifications;
  }

  reviewAlumniVerification(adminUser, verificationId, approve = true) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: only administrators can review alumni applications');
    }

    const req = this.data.alumniVerifications.find((v) => v.id === verificationId);
    if (!req) throw new Error('Verification request not found');

    req.status = approve ? 'approved' : 'rejected';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminUser.displayName;

    const user = this.findRawUserById(req.userId);
    if (user) {
      user.verified = !!approve;
    }

    this.persist();
    return req;
  }

  // --- Notifications ---
  getNotifications(user) {
    if (!user) return [];
    return this.data.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markNotificationRead(user, notificationId) {
    if (!user) return false;
    const notif = this.data.notifications.find(
      (n) => n.id === notificationId && n.userId === user.id
    );
    if (notif) {
      notif.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

  createNotification(userId, { title, content, type = 'announcement', link = '' }) {
    const notif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId,
      title,
      content,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  // ========================================================
  // --- CAMPUS PROBLEMS MODULE (PHASE 3) ---
  // ========================================================

  canAccessProblemScope(user, scope) {
    if (!scope || scope === 'Whole campus') return true;
    if (!user) return false;
    if (user.role === 'admin') return true;

    if (scope === "Girls' Hostel") {
      if (user.role === 'warden') return user.assignedHostel === "Girls' Hostel";
      return user.hostelAssignment === "Girls' Hostel";
    }

    if (scope === "Boys' Hostel") {
      if (user.role === 'warden') return user.assignedHostel === "Boys' Hostel";
      return user.hostelAssignment === "Boys' Hostel";
    }

    return true;
  }

  getCampusProblems(user, filters = {}) {
    let result = (this.data.campusProblems || []).filter((prob) => {
      // STRICT HOSTEL ISOLATION:
      if (!this.canAccessProblemScope(user, prob.scope)) {
        return false;
      }
      return true;
    });

    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter((p) => p.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.scope && filters.scope !== 'all') {
      result = result.filter((p) => p.scope.toLowerCase() === filters.scope.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort: most_affected vs newest
    if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: most affected (upvotesCount desc)
      result.sort((a, b) => (b.upvotesCount || 0) - (a.upvotesCount || 0));
    }

    // Anonymity & Vote status mapping
    const userId = user ? user.id : '';
    const isModerator = user && (user.role === 'admin' || user.role === 'faculty');

    return result.map((p) => {
      const upvotedUserIds = p.upvotedUserIds || [];
      const hasVoted = upvotedUserIds.includes(userId);

      // Mask author if anonymous and viewer is not moderator
      const isAnonStudent = p.isAnonymous && !isModerator;
      const displayAuthor = isAnonStudent
        ? 'Anonymous Student'
        : p.authorDisplayName;
      const safeAuthorId = isAnonStudent ? undefined : p.authorId;

      return {
        ...p,
        authorDisplayName: displayAuthor,
        authorName: displayAuthor,
        authorId: safeAuthorId,
        hasVoted,
        commentsCount: (this.data.problemComments || []).filter((c) => c.problemId === p.id).length,
        solutionsCount: (this.data.problemSolutions || []).filter((s) => s.problemId === p.id).length,
      };
    });
  }

  getCampusProblemById(user, problemId) {
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) return null;

    if (!this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied: This problem is restricted to authorized hostel residents.');
    }

    const isModerator = user && (user.role === 'admin' || user.role === 'faculty');
    const isAnonStudent = prob.isAnonymous && !isModerator;
    const displayAuthor = isAnonStudent
      ? 'Anonymous Student'
      : prob.authorDisplayName;
    const safeAuthorId = isAnonStudent ? undefined : prob.authorId;

    const hasVoted = (prob.upvotedUserIds || []).includes(user ? user.id : '');

    return {
      ...prob,
      authorDisplayName: displayAuthor,
      authorName: displayAuthor,
      authorId: safeAuthorId,
      hasVoted,
      commentsCount: (this.data.problemComments || []).filter((c) => c.problemId === prob.id).length,
      solutionsCount: (this.data.problemSolutions || []).filter((s) => s.problemId === prob.id).length,
    };
  }

  createCampusProblem(user, data) {
    if (!user) throw new Error('Authentication required');

    const {
      title,
      description,
      category,
      location,
      timeOfDayAffected,
      whoIsAffected,
      severity = 'medium',
      photoUrl = '',
      scope = 'Whole campus',
      isAnonymous = false,
    } = data;

    if (!title || !description || !category || !location) {
      throw new Error('Title, description, category, and location are required.');
    }

    // Verify hostel scope permission: a user cannot post in a hostel they have no access to
    if (!this.canAccessProblemScope(user, scope)) {
      throw new Error(`Unauthorized: You cannot post a problem scoped to ${scope}.`);
    }

    const newProblem = {
      id: 'prob_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      timeOfDayAffected: (timeOfDayAffected || 'All day').trim(),
      whoIsAffected: (whoIsAffected || 'All Students').trim(),
      severity: ['low', 'medium', 'high'].includes(severity) ? severity : 'medium',
      photoUrl: (photoUrl || '').trim(),
      scope: ['Whole campus', "Girls' Hostel", "Boys' Hostel", 'Department'].includes(scope) ? scope : 'Whole campus',
      status: 'Open', // Initial status is always Open; students cannot set custom status
      authorId: user.id,
      authorDisplayName: user.displayName,
      isAnonymous: !!isAnonymous,
      upvotesCount: 1, // Author automatically faces this
      upvotedUserIds: [user.id],
      solutionsCount: 0,
      commentsCount: 0,
      convertedIdeaId: null,
      isDemo: false,
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      reportedByUserIds: [],
    };

    if (!this.data.campusProblems) this.data.campusProblems = [];
    this.data.campusProblems.unshift(newProblem);
    this.persist();

    return newProblem;
  }

  toggleVoteProblem(user, problemId) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Campus problem not found');

    if (!this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied: You cannot vote on a problem restricted to another hostel.');
    }

    if (!prob.upvotedUserIds) prob.upvotedUserIds = [];

    const index = prob.upvotedUserIds.indexOf(user.id);
    let hasVoted = false;

    if (index >= 0) {
      prob.upvotedUserIds.splice(index, 1);
      prob.upvotesCount = Math.max(0, (prob.upvotesCount || 1) - 1);
      hasVoted = false;
    } else {
      prob.upvotedUserIds.push(user.id);
      prob.upvotesCount = (prob.upvotesCount || 0) + 1;
      hasVoted = true;
    }

    this.persist();
    return { hasVoted, upvotesCount: prob.upvotesCount };
  }

  changeProblemStatus(user, problemId, newStatus) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Campus problem not found');

    // ONLY ADMINS OR FACULTY/STAFF can set Under Review, Resolved, Closed
    const isStaffOrAdmin = user.role === 'admin' || user.role === 'faculty';
    const restrictedStatuses = ['Under Review', 'Resolved', 'Closed'];

    if (restrictedStatuses.includes(newStatus) && !isStaffOrAdmin) {
      throw new Error(`Unauthorized: Only campus administrators or faculty can set status to "${newStatus}".`);
    }

    const validStatuses = ['Open', 'Under Review', 'Solution Proposed', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid problem status.');
    }

    prob.status = newStatus;
    this.persist();

    // Send notification to author on status change
    if (prob.authorId && prob.authorId !== user.id) {
      this.createNotification(prob.authorId, {
        title: `Campus Problem Status: ${newStatus}`,
        content: `Your campus problem "${prob.title.slice(0, 40)}..." was updated to ${newStatus}.`,
        type: 'problem_update',
        link: '/campus-problems',
      });
    }

    return prob;
  }

  getProblemComments(userOrProblemId, maybeProblemId) {
    let user = userOrProblemId;
    let problemId = maybeProblemId;
    if (!maybeProblemId && typeof userOrProblemId === 'string') {
      problemId = userOrProblemId;
      user = null;
    }
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    if (user && !this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied to restricted hostel problem comments.');
    }

    const comments = (this.data.problemComments || []).filter((c) => c.problemId === problemId);
    const isModerator = user && (user.role === 'admin' || user.role === 'faculty');

    return comments.map((c) => ({
      ...c,
      authorDisplayName: c.isAnonymous && !isModerator ? 'Anonymous Student' : c.authorDisplayName,
    })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  addProblemComment(user, problemId, commentData) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    if (!this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied to comment on restricted hostel problem.');
    }

    const content = typeof commentData === 'string' ? commentData : commentData?.content;
    const isAnonymous = typeof commentData === 'object' ? !!commentData?.isAnonymous : false;

    if (!content || !content.trim()) {
      throw new Error('Comment content cannot be empty.');
    }

    const comment = {
      id: 'pcom_' + Date.now(),
      problemId,
      authorId: user.id,
      authorDisplayName: user.displayName,
      isAnonymous: !!isAnonymous,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!this.data.problemComments) this.data.problemComments = [];
    this.data.problemComments.push(comment);
    this.persist();

    // Notify problem author
    if (prob.authorId && prob.authorId !== user.id) {
      this.createNotification(prob.authorId, {
        title: 'New Comment on Campus Problem',
        content: `${isAnonymous ? 'A student' : user.displayName} commented on "${prob.title.slice(0, 35)}..."`,
        type: 'problem_comment',
        link: '/campus-problems',
      });
    }

    return comment;
  }

  getProblemSolutions(userOrProblemId, maybeProblemId) {
    let user = userOrProblemId;
    let problemId = maybeProblemId;
    if (!maybeProblemId && typeof userOrProblemId === 'string') {
      problemId = userOrProblemId;
      user = null;
    }
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    if (user && !this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied to view solutions for restricted hostel problem.');
    }

    return (this.data.problemSolutions || [])
      .filter((s) => s.problemId === problemId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  proposeSolution(user, problemId, solutionData) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    if (!this.canAccessProblemScope(user, prob.scope)) {
      throw new Error('Access denied to propose solution for restricted hostel problem.');
    }

    const {
      title,
      description,
      suggestedLocations = '',
      itemsList = '',
      powerMaintenanceNeeds = '',
      whoManagesIt = '',
      paymentOptions = '',
      openQuestionsForAdministration = '',
    } = solutionData;

    if (!title || !description) {
      throw new Error('Solution title and description are required.');
    }

    const solution = {
      id: 'sol_' + Date.now(),
      problemId,
      title: title.trim(),
      description: description.trim(),
      authorId: user.id,
      authorDisplayName: user.displayName,
      convertedIdeaId: null,
      details: {
        suggestedLocations: suggestedLocations.trim(),
        itemsList: itemsList.trim(),
        powerMaintenanceNeeds: powerMaintenanceNeeds.trim(),
        whoManagesIt: whoManagesIt.trim(),
        paymentOptions: paymentOptions.trim(),
        openQuestionsForAdministration: openQuestionsForAdministration.trim(),
      },
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    if (!this.data.problemSolutions) this.data.problemSolutions = [];
    this.data.problemSolutions.push(solution);

    // Update status to Solution Proposed if currently Open
    if (prob.status === 'Open') {
      prob.status = 'Solution Proposed';
    }

    this.persist();

    // Notify author of the problem
    if (prob.authorId && prob.authorId !== user.id) {
      this.createNotification(prob.authorId, {
        title: 'Solution Proposed for Your Problem',
        content: `${user.displayName} proposed a solution: "${title.slice(0, 35)}..."`,
        type: 'problem_solution',
        link: '/campus-problems',
      });
    }

    return solution;
  }

  convertSolutionToIdea(user, problemId, solutionId) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    const sol = (this.data.problemSolutions || []).find((s) => s.id === solutionId);
    if (!sol) throw new Error('Solution not found');

    // If already converted, return existing idea link
    if (sol.convertedIdeaId) {
      const existing = this.data.ideas.find((i) => i.id === sol.convertedIdeaId);
      if (existing) return existing;
    }

    const newIdea = {
      id: 'idea_' + Date.now(),
      title: `[INNOVATION] ${sol.title}`,
      description: `${sol.description} (Originating from campus feedback on: "${prob.title}").`,
      category: prob.category === 'Hostel Life' ? 'General Innovation' : prob.category,
      tags: ['Campus Solutions', prob.category, 'Student Project'],
      authorId: sol.authorId,
      authorDisplayName: sol.authorDisplayName,
      seekingTeammates: true,
      neededSkills: ['Prototyping', 'Implementation', 'Peer Collaboration'],
      status: 'Active',
      likesCount: 5,
      createdAt: new Date().toISOString(),
      isDemo: false,
      linkedProblemId: prob.id,
      linkedSolutionId: sol.id,
    };

    // Persist and link back
    this.data.ideas.unshift(newIdea);
    sol.convertedIdeaId = newIdea.id;
    prob.convertedIdeaId = newIdea.id;
    this.persist();

    return newIdea;
  }

  reportProblem(user, problemId, reason) {
    if (!user) throw new Error('Authentication required');
    const prob = (this.data.campusProblems || []).find((p) => p.id === problemId);
    if (!prob) throw new Error('Problem not found');

    if (!prob.reportedByUserIds) prob.reportedByUserIds = [];
    if (!prob.reportedByUserIds.includes(user.id)) {
      prob.reportedByUserIds.push(user.id);
      prob.reportsCount = (prob.reportsCount || 0) + 1;
      this.persist();
    }

    return { reported: true, reportsCount: prob.reportsCount };
  }
}

export const db = new Database();
