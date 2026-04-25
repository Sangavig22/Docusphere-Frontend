import { useMemo, useState, useRef } from "react";
import { FileText, MoreVertical, Star } from "lucide-react";
import Popover from "./Popover";
import DocumentActionsMenu from "./DocumentActionsMenu";
import {
  formatBytes,
  formatDocumentFormat,
  formatRelativeTime,
  normalizeDocumentType,
} from "../../utils/documentUtils.js";

function typeStyles(type) {
  switch (type) {
    case "pdf":
      return { bg: "bg-rose-50", fg: "text-rose-600", ring: "ring-rose-100" };
    case "word":
      return { bg: "bg-blue-50", fg: "text-blue-600", ring: "ring-blue-100" };
    case "sheet":
      return { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-100" };
    case "powerpoint":
      return { bg: "bg-orange-50", fg: "text-orange-600", ring: "ring-orange-100" };
    case "image":
      return { bg: "bg-violet-50", fg: "text-violet-600", ring: "ring-violet-100" };
    default:
      return { bg: "bg-slate-50", fg: "text-slate-600", ring: "ring-slate-100" };
  }
}

export default function DocumentRow({
  doc,
  onToggleStar,
  onAction,
  actions,
  disableActions = false,
  menuPortal = false,
  menuPushContent = false,
  menuClassName = "",
  denseMenu = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const type = useMemo(() => normalizeDocumentType(doc.type), [doc.type]);
  const formatLabel = useMemo(() => formatDocumentFormat(doc.type, doc.name), [doc.type, doc.name]);
  const styles = useMemo(() => typeStyles(type), [type]);

  return (
    <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={["flex h-10 w-10 items-center justify-center rounded-xl ring-1", styles.bg, styles.ring].join(" ")}>
          <FileText size={18} className={styles.fg} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900" title={doc.name}>
              {doc.name}
            </div>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {formatLabel}
            </span>
            <span className="text-slate-300">•</span>
            <span>{formatRelativeTime(doc.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-28 text-right text-sm font-medium text-slate-600">
        {formatBytes(doc.sizeBytes)}
      </div>

      <button
        type="button"
        disabled={disableActions}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-amber-500"
        aria-label={doc.starred ? "Unstar document" : "Star document"}
        onClick={() => onToggleStar?.(doc.id)}
      >
        <Star size={18} className={doc.starred ? "fill-amber-400 text-amber-400" : ""} />
      </button>

      <div className="relative shrink-0">
        <button
          ref={menuButtonRef}
          type="button"
          disabled={disableActions}
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            menuOpen ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
          ].join(" ")}
          aria-label="Open document menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreVertical size={18} />
        </button>
        <Popover
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorRef={menuButtonRef}
          portal={menuPortal}
          side={menuPortal ? "bottom" : "auto"}
          pushContent={menuPushContent}
          scrollable={!menuPortal}
          className={[
            menuPortal ? "" : "right-0 top-10",
            menuClassName,
          ].join(" ")}
        >
          <DocumentActionsMenu
            doc={doc}
            dense={denseMenu}
            actions={actions}
            disabled={disableActions}
            onAction={(key, d) => {
              setMenuOpen(false);
              onAction?.(key, d);
            }}
          />
        </Popover>
      </div>
    </div>
  );
}

