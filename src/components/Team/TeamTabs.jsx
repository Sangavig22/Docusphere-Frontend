import { FileText, Users } from "lucide-react";

export default function TeamTabs({ activeTab, setActiveTab }) {
  const tabStyle = (tab) =>
    `flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
      activeTab === tab
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="border-b border-slate-200 px-6">
      <div className="flex gap-6">
        <button onClick={() => setActiveTab("Documents")} className={tabStyle("Documents")}>
          <FileText size={16} />
          Documents
        </button>

        <button onClick={() => setActiveTab("Members")} className={tabStyle("Members")}>
          <Users size={16} />
          Members
        </button>
      </div>
    </div>
  );
}