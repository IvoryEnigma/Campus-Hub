// API Client for AIT Campus Hub

let currentUserId = localStorage.getItem('ait_user_id') || 'user_stu_ananya';

export function getActiveUserId() {
  return currentUserId;
}

export function setActiveUserId(userId) {
  currentUserId = userId;
  localStorage.setItem('ait_user_id', userId);
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Personas
  getMe: () => apiRequest('/api/auth/me'),
  switchUser: (userId) => {
    setActiveUserId(userId);
    return apiRequest('/api/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
  getDemoAccounts: () => apiRequest('/api/users/demo-accounts'),
  getPublicProfile: (id) => apiRequest(`/api/users/public/${id}`),
  getMyProfile: () => apiRequest('/api/users/profile'),
  updateProfile: (data) =>
    apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Communities
  getCommunities: () => apiRequest('/api/communities'),
  getCommunity: (slug) => apiRequest(`/api/communities/${slug}`),
  getCommunityMessages: (slug, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/communities/${slug}/messages${query ? `?${query}` : ''}`);
  },

  // Messages
  createMessage: (data) =>
    apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  togglePin: (id) => apiRequest(`/api/messages/${id}/pin`, { method: 'POST' }),
  toggleSave: (id) => apiRequest(`/api/messages/${id}/save`, { method: 'POST' }),
  markRead: (id) => apiRequest(`/api/messages/${id}/read`, { method: 'POST' }),
  getReplies: (id) => apiRequest(`/api/messages/${id}/replies`),
  createReply: (id, content) =>
    apiRequest(`/api/messages/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Inbox
  getInbox: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/inbox${query ? `?${query}` : ''}`);
  },

  // Innovation Hub
  getIdeas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/ideas${query ? `?${query}` : ''}`);
  },
  createIdea: (data) =>
    apiRequest('/api/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleLikeIdea: (id) => apiRequest(`/api/ideas/${id}/like`, { method: 'POST' }),
  getIdeaComments: (id) => apiRequest(`/api/ideas/${id}/comments`),
  addIdeaComment: (id, content) =>
    apiRequest(`/api/ideas/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  getProjects: () => apiRequest('/api/projects'),

  // Opportunities
  getOpportunities: () => apiRequest('/api/opportunities'),
  createOpportunity: (data) =>
    apiRequest('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  applyToOpportunity: (id, data) =>
    apiRequest(`/api/opportunities/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyApplications: () => apiRequest('/api/applications/my'),

  // Alumni Verification Workflow
  registerAlumni: (data) =>
    apiRequest('/api/alumni/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPendingAlumni: () => apiRequest('/api/alumni/pending'),
  reviewAlumni: (id, approve) =>
    apiRequest(`/api/alumni/verify/${id}`, {
      method: 'POST',
      body: JSON.stringify({ approve }),
    }),

  // Notifications
  getNotifications: () => apiRequest('/api/notifications'),
  markNotificationRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: 'POST' }),

  // Campus Problems (Phase 3)
  getProblems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/problems${query ? `?${query}` : ''}`);
  },
  getProblem: (id) => apiRequest(`/api/problems/${id}`),
  createProblem: (data) =>
    apiRequest('/api/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  voteProblem: (id) => apiRequest(`/api/problems/${id}/vote`, { method: 'POST' }),
  updateProblemStatus: (id, status) =>
    apiRequest(`/api/problems/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  getProblemComments: (id) => apiRequest(`/api/problems/${id}/comments`),
  addProblemComment: (id, data) =>
    apiRequest(`/api/problems/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProblemSolutions: (id) => apiRequest(`/api/problems/${id}/solutions`),
  proposeProblemSolution: (id, data) =>
    apiRequest(`/api/problems/${id}/solutions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  convertProblemSolutionToIdea: (id, solutionId) =>
    apiRequest(`/api/problems/${id}/convert-to-idea`, {
      method: 'POST',
      body: JSON.stringify({ solutionId }),
    }),
  reportProblem: (id, reason) =>
    apiRequest(`/api/problems/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
