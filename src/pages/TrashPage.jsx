import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { DocumentCard, DocumentRow, DocumentsToolbar, normalizeDocumentType } from "../components/documents";
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
    documents: trashDocuments,
    loading,
    error,
    reload,
  } = usePaginatedMyDocuments({ scope: "trash" });
  const { modalState, loadingAction, handleAction, closeModal, submitModal } = useDocumentActions({
    onSuccess: reload,
  });
  const [viewMode, setViewMode] = useState("grid");

  const visibleDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trashDocuments
      .filter((d) => {
        const type = normalizeDocumentType(d.type);
        const matchesType = filterType === "all" ? true : type === filterType;
        const matchesQuery = `${d.name} ${d.category ?? ""}`.toLowerCase().includes(q);
        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        if (sortKey === "name_asc") return a.name.localeCompare(b.name);
        if (sortKey === "name_desc") return b.name.localeCompare(a.name);
        if (sortKey === "size_desc") return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [trashDocuments, query, filterType, sortKey]);

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Recycle Bin</h2>
        <Trash2 size={18} className="text-slate-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
              onToggleStar={() => {}}
              onAction={handleAction}
              actions={TRASH_ACTIONS}
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
              onToggleStar={() => {}}
              onAction={handleAction}
              actions={TRASH_ACTIONS}
              disableActions={d.isOwner === false}
            />
          ))}
        </div>
      )}

      {visibleDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          Recycle bin is empty.
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Loading trash documents...
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

      <DocumentActionModal
        open={modalState.open}
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
