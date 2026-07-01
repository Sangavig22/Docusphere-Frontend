import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Star } from "lucide-react";
import { DocumentCard } from "../documents";
import { DEFAULT_DOCUMENT_ACTIONS } from "../documents/DocumentActionsMenu";

export default function DocumentPreviewSection({
  recentItems = [],
  starredItems = [],
  recentLoading = false,
  starredLoading = false,
  recentError = null,
  starredError = null,
  recentViewAllTo = "/recent",
  starredViewAllTo = "/starred",
  onAction,
  onToggleStarRecent,
  onToggleStarStarred,
}) {
  const [activeTab, setActiveTab] = useState("recent");

  const isLoading =
    activeTab === "recent" ? recentLoading : starredLoading;

  const error =
    activeTab === "recent" ? recentError : starredError;

  const items =
    activeTab === "recent" ? recentItems : starredItems;

  const viewAllTo =
    activeTab === "recent"
      ? recentViewAllTo
      : starredViewAllTo;

  const emptyMessage =
    activeTab === "recent"
      ? "No recent documents found."
      : "No starred documents yet.";

  const toggleStar =
    activeTab === "recent" ? onToggleStarRecent : onToggleStarStarred;

  const tabStyle = (tab) =>
    `flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
      activeTab === tab
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <section className="w-full max-w-full min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("recent")}
            className={tabStyle("recent")}
          >
            <Clock size={16} />
            Recent
          </button>

          <button
            onClick={() => setActiveTab("starred")}
            className={tabStyle("starred")}
          >
            <Star size={16} />
            Starred
          </button>
        </div>
        
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-600"></div>
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : null}

        {/* Documents */}
        {!isLoading && !error && items.length > 0 ? (
          <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
            <div className="grid grid-rows-2 grid-flow-col gap-4 pb-2 w-max">
              {items.map((doc) => (
                <div
                  key={doc.id}
                  className="h-full w-[260px] shrink-0"
                >
                  <DocumentCard
                    doc={doc}
                    onToggleStar={toggleStar}
                    onAction={onAction}
                    actions={DEFAULT_DOCUMENT_ACTIONS}
                    disableActions={doc.isOwner === false}
                    menuPortal
                    denseMenu
                    menuClassName="w-52 p-0"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
