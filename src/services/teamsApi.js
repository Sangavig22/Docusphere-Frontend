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

};
