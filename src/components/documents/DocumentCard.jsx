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
import DocumentProtectedBadge from "./secure/DocumentProtectedBadge";

function typeStyles(type) {
  switch (type) {
    case "pdf":
      return { bg: "bg-rose-50 dark:bg-rose-500/15", fg: "text-rose-600 dark:text-rose-400", ring: "ring-rose-100 dark:ring-rose-500/25" };
    case "word":
      return { bg: "bg-blue-50 dark:bg-blue-500/15", fg: "text-blue-600 dark:text-blue-400", ring: "ring-blue-100 dark:ring-blue-500/25" };
    case "sheet":
      return { bg: "bg-emerald-50 dark:bg-emerald-500/15", fg: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-100 dark:ring-emerald-500/25" };
    case "powerpoint":
      return { bg: "bg-orange-50 dark:bg-orange-500/15", fg: "text-orange-600 dark:text-orange-400", ring: "ring-orange-100 dark:ring-orange-500/25" };
    case "image":
      return { bg: "bg-violet-50 dark:bg-violet-500/15", fg: "text-violet-600 dark:text-violet-400", ring: "ring-violet-100 dark:ring-violet-500/25" };
    default:
      return { bg: "bg-surface", fg: "text-muted", ring: "ring-border" };
  }
}

export default function DocumentCard({
  doc,
  onToggleStar,
  onAction,
  actions,
  disableActions = false,
  menuPortal = true,
  menuPushContent = false,
  menuClassName = "",
  denseMenu = false,
  showStar = true,
  actionKeys,
  isSelected=false
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const type = useMemo(() => normalizeDocumentType(doc.type), [doc.type]);
  const formatLabel = useMemo(() => formatDocumentFormat(doc.type, doc.name), [doc.type, doc.name]);
  const styles = typeStyles(type);
  const canOpenPreview = typeof onAction === "function";
  const menuDisabled =
    disableActions && (!Array.isArray(actionKeys) || actionKeys.length === 0);

  function triggerPreview() {
    if (!canOpenPreview) return;
    onAction("preview", doc);
  }

  return (
    <div
      className={[
        "group relative flex h-full min-h-[170px] flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-slate-300 hover:shadow-md dark:hover:border-slate-500",
        canOpenPreview ? "cursor-pointer" : "",
        isSelected
          ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50/60 dark:ring-blue-400 dark:border-blue-500 dark:bg-blue-500/10"
          : "",
      ].join(" ")}
      data-document-id={doc.id}
      role={canOpenPreview ? "button" : undefined}
      tabIndex={canOpenPreview ? 0 : undefined}
      onClick={(event) => {
        if (!canOpenPreview) return;
        const target = event.target;
        if (target instanceof Element && target.closest("button,a,input,label,textarea,select")) return;
        triggerPreview();
      }}
      onKeyDown={(event) => {
        if (!canOpenPreview) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerPreview();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative shrink-0">
          <div
            className={[
              "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
              styles.bg,
              styles.ring,
            ].join(" ")}
          >
            <FileText className={styles.fg} size={20} />
          </div>
          <DocumentProtectedBadge doc={doc} />
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
              disabled={menuDisabled}
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
              side="auto"
              pushContent={menuPushContent}
              scrollable
              className={[menuPortal ? "" : "right-0 top-10", menuClassName].join(" ")}
            >
              <DocumentActionsMenu
                doc={doc}
                dense={denseMenu}
                actionKeys={actionKeys}
                actions={actions}
                disabled={menuDisabled}
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
          {doc.uploadedBy && doc.uploadedBy !== "-" ? (
            <>
              <span className="text-muted">•</span>
              <span className="truncate max-w-[120px]">By {doc.uploadedBy}</span>
            </>
          ) : null}
        </div>
        <div className="mt-auto pt-3">
          <span className="inline-flex shrink-0 items-center rounded-md bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {formatLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
