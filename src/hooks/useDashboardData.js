import { useState, useEffect, useContext } from "react";
import { DocumentsContext } from "./useDocumentsStore";

export function useDashboardData() {
  const { documents = [] } = useContext(DocumentsContext) || {};
  const [counts, setCounts] = useState({
    total: 0,
    recent: 0,
    starred: 0,
    uploads: 0,
  });

  useEffect(() => {
    if (!documents || documents.length === 0) {
      setCounts({
        total: 0,
        recent: 0,
        starred: 0,
        uploads: 0,
      });
      return;
    }

    // Calculate counts
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentDocs = documents.filter(doc => {
      const docDate = new Date(doc.updatedAt || doc.createdAt);
      return docDate >= sevenDaysAgo;
    });

    const starredDocs = documents.filter(doc => doc.starred);

    setCounts({
      total: documents.length,
      recent: recentDocs.length,
      starred: starredDocs.length,
      uploads: recentDocs.length,
    });
  }, [documents]);

  return {
    documents,
    counts,
  };
}
