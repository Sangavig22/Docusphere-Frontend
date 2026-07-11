import { FileText, MessageSquare, Users } from "lucide-react";

export default function TeamTabs({
  activeTab,
  setActiveTab,
  chatUnreadCount = 0,
  chatMentionCount = 0,
  isAdmin = false,
}) {
  const tabStyle = (tab) =>
    `flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
      activeTab === tab
        ? "border-blue-600 text-blue-600 dark:text-blue-400"
        : "border-transparent text-muted hover:text-text"
    }`;

  return (
    <div className="border-b border-border px-6">
      <div className="flex gap-6">
        <button type="button" onClick={() => setActiveTab("Documents")} className={tabStyle("Documents")}>
          <FileText size={16} />
          Documents
        </button>

        <button type="button" onClick={() => setActiveTab("Members")} className={tabStyle("Members")}>
          <Users size={16} />
          Members
        </button>

        {!isAdmin && (
          <button type="button" onClick={() => setActiveTab("Chat")} className={tabStyle("Chat")}>
            <MessageSquare size={16} />
            Chat
            {chatMentionCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                @
              </span>
            )}
            {chatUnreadCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {chatUnreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
