import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import { FileText, Clock, Star, UploadCloud } from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";

function Dashboard() {
  const { documents, counts } = useDashboardData();

  return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Documents"
            value={counts.total.toString()}
            subtitle="Total Files"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Recent"
            value={counts.recent.toString()}
            subtitle="Last 7 days"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Starred"
            value={counts.starred.toString()}
            subtitle="Important files"
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            title="Uploads"
            value={counts.uploads.toString()}
            subtitle="+4 this week"
            icon={<UploadCloud className="w-5 h-5" />}
          />
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