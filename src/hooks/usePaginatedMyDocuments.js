import { useCallback, useEffect, useRef, useState } from "react";
import {
  BACKEND_SINGLE_TYPE_FILTERS,
  DOCUMENTS_PAGE_SIZE,
  DEFAULT_DOCUMENTS_SORT,
} from "../constants/documents";
import { fetchMyDocuments, starDocument, unstarDocument } from "../services/documentsService";
import { matchesDocumentFilter } from "../utils/documentUtils.js";

function isPersonalSpaceDocument(doc) {
  const teamId = doc?.teamId ?? doc?.teamID ?? doc?.team?.id;
  return teamId == null || String(teamId).trim() === "";
}

export function usePaginatedMyDocuments(options = {}) {
  const { starred, recentDays, scope, pageSize = DOCUMENTS_PAGE_SIZE, personalOnly = false } = options;
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortKey, setSortKey] = useState(DEFAULT_DOCUMENTS_SORT);
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState([]);
  const documentsRef = useRef(documents);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [query, filterType, sortKey]);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const reload = useCallback(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchMyDocuments({
          page,
          pageSize,
          query,
          filterType,
          sortKey,
          starred,
          recentDays,
          scope,
          signal: controller.signal,
        });
        let docs =
          filterType && filterType !== "all" && !BACKEND_SINGLE_TYPE_FILTERS.has(filterType)
            ? result.documents.filter((doc) => matchesDocumentFilter(doc.type, filterType, doc.name))
            : result.documents;
        if (personalOnly) {
          docs = docs.filter(isPersonalSpaceDocument);
        }

        const usesClientFilter =
          personalOnly ||
          (filterType && filterType !== "all" && !BACKEND_SINGLE_TYPE_FILTERS.has(filterType));
        let nextPagination = result.pagination;
        if (usesClientFilter && result.documents.length > 0) {
          const keepRatio = docs.length / result.documents.length;
          const adjustedTotal = Math.max(
            docs.length,
            Math.round(result.pagination.totalItems * keepRatio),
          );
          nextPagination = {
            ...result.pagination,
            totalItems: adjustedTotal,
            totalPages: Math.max(1, Math.ceil(adjustedTotal / result.pagination.pageSize)),
          };
        }

        setDocuments(docs);
        setPagination(nextPagination);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load documents.");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [page, pageSize, query, filterType, sortKey, starred, recentDays, scope, personalOnly]);

  useEffect(() => {
    const cancel = reload();
    return () => cancel?.();
  }, [reload]);

  const toggleStar = useCallback(
    async (id) => {
      const currentDoc = documentsRef.current.find((d) => d.id === id);
      const prevStarred = Boolean(currentDoc?.starred);
      const nextStarred = !prevStarred;

      // Optimistic update for immediate UI response.
      setDocuments((prev) => {
        if (starred && !nextStarred) {
          return prev.filter((doc) => doc.id !== id);
        }
        return prev.map((doc) => (doc.id === id ? { ...doc, starred: nextStarred } : doc));
      });

      try {
        if (nextStarred) await starDocument(id);
        else await unstarDocument(id);
        await reload();
      } catch (err) {
        // Revert on failure.
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? { ...doc, starred: prevStarred } : doc)),
        );
        setError(err instanceof Error ? err.message : "Unable to update star.");
      }
    },
    [reload, starred],
  );

  const removeDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setPagination((prev) => ({
      ...prev,
      totalItems: Math.max(0, prev.totalItems - 1),
    }));
  }, []);

  return {
    query,
    setQuery,
    filterType,
    setFilterType,
    sortKey,
    setSortKey,
    page,
    setPage,
    documents,
    pagination,
    loading,
    error,
    reload,
    toggleStar,
    removeDocument,
  };
}
