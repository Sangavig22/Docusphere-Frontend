import StatCard from "../components/ui/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import { FileText, Clock, Star, UploadCloud } from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { DASHBOARD_CONFIG } from "../config/dashboardsConfig";

// Icon mapping for dashboard
const iconMap = {
  documents: <FileText className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  starred: <Star className="w-5 h-5" />,
  upload: <UploadCloud className="w-5 h-5" />,
};

function Dashboard() {
  const { counts, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_CONFIG.user.statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={counts[card.countKey].toString()}
            subtitle={card.subtitle}
            icon={iconMap[card.icon]}
            variant="dashboard"
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}

export default Dashboard;