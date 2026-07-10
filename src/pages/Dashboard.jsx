import { useCallback } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { DASHBOARD_CONFIG } from "../config/dashboardsConfig";
import { usePaginatedMyDocuments } from "../hooks/usePaginatedMyDocuments";
import useDocumentActions from "../hooks/useDocumentActions";
import StatCard from "../components/ui/StatCard";
import DocumentPreviewSection from "../components/dashboard/DocumentPreviewSection";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import ShareModal from "../components/documents/share/ShareModal";

const RECENT_PREVIEW_LIMIT = 10;
const RECENT_DAYS = 7;

function Dashboard() {
  const { counts, isLoading, error } = useDashboardData();
  const {
    documents: recentDocuments,
    loading: recentLoading,
    error: recentError,
    reload: reloadRecent,
    toggleStar: toggleStarRecentBase,
  } = usePaginatedMyDocuments({ recentDays: RECENT_DAYS, pageSize: RECENT_PREVIEW_LIMIT });
  const {
    documents: starredDocuments,
    loading: starredLoading,
    error: starredError,
    reload: reloadStarred,
    toggleStar: toggleStarStarredBase,
  } = usePaginatedMyDocuments({ starred: true, pageSize: RECENT_PREVIEW_LIMIT });

  const refreshPreviewLists = useCallback(() => {
    reloadRecent();
    reloadStarred();
  }, [reloadRecent, reloadStarred]);

  const { modalState, loadingAction, handleAction, closeModal, submitModal, shareWithPeople } =
    useDocumentActions({ onSuccess: refreshPreviewLists });

  const onToggleStarRecent = useCallback(
    async (id) => {
      await toggleStarRecentBase(id);
      reloadStarred();
    },
    [toggleStarRecentBase, reloadStarred],
  );

  const onToggleStarStarred = useCallback(
    async (id) => {
      await toggleStarStarredBase(id);
      reloadRecent();
    },
    [toggleStarStarredBase, reloadRecent],
  );

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
    <div className="min-w-0 w-full space-y-6 overflow-x-hidden">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_CONFIG.user.statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={String(counts[card.countKey] ?? 0)}
            subtitle={card.subtitle}
            icon={card.icon}
            variant="dashboard"
          />
        ))}
      </div>

      {/* Recent & Starred Preview */}
      <DocumentPreviewSection
        recentItems={recentDocuments.slice(0, RECENT_PREVIEW_LIMIT)}
        starredItems={starredDocuments.slice(0, RECENT_PREVIEW_LIMIT)}
        recentLoading={recentLoading}
        starredLoading={starredLoading}
        recentError={recentError}
        starredError={starredError}
        recentViewAllTo="/recent"
        starredViewAllTo="/starred"
        onAction={handleAction}
        onToggleStarRecent={onToggleStarRecent}
        onToggleStarStarred={onToggleStarStarred}
      />

      <DocumentActionModal
        open={modalState.open && modalState.type !== "share"}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        value={modalState.value}
        options={modalState.options}
        confirmText={modalState.confirmText}
        confirmVariant={modalState.confirmVariant}
        loading={loadingAction}
        onClose={closeModal}
        onConfirm={submitModal}
      />
      <ShareModal
        open={modalState.open && modalState.type === "share"}
        document={modalState.doc}
        loading={loadingAction}
        onClose={closeModal}
        onShareWithPeople={shareWithPeople}
      />
    </div>
  );
}

export default Dashboard;