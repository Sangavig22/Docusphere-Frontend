import { useMemo } from "react";
import {
  Eye,
  Share2,
  Download,
  Pencil,
  FolderInput,
  Copy,
  RotateCcw,
  Trash2,
} from "lucide-react";

export const DEFAULT_DOCUMENT_ACTIONS = [
  // Order here is reflected directly in card/row action menus.
  { key: "preview", label: "Preview", icon: Eye },
  { key: "rename", label: "Rename", icon: Pencil },
  { key: "move", label: "Move to", icon: FolderInput },
  { key: "duplicate", label: "Duplicate", icon: Copy },
  { key: "download", label: "Download", icon: Download },
  { key: "share", label: "Share", icon: Share2 },
  { key: "trash", label: "Move to trash", icon: Trash2, danger: true },
];

export const TRASH_ACTIONS = [
  { key: "restore", label: "Restore", icon: RotateCcw },
  { key: "delete_permanently", label: "Delete permanently", icon: Trash2, danger: true },
];

// Admin Team Functions
export const ADMIN_ACTIONS = [
  { key: "preview", label: "Preview", icon: Eye },
  { key: "trash", label: "Delete", icon: Trash2, danger: true },
];

function Item({ icon: Icon, label, danger = false, onClick, dense = false, disabled = false }) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center gap-2 rounded-lg text-left text-sm transition-colors",
        dense ? "px-2.5 py-1.5" : "px-3 py-2",
        disabled
          ? "cursor-not-allowed text-muted"
          : danger
            ? "text-rose-600 hover:bg-rose-50"
            : "text-text hover:bg-card",
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      <Icon
        size={16}
        className={disabled ? "text-muted" : danger ? "text-rose-600" : "text-muted"}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function DocumentActionsMenu({
  doc,
  onAction,
  dense = false,
  actions = DEFAULT_DOCUMENT_ACTIONS,
  actionKeys,
  disabled = false,
}) {
  const safeActions = useMemo(() => {
    const list = actions || DEFAULT_DOCUMENT_ACTIONS;
    // actionKeys lets parent screens show a curated subset.
    if (!Array.isArray(actionKeys) || actionKeys.length === 0) return list;
    return list.filter((item) => actionKeys.includes(item.key));
  }, [actions, actionKeys]);

  return (
    <div className={dense ? "py-0.5" : "py-1"}>
      {safeActions.map((a) => (
        <Item
          key={a.key}
          icon={a.icon}
          label={a.label}
          danger={a.danger}
          dense={dense}
          disabled={disabled}
          onClick={() => onAction?.(a.key, doc)}
        />
      ))}
    </div>
  );
}

