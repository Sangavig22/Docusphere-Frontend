import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Download, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout/Layout";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import VersionStatusBadges from "../components/documents/version/VersionStatusBadges";
import { request } from "../api/apiClient";
import { verifyDocumentPassword } from "../services/documentProtectionService";
import {
  downloadDocumentVersion,
  fetchDocumentVersion,
} from "../services/documentVersionService";
import {
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  setUnlockSession,
} from "../utils/documentProtection";
import { getUnlockSession } from "../utils/unlockSessionStore";
import { formatEditorRole, formatVersionLabel } from "../utils/versionUtils";
import { formatRelativeTime, formatVersionDateTime } from "../utils/documentUtils";

export default function VersionPreviewPage() {
  const { documentId, versionId } = useParams();
  const navigate = useNavigate();

  const [documentMeta, setDocumentMeta] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [canPreview, setCanPreview] = useState(true);

  const documentName = documentMeta?.name || version?.documentName || "Document";
  const documentProtected = isDocumentProtected(documentMeta) || Boolean(version?.isProtected);
  const sessionUnlocked = hasValidUnlockSession(documentId);
  const editorRoleLabel = useMemo(() => formatEditorRole(version?.editorRole), [version?.editorRole]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [docData, versionData] = await Promise.all([
          request(`/documents/${documentId}`),
          fetchDocumentVersion(documentId, versionId),
        ]);
        if (!mounted) return;
        setDocumentMeta(docData);
        setVersion(versionData);
        const protectedDoc = isDocumentProtected(docData) || Boolean(versionData?.isProtected);
        setCanPreview(!protectedDoc || hasValidUnlockSession(documentId));
        if (protectedDoc && !hasValidUnlockSession(documentId)) {
          setVerifyOpen(true);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load version preview.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [documentId, versionId]);

  async function performDownload(unlockToken) {
    const downloadName = documentName.includes(".")
      ? documentName.replace(/(\.[^.]+)$/, `_v${version.versionNumber}$1`)
      : `${documentName}_v${version.versionNumber}`;
    await downloadDocumentVersion(documentId, versionId, downloadName, { unlockToken });
    toast.success(`Version ${version.versionNumber} download started.`);
  }

  async function handleDownload() {
    if (!version) return;
    if (documentProtected && !hasValidUnlockSession(documentId)) {
      setVerifyOpen(true);
      return;
    }

    setDownloading(true);
    try {
      const token = getUnlockSession(documentId)?.token;
      await performDownload(token);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to download this version.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleVerifyPassword(password) {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const { unlockSession } = await verifyDocumentPassword(documentId, password);
      setUnlockSession(documentId, unlockSession);
      setVerifyOpen(false);
      setCanPreview(true);
      toast.success("Document unlocked for this session.");
    } catch (err) {
      const raw = String(err?.message || "");
      const invalidPassword = isInvalidPasswordError(raw);
      setVerifyError(invalidPassword ? "Invalid password." : raw || "Unable to verify password.");
    } finally {
      setVerifyLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout pageTitle="Loading version..." pageSubtitle="Preparing read-only preview">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (error || !version) {
    return (
      <Layout pageTitle="Version Preview" pageSubtitle="Unable to open version">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Unable to load version preview</p>
          <p className="mt-1 text-sm">{error || "Version not found."}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={`Version ${version.versionNumber}`}
      pageSubtitle={`Read-only preview of ${documentName}`}
    >
      <PasswordVerifyModal
        open={verifyOpen}
        documentName={documentName}
        loading={verifyLoading}
        error={verifyError}
        onClose={() => setVerifyOpen(false)}
        onUnlock={handleVerifyPassword}
      />

      <div className="flex h-full flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface"
                  aria-label="Go back"
                >
                  <ChevronLeft size={18} />
                </button>
                <h1 className="text-lg font-semibold text-text">
                  Version {version.versionNumber}{" "}
                  <span className="text-sm font-medium text-muted">({formatVersionLabel(version.versionNumber)})</span>
                </h1>
              </div>

              <VersionStatusBadges version={version} />

              <div className="space-y-1 text-sm">
                <p className="text-text">
                  Edited by: <span className="font-medium">{version.editedBy}</span>
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

              {documentProtected ? (
                <div className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                  <Lock size={12} />
                  Protected document
                  {sessionUnlocked ? " • Unlocked temporarily" : null}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={16} />
                {downloading ? "Downloading..." : "Download Version"}
              </button>
            </div>
          </div>
        </div>

        <div
          className={[
            "min-h-[600px] flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
            canPreview ? "opacity-100" : "pointer-events-none opacity-60",
          ].join(" ")}
        >
          <OnlyOfficeEditor
            documentId={documentId}
            versionId={versionId}
            readOnly
            enabled={canPreview}
          />
        </div>
      </div>
    </Layout>
  );
}
