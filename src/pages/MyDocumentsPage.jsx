import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentCard, DocumentRow, DocumentsToolbar, normalizeDocumentType } from "../components/documents";
import { useDocumentsStore } from "../hooks/useDocumentsStore";


export default function MyDocumentsPage() {
  const navigate = useNavigate();
  const { documents: docs, toggleStar, removeDocument } = useDocumentsStore();

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortKey, setSortKey] = useState("updated_desc");
  const [viewMode, setViewMode] = useState("grid");
  const [versionDoc, setVersionDoc] = useState(null);

  const visibleDocs = useMemo(() => {
    const q = query.trim().toLowerCase();

    let out = docs.filter((d) => {
      const type = normalizeDocumentType(d.type);
      const matchesType = filterType === "all" ? true : type === filterType;
      const matchesQuery = !q
        ? true
        : `${d.name} ${d.category ?? ""}`.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    out = out.slice().sort((a, b) => {
      if (sortKey === "name_asc") return a.name.localeCompare(b.name);
      if (sortKey === "name_desc") return b.name.localeCompare(a.name);
      if (sortKey === "size_desc") return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return out;
  }, [docs, query, filterType, sortKey]);

  function onAction(key, doc) {
    if (key === "versions") {
      setVersionDoc(doc);
      return;
    }
    if (key === "download") {
   
      return;
    }
    if (key === "trash") {
      removeDocument(doc.id);
    }
  }

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">All Documents</h2>
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
            <DocumentCard key={d.id} doc={d} onToggleStar={toggleStar} onAction={onAction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleDocs.map((d) => (
            <DocumentRow key={d.id} doc={d} onToggleStar={toggleStar} onAction={onAction} />
          ))}
        </div>
      )}

      {visibleDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          No documents found.
        </div>
      ) : null}

      {versionDoc ? (
        <DocumentVersionHistory doc={versionDoc} onClose={() => setVersionDoc(null)} />
      ) : null}
    </div>
  );
}

