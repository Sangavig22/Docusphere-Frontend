import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentCard, DocumentRow, DocumentsToolbar } from "../components/documents";
import { DEFAULT_DOCUMENT_ACTIONS } from "../components/documents/DocumentActionsMenu";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import ShareModal from "../components/documents/share/ShareModal";
import SecureFileModal from "../components/documents/secure/SecureFileModal";
import ProtectedMoveBlockedModal from "../components/documents/secure/ProtectedMoveBlockedModal";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import useDocumentActions from "../hooks/useDocumentActions";
import { usePaginatedMyDocuments } from "../hooks/usePaginatedMyDocuments";


export default function MyDocumentsPage() {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    filterType,
    setFilterType,
    sortKey,
    setSortKey,
    page,
    setPage,
    documents: docs,
    pagination,
    loading,
    error,
    reload,
    toggleStar,
  } = usePaginatedMyDocuments({ personalOnly: true });
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
        reload();
      }
    },
  });
  const [viewMode, setViewMode] = useState("grid");
  const visibleDocs = useMemo(() => docs, [docs]);
  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text">All Documents</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          onClick={() => navigate("/uploads")}
        >
          <Plus size={18} />
          New File
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <DocumentsToolbar
          query={query}
          onQueryChange={setQuery}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDocs.map((d) => (
            <DocumentCard
              key={d.id}
              doc={d}
              onToggleStar={toggleStar}
              onAction={handleAction}
              actions={DEFAULT_DOCUMENT_ACTIONS}
              disableActions={d.isOwner === false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleDocs.map((d) => (
            <DocumentRow
              key={d.id}
              doc={d}
              onToggleStar={toggleStar}
              onAction={handleAction}
              actions={DEFAULT_DOCUMENT_ACTIONS}
              disableActions={d.isOwner === false}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted shadow-sm">
        <span>
          Page {pagination.page} of {pagination.totalPages} (showing {visibleDocs.length} on this page, {pagination.totalItems} total)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={loading || page >= pagination.totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted shadow-sm">
          Loading documents...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div>{error}</div>
          <button
            type="button"
            onClick={reload}
            className="mt-2 rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && visibleDocs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted shadow-sm">
          No documents found.
        </div>
      ) : null}
      {/* Keep generic modal for rename/move/delete style actions. */}
      <DocumentActionModal
        open={
          modalState.open &&
          modalState.type !== "share" &&
          modalState.type !== "secure_file" &&
          modalState.type !== "protected_move_block"
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
      {/* Render dedicated share UI only for share action state. */}
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
    </div>
  );
}

