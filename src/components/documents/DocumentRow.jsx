import { useMemo, useRef, useState } from "react";
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


export default function DocumentRow({
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
  isSelected = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const type = useMemo(() => normalizeDocumentType(doc.type), [doc.type]);
  const formatLabel = useMemo(() => formatDocumentFormat(doc.type, doc.name), [doc.type, doc.name]);
  const styles = useMemo(() => typeStyles(type), [type]);
  const canOpenPreview = typeof onAction === "function";

  function triggerPreview() {
    if (!canOpenPreview) return;
    onAction("preview", doc);
  }

  return (
    <div
      className={[
        "relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card",
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
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
              styles.bg,
              styles.ring,
            ].join(" ")}
          >
            <FileText size={18} className={styles.fg} />
          </div>
          <DocumentProtectedBadge doc={doc} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900" title={doc.name}>
            {doc.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="inline-flex shrink-0 items-center rounded-md bg-card px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {formatLabel}
            </span>
            <span className="text-muted">•</span>
            <span>{formatRelativeTime(doc.updatedAt)}</span>
            {doc.uploadedBy && doc.uploadedBy !== "-" ? (
              <>
                <span className="text-muted">•</span>
                <span className="max-w-[150px] truncate">By {doc.uploadedBy}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden w-28 text-right text-sm font-medium text-slate-600 sm:block">
        {formatBytes(doc.sizeBytes)}
      </div>

      {showStar ? (
        <button
          type="button"
          disabled={disableActions}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-amber-500"
          aria-label={doc.starred ? "Unstar document" : "Star document"}
          onClick={() => onToggleStar?.(doc.id)}
        >
          <Star size={18} className={doc.starred ? "fill-amber-400 text-amber-400" : ""} />
        </button>
      ) : null}

      <div className="relative shrink-0">
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
          className={[menuPortal ? "" : "right-0 top-10", menuClassName].join(" ")}
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
  );
}
