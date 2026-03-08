import { useState, useMemo } from "react";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import { FileText, Clock, Star, UploadCloud } from "lucide-react";

function Dashboard() {
  const [documents] = useState([
    { id: 1, name: "Q4_Report_2024.pdf", uploaded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), starred: true },
    { id: 2, name: "Q3_Report_2024.pdf", uploaded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), starred: false },
    { id: 3, name: "Budget_2024.xlsx", uploaded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), starred: true },
    { id: 4, name: "Presentation_2024.pptx", uploaded: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), starred: false },
    { id: 5, name: "Meeting_Notes.docx", uploaded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), starred: true },
    { id: 6, name: "Project_Plan.pdf", uploaded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), starred: false },
    { id: 7, name: "Design_Assets.zip", uploaded: new Date(Date.now() - 45 * 60 * 60 * 1000), starred: true },
    // Add more mock documents as needed
  ]);

  // Calculate counts dynamically
  const counts = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: documents.length,
      recent: documents.filter(doc => doc.uploaded >= sevenDaysAgo).length,
      starred: documents.filter(doc => doc.starred).length,
      uploads: documents.length, // You can customize this based on your logic
    };
  }, [documents]);

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