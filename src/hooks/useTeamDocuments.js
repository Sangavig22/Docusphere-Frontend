import { useState, useEffect, useCallback } from 'react';
import { teamsApi } from '../services/teamsApi';

/**
 * Fetches documents for a specific team.
 * Replaces useDocumentMock
 */
export function useTeamDocuments(teamId) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!teamId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await teamsApi.getTeamDocuments(teamId);
      const data = response?.data ?? response;
      
      const list = Array.isArray(data) ? data : (data?.items || data?.documents || []);
      setDocuments(list);
    } catch (err) {
      console.error('[useTeamDocuments] fetch error:', err);
      setError(err.message || 'Failed to load team documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (documentId) => {
    try {
      await teamsApi.deleteTeamDocument(teamId, documentId);
      setDocuments((prev) => prev.filter((d) => (d.id ?? d._id) !== documentId));
    } catch (err) {
      console.error("Failed to delete document", err);
      throw err;
    }
  }, [teamId]);

  return { documents, isLoading, error, refetch: fetchDocuments, deleteDocument };
}
