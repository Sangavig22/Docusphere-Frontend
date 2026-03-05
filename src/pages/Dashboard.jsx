import DashboardLayout from "../components/Layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import { FileText, Clock, Star, UploadCloud } from "lucide-react";

function Dashboard() {
  return (
    <DashboardLayout
      pageTitle="Dashboard"
      pageSubtitle="Welcome back! Here's an overview of your documents."
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Documents"
            value="128"
            subtitle="Total Files"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Recent"
            value="50"
            subtitle="Last 7 days"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Starred"
            value="12"
            subtitle="Important files"
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            title="Uploads"
            value="47"
            subtitle="+5 this week"
            icon={<UploadCloud className="w-5 h-5" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;