import { request } from '../api/apiClient.js';

export const teamsApi = {
  // ─── User-facing team endpoints ─────────────────────────────────────────────

  /** GET /api/teams  – teams the current user belongs to */
  getMyTeams: () => request('/teams'),

  /** GET /api/teams/:id */
  getTeamById: (id) => request(`/teams/${id}`),

  /** GET /api/teams/:id/members */
  getTeamMembers: (id) => request(`/teams/${id}/members`),

  /** GET /api/teams/:id/documents */
  getTeamDocuments: (id) => request(`/teams/${id}/documents`),

    /** GET /api/teams/:id/members/status */
  getTeamMemberStatuses: (id) => request(`/teams/${id}/members/status`),

  /** POST /api/teams/:id/presence — record team page activity for online status */
  recordTeamPresence: (id) =>
    request(`/teams/${id}/presence`, { method: 'POST' }),

  /** GET /api/teams/:id/chat/messages?limit=:limit */
  getTeamChatMessages: (id, limit = 50) => request(`/teams/${id}/chat/messages?limit=${limit}`),

  /** POST /api/teams/:id/chat/messages */
  sendTeamChatMessage: (id, payload) =>
    request(`/teams/${id}/chat/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** PUT /api/teams/:teamId/chat/messages/:messageId - Edit a message */
  editTeamChatMessage: (teamId, messageId, payload) =>
    request(`/teams/${teamId}/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  /** DELETE /api/teams/:teamId/chat/messages/:messageId - Delete a message */
  deleteTeamChatMessage: (teamId, messageId, scope = 'for-me') =>
    request(`/teams/${teamId}/chat/messages/${messageId}?scope=${scope}`, {
      method: 'DELETE',
    }),

  /** GET /api/teams/:teamId/chat/messages/:messageId/info - Get message info */
  getTeamChatMessageInfo: (teamId, messageId) =>
    request(`/teams/${teamId}/chat/messages/${messageId}/info`),

  /** POST /api/teams/:teamId/chat/receipts — batch delivery/read receipts */
  postTeamChatReceipts: (teamId, payload) =>
    request(`/teams/${teamId}/chat/receipts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** POST /api/teams */
  createTeam: (data) =>
    request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** DELETE /api/teams/:id */
  deleteTeam: (id) =>
    request(`/teams/${id}`, { method: 'DELETE' }),

  /** POST /api/teams/:id/members  – invite / add a member */
  addMember: (teamId, memberData) =>
    request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  /** DELETE /api/teams/:teamId/members/:memberId */
  removeMember: (teamId, memberId) =>
    request(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),

  /** DELETE /api/teams/:teamId/documents/:documentId */
  deleteTeamDocument: (teamId, documentId) =>
    request(`/teams/${teamId}/documents/${documentId}`, { method: 'DELETE' }),

  /** PUT /api/teams/:teamId/members/:memberId/role */
  updateMemberRole: (teamId, memberId, role) =>
    request(`/teams/${teamId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  /** POST /api/teams/:teamId/transfer-leader */
  transferTeamLeader: (teamId, newLeaderId) =>
    request(`/teams/${teamId}/transfer-leader`, {
      method: 'POST',
      body: JSON.stringify({ newLeaderId }),
    }),

  /** PUT /api/teams/:teamId/members/:memberId/chat-block?blocked=:boolean */
  updateMemberChatBlock: (teamId, memberId, blocked) =>
    request(`/teams/${teamId}/members/${memberId}/chat-block?blocked=${blocked}`, {
      method: 'PUT',
    }),

    // ─── Admin team endpoints ────────────────────────────────────────────────────

  /** GET /api/admin/teams  – all teams (admin view) */
  getAllTeams: () => request('/admin/teams'),

  /** DELETE /api/admin/teams/:id */
  deleteAdminTeam: (id) =>
    request(`/admin/teams/${id}`, { method: 'DELETE' }),

  /** GET /api/admin/teams/:id */
  getAdminTeamById: (id) => request(`/admin/teams/${id}`),

  /** GET /api/admin/teams/:id/members */
  getAdminTeamMembers: (id) => request(`/admin/teams/${id}/members`),

  /** GET /api/admin/documents?teamId=:id */
  getAdminTeamDocuments: (id) => request(`/admin/documents?teamId=${id}`),

  /** DELETE /api/admin/documents/:documentId */
  deleteAdminDocument: (documentId) =>
    request(`/admin/documents/${documentId}`, { method: 'DELETE' }),

  /** POST /api/admin/teams/:teamId/transfer-leader */
  transferAdminLeader: (teamId, newLeaderId) =>
    request(`/admin/teams/${teamId}/transfer-leader`, {
      method: 'POST',
      body: JSON.stringify({ newLeaderId }),
    }),

  /** DELETE /api/admin/teams/:teamId/members/:memberId */
  removeAdminMember: (teamId, memberId) =>
    request(`/admin/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),

  /** POST /api/admin/teams/:teamId/members */
  addAdminMember: (teamId, memberData) =>
    request(`/admin/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  /** PUT /api/admin/teams/:teamId/members/:memberId/role */
  updateAdminMemberRole: (teamId, memberId, role) =>
    request(`/admin/teams/${teamId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  /** POST /api/admin/teams/merge */
  mergeTeams: (sourceTeamId, targetTeamId, newTeamName, newLeaderId, moveDocuments = true) =>
    request('/admin/teams/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceTeamId, targetTeamId, newTeamName, newLeaderId, moveDocuments }),
    }),

  // ─── Admin dashboard endpoints ───────────────────────────────────────────────

  /** GET /api/admin/dashboard/stats */
  getDashboardStats: () => request('/admin/dashboard/stats'),

  /** GET /api/admin/dashboard/monthly-uploads */
  getMonthlyUploads: () => request('/admin/dashboard/monthly-uploads'),

  /** GET /api/admin/dashboard/top-teams */
  getTopTeams: () => request('/admin/dashboard/top-teams'),

  /** POST /api/admin/teams */
  createAdminTeam: (data) =>
    request('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** GET /api/admin/users */
  getAdminUsers: () => request('/admin/users'),
};


