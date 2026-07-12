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

      {/* Storage Usage Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Platform Storage Usage</h3>
          <p className="text-slate-500 text-sm">Supabase storage bucket status and quota utilization</p>
        </div>

        {(() => {
          const usedBytes = stats.usedStorageBytes || 0;
          const quotaBytes = stats.storageQuotaBytes || 1073741824; // 1 GB default
          const freeBytes = Math.max(0, quotaBytes - usedBytes);
          const usedPercent = Math.min(100, (usedBytes / quotaBytes) * 100);
          const freePercent = Math.max(0, 100 - usedPercent);

          const formatBytes = (bytes) => {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
          };

          const radius = 60;
          const strokeWidth = 10;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (freePercent / 100) * circumference;

          return (
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="freeStorageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" /> {/* Emerald-500 */}
                        <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
                      </linearGradient>
                    </defs>
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="url(#freeStorageGrad)"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {Math.round(freePercent)}%
                    </span>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Free
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Details */}
              <div className="flex-1 max-w-md w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium">Used Space</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">
                      {formatBytes(usedBytes)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {usedPercent.toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium">Free Space</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">
                      {formatBytes(freeBytes)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {freePercent.toFixed(1)}% available
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Total Quota Limit</span>
                    <span className="font-semibold text-slate-700">{formatBytes(quotaBytes)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-800"
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Platform storage is calculated based on document files stored in your Supabase storage bucket. The storage warning alerts will be sent to administrators if the usage crosses 70% or 90% of the quota limit.
                </p>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}

export default AdminDashboardPage;
