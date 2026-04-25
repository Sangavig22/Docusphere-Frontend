import { useEffect, useState } from "react";
import { AdminDashboardService } from "../services/AdminDashboardService";

export const useDashboardChartData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AdminDashboardService.getDashboardStats();
        const data = response?.data?.data || response?.data || response;
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dashboardData, loading, error };
};
