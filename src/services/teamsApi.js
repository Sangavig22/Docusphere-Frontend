import { request } from '../api/apiClient.js';
import authService from './authService.js';
import { API_BASE_URL } from '../config/api.js';

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


