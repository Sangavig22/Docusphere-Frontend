import { useState, useEffect, useCallback } from 'react';
import { teamsApi } from '../services/teamsApi';

/**
 * Fetches team details and members for a specific team.
 * Uses GET /api/teams/:id and GET /api/teams/:id/members.
 * Fallbacks to Admin API if standard fails (or you could pass an isAdmin flag)
 */
export function useTeamMemberDetails(teamId) {
  const [teamData, setTeamData] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!teamId) return;

    setIsLoading(true);
    setError(null);
    try {
            const tResp = await teamsApi.getTeamById(teamId);
            const tData = tResp?.data ?? tResp;
            const mResp = await teamsApi.getTeamMembers(teamId);
            const mData = mResp?.data ?? mResp;

      setTeamData(tData);
      setMembers(Array.isArray(mData) ? mData : []);
    } catch (err) {
      console.error('[useTeamMemberDetails] fetch error:', err);
      setError(err.message || 'Failed to load team details');
      setTeamData(null);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const addMember = useCallback(async (memberData) => {
      try {
          const resp = await teamsApi.addMember(teamId, memberData);
          const newMember = resp?.data ?? resp;
          await fetchDetails();
          return newMember;
      } catch (err) {
          console.error("Failed to add member", err);
          throw err;
      }
  }, [teamId, fetchDetails]);

  const deleteMember = useCallback(async (memberId) => {
    try {
        await teamsApi.removeMember(teamId, memberId);
        await fetchDetails();
    } catch(err) {
        console.error("Failed to remove member", err);
        throw new Error(err.message || "Failed to remove member");
    }
  }, [teamId]);

  const updateMemberRole = useCallback(async (member, newRole) => {
      const memberId = member.userId ?? member.id ?? member._id;
      try {
          await teamsApi.updateMemberRole(teamId, memberId, newRole);
          // Optimistically update
          setMembers(prev => prev.map(m => {
              const id = m.userId ?? m.id ?? m._id;
              if (id === memberId) {
                  return { ...m, role: newRole };
              }
              return m;
          }));
      } catch(err) {
          console.error("Failed to update role", err);
          throw err;
      }
  }, [teamId]);

  const transferLeader = useCallback(async (newLeaderId) => {
      try {
          throw new Error("Leader transfer is not available in the current backend API");
      } catch(err) {
          console.error("Failed to transfer leader", err);
          throw err;
      }
  }, [teamId, fetchDetails]);

  return { 
      teamData, 
      members, 
      isLoading, 
      error, 
      refetch: fetchDetails,
      addMember,
      deleteMember,
      updateMemberRole,
      transferLeader
  };
}
