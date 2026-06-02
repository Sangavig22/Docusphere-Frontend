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
      return { bg: "bg-surface", fg: "text-muted", ring: "ring-slate-100" };
  }
}

export default function DocumentCard({
  doc,
  onToggleStar,
  onAction,
  actions,
  disableActions = false,
  menuPortal = false,
  menuPushContent = false,
  menuClassName = "",
  denseMenu = false,
  showStar = true,
  actionKeys,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const type = useMemo(() => normalizeDocumentType(doc.type), [doc.type]);
  const formatLabel = useMemo(() => formatDocumentFormat(doc.type, doc.name), [doc.type, doc.name]);
  const styles = typeStyles(type);

  return (
    <div className="group relative flex h-full min-h-[170px] flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-border hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={["flex h-11 w-11 items-center justify-center rounded-xl ring-1", styles.bg, styles.ring].join(" ")}>
          <FileText className={styles.fg} size={20} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {showStar && (
            <button
              type="button"
              disabled={disableActions}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-amber-500"
              aria-label={doc.starred ? "Unstar document" : "Star document"}
              onClick={() => onToggleStar?.(doc.id)}
            >
              <Star size={18} className={doc.starred ? "fill-amber-400 text-amber-400" : ""} />
            </button>
          )}

          <div className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              disabled={disableActions}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                menuOpen ? "bg-card text-text" : "text-muted hover:bg-card hover:text-text",
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
                actionKeys={actionKeys}
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
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <h3 className="truncate pr-2 text-sm font-semibold text-text" title={doc.name}>
          {doc.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>{formatBytes(doc.sizeBytes)}</span>
          <span className="text-muted">•</span>
          <span>{formatRelativeTime(doc.updatedAt)}</span>
            {/* added uploadedBy field in document and showing it in card if available  for team*/} 

          {doc.uploadedBy && doc.uploadedBy !== "-" && (
            <>
              <span className="text-muted">•</span>
              <span className="truncate max-w-[120px]">By {doc.uploadedBy}</span>
            </>
          )}

        </div>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <span className="inline-flex shrink-0 items-center rounded-md bg-card px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {formatLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
