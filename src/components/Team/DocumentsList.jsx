import { useMemo } from "react";
import {
  Download,
  Pencil,
  FolderInput,
  Copy,
  RotateCcw,
  Trash2,
  Eye,
  Share2,
  Lock,
  Clock,
} from "lucide-react";
import { DocumentCard, DocumentRow, normalizeDocumentType } from "../documents";

const resolveUploader = (doc) => {
  if (typeof doc?.uploadedBy === "string" && doc.uploadedBy.trim()) return doc.uploadedBy.trim();
  if (typeof doc?.uploadedByName === "string" && doc.uploadedByName.trim()) return doc.uploadedByName.trim();
  if (typeof doc?.uploaderName === "string" && doc.uploaderName.trim()) return doc.uploaderName.trim();
  if (typeof doc?.createdByName === "string" && doc.createdByName.trim()) return doc.createdByName.trim();
  if (typeof doc?.createdBy === "string" && doc.createdBy.trim()) return doc.createdBy.trim();
  if (typeof doc?.ownerName === "string" && doc.ownerName.trim()) return doc.ownerName.trim();
  if (typeof doc?.ownerFullName === "string" && doc.ownerFullName.trim()) return doc.ownerFullName.trim();
  if (typeof doc?.uploadedByEmail === "string" && doc.uploadedByEmail.trim()) return doc.uploadedByEmail.trim();

  if (doc?.createdBy && typeof doc.createdBy === "object") {
    const fromCreatedBy =
      doc.createdBy.fullName || doc.createdBy.name || doc.createdBy.email || doc.createdBy.userName;
    if (typeof fromCreatedBy === "string" && fromCreatedBy.trim()) return fromCreatedBy.trim();
  }

  if (doc?.uploadedBy && typeof doc.uploadedBy === "object") {
    const fromObject =
      doc.uploadedBy.fullName || doc.uploadedBy.name || doc.uploadedBy.email || doc.uploadedBy.userName;
    if (typeof fromObject === "string" && fromObject.trim()) return fromObject.trim();
  }

  return "-";
};

const normalizeDoc = (doc, index) => {
  const fileName = doc?.name || doc?.fileName || `Document ${index + 1}`;
  const sizeBytes = Number(doc?.sizeBytes ?? doc?.size ?? 0);
  const updatedAt = doc?.updatedAt || doc?.updated_at || doc?.createdAt || new Date().toISOString();

  return {
    ...doc,
    id: doc?.id ?? `doc-${index}`,
    name: fileName,
    sizeBytes,
    updatedAt,
    type: doc?.type || doc?.fileType || fileName.split(".").pop() || "other",
    starred: Boolean(doc?.starred),
    uploadedBy: resolveUploader(doc),
  };
};

// Map action keys to action objects with icons
const resolveActions = (actionKeys) => {
  if (!actionKeys || !Array.isArray(actionKeys)) {
    return [];
  }

  const actionMap = {
    rename: { key: "rename", label: "Rename", icon: Pencil },
    move: { key: "move", label: "Move to", icon: FolderInput },
    duplicate: { key: "duplicate", label: "Duplicate", icon: Copy },
    download: { key: "download", label: "Download", icon: Download },
    trash: { key: "trash", label: "Move to trash", icon: Trash2, danger: true },
    restore: { key: "restore", label: "Restore", icon: RotateCcw },
    delete_permanently: { key: "delete_permanently", label: "Delete permanently", icon: Trash2, danger: true },
    preview: { key: "preview", label: "Preview", icon: Eye },
    share: { key: "share", label: "Share", icon: Share2 },
    secure: { key: "secure", label: "Secure", icon: Lock },
    versions: { key: "versions", label: "Versions", icon: Clock },
  };

  return actionKeys.map((key) => actionMap[key] || { key, label: key, icon: () => null }).filter(Boolean);
};

export default function DocumentsList({
  documents = [],
  viewMode = "grid",
  searchQuery = "",
  filterType = "all",
  sortKey = "name_asc",
  actionKeys,
  actions,
  onDelete,
  onAction,
  onToggleStar,
  showStar = true,
}) {
  const resolvedActions = useMemo(() => {
    // If actions prop is provided directly, use it; otherwise resolve from actionKeys
    if (actions && Array.isArray(actions) && actions.length > 0) {
      return actions;
    }
    return resolveActions(actionKeys);
  }, [actions, actionKeys]);

  const visibleDocs = useMemo(() => {
    const normalized = documents.map(normalizeDoc);
    const q = searchQuery.trim().toLowerCase();

    let out = normalized.filter((d) => {
      const type = normalizeDocumentType(d.type);
      const matchesType = filterType === "all" ? true : type === filterType;
      const matchesQuery = !q ? true : `${d.name}`.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    out = out.slice().sort((a, b) => {
      if (sortKey === "name_desc") return b.name.localeCompare(a.name);
      if (sortKey === "size_desc") return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0);
      if (sortKey === "updated_desc") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    return out;
  }, [documents, searchQuery, filterType, sortKey]);

  if (!visibleDocs.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 text-sm">No documents uploaded yet</p>
      </div>
    );
  }

  const handleAction = (key, doc) => {
    // If parent provided a handler, use it (this covers rename/duplicate/move/download/etc.)
    if (typeof onAction === "function") {
      onAction(key, doc);
      return;
    }

    if (key === "trash" && onDelete) {
      onDelete(doc);
      return;
    }

    // Fallback: no-op for actions not handled here
  };

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {visibleDocs.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            onAction={(key) => handleAction(key, doc)}
            onToggleStar={onToggleStar}
            actions={resolvedActions}
            disableActions={doc.isOwner === false}            showStar={showStar}          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleDocs.map((doc) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          onAction={(key) => handleAction(key, doc)}
          onToggleStar={onToggleStar}
          actions={resolvedActions}
          disableActions={doc.isOwner === false}          showStar={showStar}        />
      ))}
    </div>
  );
}