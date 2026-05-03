import { useState, useEffect } from "react";
import { fetchMyDocuments } from "../services/documentsService";

export function useDashboardData() {
  const [counts, setCounts] = useState({
    total: 0,
    recent: 0,
    starred: 0,
    uploads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      setIsLoading(true);
      try {
        // To get accurate counts, we can fetch the first page of each filtered set
        // and use the totalItems from the pagination metadata.
        
        const [totalRes, recentRes, starredRes] = await Promise.all([
          fetchMyDocuments({ page: 1, pageSize: 1 }),
          fetchMyDocuments({ page: 1, pageSize: 1, recentDays: 7 }),
          fetchMyDocuments({ page: 1, pageSize: 1, starred: true })
        ]);

        setCounts({
          total: totalRes.pagination.totalItems,
          recent: recentRes.pagination.totalItems,
          starred: starredRes.pagination.totalItems,
          uploads: recentRes.pagination.totalItems, // Using recent as a proxy for weekly uploads
        });
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return {
    counts,
    isLoading,
    error,
  };
}
