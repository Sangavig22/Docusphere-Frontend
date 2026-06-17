import { useState, useEffect, useCallback } from 'react';
import { teamsApi } from '../services/teamsApi';

/**
 * Fetches all teams for the Admin Team Management page.
 * Uses GET /api/admin/teams
 */
export function useAdminTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamsApi.getAllTeams();
      // Support both { data: [...] } and plain arrays
      const list = response?.data ?? response;
      setTeams(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[useAdminTeams] fetch error:', err);
      setError(err.message || 'Failed to load teams');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const deleteTeam = useCallback(async (teamId) => {
    await teamsApi.deleteAdminTeam(teamId);
    // Optimistically remove from local state
    setTeams((prev) => prev.filter((t) => (t.id ?? t.teamId) !== teamId));
  }, []);

  return { teams, isLoading, error, deleteTeam, refetch: fetchTeams };
}
