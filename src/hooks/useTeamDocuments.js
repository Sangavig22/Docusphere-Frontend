import { useState, useEffect, useCallback, useRef } from 'react';
import { teamsApi } from '../services/teamsApi';
import { starDocument, unstarDocument } from '../services/documentsService';
import { toast } from 'react-toastify';
import authService from '../services/authService';

/**
 * Fetches documents for a specific team.
 * Replaces useDocumentMock
 */
// The function to resolve the document owner ID from various possible fields in the document object.
const resolveDocumentOwnerId = (doc) => {
  const candidates = [
    doc?.ownerId,
    doc?.ownerUserId,
    doc?.uploadedById,
    doc?.createdById,
    doc?.creatorId,
    doc?.userId,
    doc?.createdBy?.id,
    doc?.createdBy?.userId,
    doc?.uploadedBy?.id,
    doc?.uploadedBy?.userId,
  ];

  for (const candidate of candidates) {
    const value = candidate == null ? "" : String(candidate).trim();
    if (value) return value;
  }

  return "";
};

export function useTeamDocuments(teamId) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const documentsRef = useRef([]);

  const fetchDocuments = useCallback(async () => {
    if (!teamId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await teamsApi.getTeamDocuments(teamId);
      const data = response?.data ?? response;
      
      const list = Array.isArray(data) ? data : (data?.items || data?.documents || []);
      const currentUserId = authService.getUserId();
      // Mark each document with isOwner flag for action menu enable/disable.
      const enrichedList = list.map((doc) => {
        const ownerId = resolveDocumentOwnerId(doc);
        return {
          ...doc,
          isOwner: ownerId !== "" && String(ownerId) === String(currentUserId),
        };
      });
      setDocuments(enrichedList);
      documentsRef.current = enrichedList;
    } catch (err) {
      console.error('[useTeamDocuments] fetch error:', err);
      setError(err.message || 'Failed to load team documents');
      setDocuments([]);
      documentsRef.current = [];
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

  const toggleStar = useCallback(
    async (id) => {
      const currentDoc = documentsRef.current.find((d) => d.id === id);
      const prevStarred = Boolean(currentDoc?.starred);
      const nextStarred = !prevStarred;

      // Optimistic update for immediate UI response.
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, starred: nextStarred } : doc)));

      try {
        if (nextStarred) await starDocument(id);
        else await unstarDocument(id);
        await fetchDocuments();
      } catch (err) {
        // Revert on failure.
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? { ...doc, starred: prevStarred } : doc)),
        );
        setError(err instanceof Error ? err.message : "Unable to update star.");
        toast.error("Failed to update star status");
      }
    },
    [fetchDocuments],
  );

  return { documents, isLoading, error, refetch: fetchDocuments, deleteDocument, toggleStar };
}
