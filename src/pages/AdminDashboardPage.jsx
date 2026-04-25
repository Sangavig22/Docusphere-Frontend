import React, { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import AdminChartLine from "../components/ui/ChartLine";
import AdminChartBar from "../components/ui/ChartBar";
import { AdminDashboardService } from "../services/AdminDashboardService";
import { DASHBOARD_CONFIG } from "../config/dashboardsConfig";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await AdminDashboardService.getDashboardStats();
        
        // Handle different possible response structures depending on backend format
        const statsData = response?.data?.data || response?.data || response;
        
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return null;

  const config = DASHBOARD_CONFIG.admin; // ✅ ADD THIS

  return (
    <div className="space-y-8">

      {/* Stat Cards Section - Back at the top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.statCards.map((card) => {
          const growth = stats[card.growthKey];
          const growthDisplay = growth !== undefined && growth !== null
            ? `${growth > 0 ? '+' : ''}${Math.round(growth)}%`
            : '+0%';

          return (
            <StatCard
              key={card.title}
              title={card.title}
              value={
                stats[card.dataKey]?.toLocaleString?.() ??
                stats[card.dataKey] ??
                0
              }
              subtitle={
                card.subtitle ||
                `${growthDisplay} from last month`
              }
              growth={growth || null}
              variant="admin"
              type={card.type}
            />
          );
        })}
      </div>

      {/* Charts Section - Now below Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Team Chart (Top Active Team) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {config.charts[1].title}
            </h3>
            <p className="text-slate-500 text-sm">
              {config.charts[1].description}
            </p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <AdminChartBar />
          </div>
        </div>

        {/* Monthly Uploads Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {config.charts[0].title}
            </h3>
            <p className="text-slate-500 text-sm">
              {config.charts[0].description}
            </p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <AdminChartLine />
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboardPage;
