import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { DASHBOARD_CONFIG } from "../config/dashboardsConfig";
import { usePaginatedMyDocuments } from "../hooks/usePaginatedMyDocuments";
import useDocumentActions from "../hooks/useDocumentActions";
import StatCard from "../components/ui/StatCard";
import DocumentPreviewSection from "../components/dashboard/DocumentPreviewSection";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import ShareModal from "../components/documents/share/ShareModal";
import SecureFileModal from "../components/documents/secure/SecureFileModal";
import ProtectedMoveBlockedModal from "../components/documents/secure/ProtectedMoveBlockedModal";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import VersionHistoryModal from "../components/documents/version/VersionHistoryModal";

const RECENT_PREVIEW_LIMIT = 8;
const RECENT_DAYS = 7;

function Dashboard() {
  const navigate = useNavigate();
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

  const {
    modalState,
    verifyState,
    loadingAction,
    handleAction,
    closeModal,
    closeVerifyModal,
    submitModal,
    shareWithPeople,
    enableDocumentProtection,
    changeDocumentPassword,
    removeDocumentProtection,
    resetDocumentPassword,
    submitVerifyPassword,
  } = useDocumentActions({
    onSuccess: (type, doc) => {
      if (type === "preview" && doc) {
        navigate(`/documents/${doc.id}/preview`);
      } else {
        refreshPreviewLists();
      }
    },
  });

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

  return (
    <div className="min-w-0 w-full space-y-6 overflow-x-hidden">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Error loading dashboard: {error}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? DASHBOARD_CONFIG.user.statCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-3 w-20 rounded-full bg-slate-200" />
                  <div className="h-8 w-16 rounded-full bg-slate-200" />
                  <div className="h-3 w-28 rounded-full bg-slate-200" />
                </div>
              </div>
            ))
          : DASHBOARD_CONFIG.user.statCards.map((card) => (
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
        open={
          modalState.open &&
          modalState.type !== "share" &&
          modalState.type !== "secure_file" &&
          modalState.type !== "protected_move_block" &&
          modalState.type !== "version_history"
        }
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
      <ProtectedMoveBlockedModal
        open={modalState.open && modalState.type === "protected_move_block"}
        documentName={modalState.doc?.name}
        loading={loadingAction}
        onClose={closeModal}
        onManageProtection={submitModal}
      />
      <SecureFileModal
        open={modalState.open && modalState.type === "secure_file"}
        document={modalState.doc}
        loading={loadingAction}
        onClose={closeModal}
        onEnableProtection={enableDocumentProtection}
        onChangePassword={changeDocumentPassword}
        onRemoveProtection={removeDocumentProtection}
        onResetPassword={resetDocumentPassword}
      />
      <PasswordVerifyModal
        open={verifyState.open}
        documentName={verifyState.doc?.name}
        loading={loadingAction}
        error={verifyState.error}
        onClose={closeVerifyModal}
        onUnlock={submitVerifyPassword}
      />
      <VersionHistoryModal
        open={modalState.open && modalState.type === "version_history"}
        document={modalState.doc}
        userTeamRole={modalState.doc?.teamRole || ""}
        onClose={closeModal}
        onRestored={() => refreshPreviewLists()}
      />
    </div>
  );
}

export default Dashboard;