import { Download, Eye } from "lucide-react";
import VersionStatusBadges from "./VersionStatusBadges";
import { formatBytes, formatRelativeTime, formatVersionDateTime } from "../../../utils/documentUtils";
import { formatEditorRole, formatVersionLabel } from "../../../utils/versionUtils";

export default function VersionTimelineCard({
  version,
  isFirst = false,
  canRestore = false,
  actionLoading = "",
  onView,
  onDownload,
  onRestore,
}) {
  const viewBusy = actionLoading === `view-${version.id}`;
  const downloadBusy = actionLoading === `download-${version.id}`;
  const editorRoleLabel = formatEditorRole(version.editorRole);
  const showRestore = canRestore && !version.isCurrent;

  return (
    <article
      className={[
        "min-w-0 flex-1 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        version.isCurrent ? "border-blue-200 ring-1 ring-blue-100" : "border-border",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold text-text">
                Version {version.versionNumber}
                <span className="ml-1.5 text-sm font-medium text-muted">({formatVersionLabel(version.versionNumber)})</span>
              </h4>
              {isFirst && version.isCurrent ? (
                <span className="text-xs font-medium text-blue-600">← Current</span>
              ) : null}
            </div>
            <VersionStatusBadges version={version} compact />
          </div>
          <span className="shrink-0 text-xs text-muted">{formatBytes(version.fileSize)}</span>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-text">
            Edited by:{" "}
            <span className="font-medium">{version.editedBy}</span>
            {editorRoleLabel ? <span className="text-muted"> ({editorRoleLabel})</span> : null}
          </p>
          <p className="text-muted" title={formatVersionDateTime(version.editedAt)}>
            Edited {formatRelativeTime(version.editedAt)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Summary</p>
          <p className="mt-1 text-sm text-text">{version.changeSummary || "Document edited"}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={() => onView(version)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={14} />
              {viewBusy ? "Opening..." : "View Version"}
            </button>
            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={() => onDownload(version)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              {downloadBusy ? "Downloading..." : "Download Version"}
            </button>
          </div>

          {showRestore ? (
            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={() => onRestore(version)}
              className="self-end rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Restore Version
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
