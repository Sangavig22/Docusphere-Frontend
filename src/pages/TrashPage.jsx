import { useMemo, useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { DocumentCard, DocumentRow, DocumentsToolbar } from "../components/documents";
import { TRASH_ACTIONS } from "../components/documents/DocumentActionsMenu";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import useDocumentActions from "../hooks/useDocumentActions";
import { usePaginatedMyDocuments } from "../hooks/usePaginatedMyDocuments";

export default function TrashPage() {
  const {
    query,
    setQuery,
    filterType,
    setFilterType,
    sortKey,
    setSortKey,
    page,
    setPage,
    documents: trashDocuments,
    pagination,
    loading,
    error,
    reload,
  } = usePaginatedMyDocuments({ scope: "trash" });
  const { modalState, loadingAction, handleAction, closeModal, submitModal } = useDocumentActions({
    onSuccess: reload,
  });
  const [viewMode, setViewMode] = useState("grid");

  const visibleDocs = useMemo(() => trashDocuments, [trashDocuments]);

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-text">Recycle Bin</h2>
        <Trash2 size={18} className="text-muted" />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Items in the Recycle Bin are kept for <span className="font-semibold">30 days</span>, then
          permanently deleted automatically. You can restore or permanently delete a file anytime before
          that.
        </p>
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

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted shadow-sm">
          Loading trash documents...
        </div>
      ) : null}

      <div className={loading ? "pointer-events-none opacity-60" : ""}>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 pb-72 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDocs.map((d) => (
              <DocumentCard
                key={d.id}
                doc={d}
                onToggleStar={() => {}}
                onAction={handleAction}
                actions={TRASH_ACTIONS}
                disableActions={d.isOwner === false}
                showStar={false}
                menuPushContent
                denseMenu
                menuClassName="w-52 p-0"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-72">
            {visibleDocs.map((d) => (
              <DocumentRow
                key={d.id}
                doc={d}
                onToggleStar={() => {}}
                onAction={handleAction}
                actions={TRASH_ACTIONS}
                disableActions={d.isOwner === false}
                showStar={false}
                menuPushContent
                denseMenu
                menuClassName="w-52 p-0"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted shadow-sm">
        <span>
          Page {pagination.page} of {pagination.totalPages} (showing {visibleDocs.length} on this page,{" "}
          {pagination.totalItems} total)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={loading || page >= pagination.totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted shadow-sm">
          <div>{error}</div>
          <button
            type="button"
            onClick={reload}
            className="mt-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-text"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && visibleDocs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted shadow-sm">
          Recycle bin is empty.
        </div>
      ) : null}

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
    </div>
  );
}
