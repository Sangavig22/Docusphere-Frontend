import { useState } from "react";
import { Plus, Users, FileText, Share2 } from "lucide-react";

function QuickActions() {
  const [actions] = useState([
    { id: 1, icon: Plus, label: "Create Document", color: "bg-blue-50" },
    { id: 2, icon: Users, label: "Invite Team", color: "bg-green-50" },
    { id: 3, icon: FileText, label: "View Templates", color: "bg-purple-50" },
    { id: 4, icon: Share2, label: "Share Files", color: "bg-orange-50" },
  ]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          className={`p-4 rounded-lg ${action.color} hover:shadow-md transition-shadow`}
        >
          <action.icon className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">{action.label}</p>
        </button>
      ))}
    </div>
  );
}

export default QuickActions;
