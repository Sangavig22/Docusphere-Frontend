import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, History, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import PasswordVerifyModal from "../secure/PasswordVerifyModal";
import RestoreVersionDialog from "./RestoreVersionDialog";
import VersionTimelineCard from "./VersionTimelineCard";
import {
  downloadDocumentVersion,
  fetchDocumentVersions,
  restoreDocumentVersion,
} from "../../../services/documentVersionService";
import { verifyDocumentPassword } from "../../../services/documentProtectionService";
import {
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  resolveDocumentId,
  setUnlockSession,
} from "../../../utils/documentProtection";
import { getUnlockSession } from "../../../utils/unlockSessionStore";
import { canRestoreVersion } from "../../../utils/versionHistoryPermissions";

const VERSIONS_PAGE_SIZE = 10;

function resolveApiId(doc) {
  return resolveDocumentId(doc) || doc?.apiId || doc?.documentId || doc?.fileId || doc?.id;
}

export default function VersionHistoryModal({
  open,
  document,
  userTeamRole = "",
  onClose,
  onRestored,
}) {
  const navigate = useNavigate();
  const documentId = useMemo(() => resolveApiId(document), [document]);
  const documentName = document?.name || "Document";
  const documentProtected = isDocumentProtected(document);

  const canRestore = useMemo(
    () => canRestoreVersion({ doc: document, userTeamRole }),
    [document, userTeamRole],
  );

  const [versions, setVersions] = useState([]);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: VERSIONS_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [pendingDownloadVersion, setPendingDownloadVersion] = useState(null);
  const [pendingViewVersion, setPendingViewVersion] = useState(null);

  const loadVersions = useCallback(
    async (targetPage = 1) => {
      if (!documentId) {
        setError("Cannot load versions: missing document id.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const result = await fetchDocumentVersions(documentId, {
          page: targetPage,
          pageSize: VERSIONS_PAGE_SIZE,
          documentProtected,
        });
        setVersions(result.versions);
        setCurrentVersionNumber(result.currentVersionNumber);
        setPagination(result.pagination);
        setPage(result.pagination.page);
      } catch (err) {
        setVersions([]);
        setError(err instanceof Error ? err.message : "Unable to load version history.");
      } finally {
        setLoading(false);
      }
    },
    [documentId, documentProtected],
  );

  useEffect(() => {
    if (!open) return;
    setVersions([]);
    setCurrentVersionNumber(0);
    setPage(1);
    setError("");
    setActionLoading("");
    setRestoreTarget(null);
    setRestoring(false);
    setVerifyOpen(false);
    setVerifyLoading(false);
    setVerifyError("");
    setPendingDownloadVersion(null);
    setPendingViewVersion(null);
    loadVersions(1);
  }, [open, documentId, loadVersions]);

  function getUnlockToken() {
    if (!documentId || !hasValidUnlockSession(documentId)) return undefined;
    return getUnlockSession(documentId)?.token;
  }

  function handleView(version) {
    if (!documentId) return;

    if (documentProtected && !hasValidUnlockSession(documentId)) {
      setPendingViewVersion(version);
      setPendingDownloadVersion(null);
      setVerifyOpen(true);
      setVerifyError("");
      return;
    }

    onClose?.();
    navigate(`/documents/${documentId}/versions/${version.id}/preview`);
  }

  async function performDownload(version, unlockToken) {
    const downloadName = documentName.includes(".")
      ? documentName.replace(/(\.[^.]+)$/, `_v${version.versionNumber}$1`)
      : `${documentName}_v${version.versionNumber}`;
    await downloadDocumentVersion(documentId, version.id, downloadName, { unlockToken });
    toast.success(`Version ${version.versionNumber} download started.`);
  }

  async function handleDownload(version) {
    if (!documentId) return;

    if (documentProtected && !hasValidUnlockSession(documentId)) {
      setPendingDownloadVersion(version);
      setVerifyOpen(true);
      setVerifyError("");
      return;
    }

    setActionLoading(`download-${version.id}`);
    try {
      await performDownload(version, getUnlockToken());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to download this version.");
    } finally {
      setActionLoading("");
    }
  }

  async function submitVerifyPassword(password) {
    if (!documentId) return;
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const { unlockSession } = await verifyDocumentPassword(documentId, password);
      setUnlockSession(documentId, unlockSession);
      setVerifyOpen(false);

      if (pendingDownloadVersion) {
        setActionLoading(`download-${pendingDownloadVersion.id}`);
        try {
          await performDownload(pendingDownloadVersion, unlockSession?.token);
        } finally {
          setActionLoading("");
          setPendingDownloadVersion(null);
        }
      } else if (pendingViewVersion) {
        const target = pendingViewVersion;
        setPendingViewVersion(null);
        onClose?.();
        navigate(`/documents/${documentId}/versions/${target.id}/preview`);
      } else {
        toast.success("Document unlocked for this session.");
      }
    } catch (err) {
      const raw = String(err?.message || "");
      const invalidPassword = isInvalidPasswordError(raw);
      setVerifyError(invalidPassword ? "Invalid password." : raw || "Unable to verify password.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleConfirmRestore() {
    if (!documentId || !restoreTarget) return;
    setRestoring(true);
    try {
      await restoreDocumentVersion(documentId, restoreTarget.id);
      toast.success(`Version ${restoreTarget.versionNumber} restored successfully.`);
      setRestoreTarget(null);
      await loadVersions(page);
      onRestored?.(document);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to restore this version.");
    } finally {
      setRestoring(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-slate-200/35 backdrop-blur-[1px]" onMouseDown={onClose} />
        <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <History size={18} className="shrink-0 text-blue-600" />
                  <h3 className="text-[16px] font-semibold text-text">Version History</h3>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-text" title={documentName}>
                  {documentName}
                </p>
                {currentVersionNumber > 0 ? (
                  <p className="mt-0.5 text-xs text-muted">
                    Current active version: V{currentVersionNumber}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
                onClick={onClose}
                aria-label="Close version history"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                  <span>Loading version history...</span>
                </div>
              ) : null}

              {!loading && error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold">Unable to load versions</p>
                      <p className="mt-1">{error}</p>
                      <button
                        type="button"
                        onClick={() => loadVersions(page)}
                        className="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {!loading && !error && versions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center">
                  <History size={32} className="mx-auto text-muted" />
                  <p className="mt-3 text-sm font-medium text-text">No version history yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Versions will appear here when the document is edited or restored.
                  </p>
                </div>
              ) : null}

              {!loading && !error && versions.length > 0 ? (
                <div className="relative">
                  <div
                    className="absolute bottom-4 left-[15px] top-4 hidden w-px bg-border md:block"
                    aria-hidden
                  />
                  <div className="space-y-4 md:space-y-5">
                    {versions.map((version, index) => (
                      <div key={version.id} className="relative flex flex-col gap-3 md:flex-row md:gap-5">
                        <div className="hidden shrink-0 flex-col items-center md:flex md:w-8">
                          <div
                            className={[
                              "relative z-10 mt-6 h-3.5 w-3.5 rounded-full border-2 bg-white",
                              version.isCurrent ? "border-blue-600 bg-blue-50" : "border-slate-300",
                            ].join(" ")}
                          />
                          <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                            {version.versionNumber}
                          </span>
                        </div>
                        <VersionTimelineCard
                          version={version}
                          isFirst={index === 0}
                          canRestore={canRestore}
                          actionLoading={actionLoading}
                          onView={handleView}
                          onDownload={handleDownload}
                          onRestore={setRestoreTarget}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {!loading && !error && pagination.totalPages > 1 ? (
              <footer className="flex shrink-0 flex-col gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-muted">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} versions)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading || page <= 1}
                    onClick={() => loadVersions(page - 1)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={loading || page >= pagination.totalPages}
                    onClick={() => loadVersions(page + 1)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </footer>
            ) : null}
          </div>
        </div>
      </div>

      <RestoreVersionDialog
        version={restoreTarget}
        loading={restoring}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={handleConfirmRestore}
      />

      <PasswordVerifyModal
        open={verifyOpen}
        documentName={documentName}
        loading={verifyLoading}
        error={verifyError}
        onClose={() => {
          setVerifyOpen(false);
          setPendingDownloadVersion(null);
          setPendingViewVersion(null);
          setVerifyError("");
        }}
        onUnlock={submitVerifyPassword}
      />
    </>
  );
}
