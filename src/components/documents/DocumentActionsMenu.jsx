import { useMemo } from "react";
import {
  Download,
  Pencil,
  FolderInput,
  Copy,
  RotateCcw,
  Trash2,
} from "lucide-react";

export const DEFAULT_DOCUMENT_ACTIONS = [
  { key: "rename", label: "Rename", icon: Pencil },
  { key: "move", label: "Move to", icon: FolderInput },
  { key: "duplicate", label: "Duplicate", icon: Copy },
  { key: "download", label: "Download", icon: Download },
  { key: "trash", label: "Move to trash", icon: Trash2, danger: true },
];

export const TRASH_ACTIONS = [
  { key: "restore", label: "Restore", icon: RotateCcw },
  { key: "delete_permanently", label: "Delete permanently", icon: Trash2, danger: true },
];

function Item({ icon: Icon, label, danger = false, onClick, dense = false, disabled = false }) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center gap-2 rounded-lg text-left text-sm transition-colors",
        dense ? "px-2.5 py-1.5" : "px-3 py-2",
        disabled
          ? "cursor-not-allowed text-slate-400"
          : danger
            ? "text-rose-600 hover:bg-rose-50"
            : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      <Icon
        size={16}
        className={disabled ? "text-slate-400" : danger ? "text-rose-600" : "text-slate-500"}
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
  disabled = false,
}) {
  const safeActions = useMemo(() => actions || DEFAULT_DOCUMENT_ACTIONS, [actions]);

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

