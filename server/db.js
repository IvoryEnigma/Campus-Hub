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
      notificationPreferences: {
        announcements: true,
        hostel: true,
        opportunities: true,
        mentions: true,
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
  // phone numbers, emails, or personal private details.
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
      // Private fields (regNumber, email, phone, branch, admissionBatch) omitted
    };
  }

  // Private profile access - only accessible by the owner themselves or authorized admin
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
    // Disallow tampering with role, verified status, or hostelAssignment from normal profile update
    if (updates.displayName) user.displayName = updates.displayName.trim();
    this.persist();
    return this.getPrivateUserProfile(userId);
  }

  // --- Communities & Access Control ---
  checkCommunityAccess(user, community) {
    if (!community) return false;
    if (!community.isRestricted) return true;

    // Restricted Hostel access check
    if (community.category === 'hostel') {
      if (!user) return false;
      // Admins have campus-wide access
      if (user.role === 'admin') return true;

      // Wardens have access only to their assigned hostel
      if (user.role === 'warden') {
        return user.assignedHostel === community.hostelAssignment;
      }

      // Students have access strictly to their verified hostel assignment
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
      // Strictly filter out messages from communities the user has no access to
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

    // Attach enriched metadata
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
      // Faculty can publish official in departments or FE
      return comm.category === 'department' || comm.category === 'fe';
    }

    if (user.role === 'club_lead') {
      // Club leads can publish official only in their managed club
      return comm.name === user.managedClub;
    }

    if (user.role === 'warden') {
      // Warden can publish official only in their assigned hostel
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

    // Role check for official notices
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

    // Verification check: Only verified alumni, faculty, or admin can post verified opportunities
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
      rawUser.verified = false; // Must be reviewed by admin
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
}

export const db = new Database();
