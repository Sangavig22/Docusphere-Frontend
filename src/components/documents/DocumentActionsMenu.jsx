import { useMemo } from "react";
import {
  Download,
  Eye,
  Share2,
  Pencil,
  FolderInput,
  Copy,
  Shield,
  History,
  Trash2,
} from "lucide-react";

function Item({ icon: Icon, label, danger = false, onClick, dense = false }) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center gap-2 rounded-lg text-left text-sm transition-colors",
        dense ? "px-2.5 py-1.5" : "px-3 py-2",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      onClick={onClick}
      role="menuitem"
    >
      <Icon size={16} className={danger ? "text-rose-600" : "text-slate-500"} />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function DocumentActionsMenu({ doc, onAction, dense = false }) {
  const actions = useMemo(
    () => [
      { key: "preview", label: "Preview", icon: Eye },
      { key: "download", label: "Download", icon: Download },
      { key: "share", label: "Share", icon: Share2 },
      { key: "rename", label: "Rename", icon: Pencil },
      { key: "move", label: "Move to", icon: FolderInput },
      { key: "duplicate", label: "Duplicate", icon: Copy },
      { key: "secure", label: "Secure the file", icon: Shield },
      { key: "versions", label: "Version History", icon: History },
      { key: "trash", label: "Move to trash", icon: Trash2, danger: true },
    ],
    [],
  );

  return (
    <div className={dense ? "py-0.5" : "py-1"}>
      {actions.map((a) => (
        <Item
          key={a.key}
          icon={a.icon}
          label={a.label}
          danger={a.danger}
          dense={dense}
          onClick={() => onAction?.(a.key, doc)}
        />
      ))}
    </div>
  );
}

