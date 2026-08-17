import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Download, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import VersionStatusBadges from "../components/documents/version/VersionStatusBadges";
import { verifySharedDocumentPassword } from "../services/documentProtectionService";
import { getSharedDocumentByToken } from "../services/documentShareService";
import {
  downloadDocumentVersion,
  fetchDocumentVersion,
  fetchSharedVersionEditorConfig,
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
import { getShareErrorTitle, parseShareAccessError } from "../utils/shareAccessErrors";
import {
  getPermissionBadgeClasses,
  getPermissionLabel,
  canAccessSharedVersionHistory,
  resolveShareAccessType,
} from "../components/documents/share/sharePermissions";

function resolveSharedDocumentId(doc) {
  return doc?.documentId || doc?.apiId || doc?.id;
}

export default function SharedVersionPreviewPage() {
  const { token = "", versionId = "" } = useParams();
  const [documentMeta, setDocumentMeta] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [editorConfig, setEditorConfig] = useState(null);
  const [editorConfigError, setEditorConfigError] = useState("");
  const [editorConfigLoading, setEditorConfigLoading] = useState(false);

  const documentIdResolved = documentId;
  const documentName = documentMeta?.name || version?.documentName || "Document";
  const documentProtected = isDocumentProtected(documentMeta) || Boolean(version?.isProtected);
  const sessionUnlocked = documentIdResolved ? hasValidUnlockSession(documentIdResolved) : false;
  const canPreview = !documentProtected || sessionUnlocked;
  const editorRoleLabel = useMemo(() => formatEditorRole(version?.editorRole), [version?.editorRole]);
  const permission = useMemo(
    () => String(documentMeta?.permission || "VIEW").toUpperCase(),
    [documentMeta?.permission],
  );
  const permissionLabel = useMemo(() => getPermissionLabel(permission), [permission]);
  const permissionBadgeClasses = useMemo(
    () => getPermissionBadgeClasses(permission),
    [permission],
  );
  const shareAccessType = useMemo(() => resolveShareAccessType(documentMeta), [documentMeta]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token || !versionId) {
        setError("This version link is invalid.");
        setErrorTitle("Invalid link");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setErrorTitle("");
      try {
        const shareDoc = await getSharedDocumentByToken(token);
        const resolvedId = resolveSharedDocumentId(shareDoc);
        if (!resolvedId) throw new Error("Document id is missing in share response.");

        if (!canAccessSharedVersionHistory(shareDoc)) {
          if (!mounted) return;
          setDocumentMeta(shareDoc);
          setError("Version history is only available for email invites, not public links.");
          setErrorTitle("Access denied");
          setLoading(false);
          return;
        }

        const versionData = await fetchDocumentVersion(resolvedId, versionId, { shareToken: token });
        if (!mounted) return;

        setDocumentId(resolvedId);
        setDocumentMeta(shareDoc);
        setVersion(versionData);
        const protectedDoc = isDocumentProtected(shareDoc) || Boolean(versionData?.isProtected);
        if (protectedDoc && !hasValidUnlockSession(resolvedId)) {
          setVerifyOpen(true);
        }
      } catch (err) {
        if (!mounted) return;
        const parsed = parseShareAccessError(err);
        setError(parsed.message);
        setErrorTitle(getShareErrorTitle(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token, versionId]);

  useEffect(() => {
    if (!token || !documentIdResolved || !versionId || !canPreview) return;

    let mounted = true;
    setEditorConfigLoading(true);
    setEditorConfigError("");

    fetchSharedVersionEditorConfig(token, documentIdResolved, versionId)
      .then((cfg) => {
        if (mounted) setEditorConfig(cfg);
      })
      .catch((err) => {
        if (mounted) setEditorConfigError(parseShareAccessError(err).message);
      })
      .finally(() => {
        if (mounted) setEditorConfigLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token, documentIdResolved, versionId, canPreview]);

  async function handleDownload() {
    if (!version || !documentIdResolved) return;
    if (documentProtected && !hasValidUnlockSession(documentIdResolved)) {
      setVerifyOpen(true);
      return;
    }

    setDownloading(true);
    try {
      const unlockToken = getUnlockSession(documentIdResolved)?.token;
      const downloadName = documentName.includes(".")
        ? documentName.replace(/(\.[^.]+)$/, `_v${version.versionNumber}$1`)
        : `${documentName}_v${version.versionNumber}`;
      await downloadDocumentVersion(documentIdResolved, versionId, downloadName, {
        unlockToken,
        shareToken: token,
      });
      toast.success(`Version ${version.versionNumber} download started.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to download this version.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleVerifyPassword(password) {
    if (!documentIdResolved) return;
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const { unlockSession } = await verifySharedDocumentPassword(token, documentIdResolved, password);
      if (unlockSession) setUnlockSession(documentIdResolved, unlockSession);
      setVerifyOpen(false);
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
      <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">
        Loading version preview...
      </div>
    );
  }

  if (error || !version) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-rose-700">{errorTitle || "Unable to open version"}</p>
          <p className="mt-1 text-sm text-rose-600">{error || "Version not found."}</p>
          <Link
            to={`/share/${encodeURIComponent(token)}`}
            className="mt-4 inline-flex rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700"
          >
            Back to shared document
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PasswordVerifyModal
        open={verifyOpen}
        documentName={documentName}
        loading={verifyLoading}
        error={verifyError}
        onClose={() => setVerifyOpen(false)}
        onUnlock={handleVerifyPassword}
      />

      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/share/${encodeURIComponent(token)}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="Back to shared document"
              >
                <ChevronLeft size={18} />
              </Link>
              <h1 className="text-lg font-semibold text-slate-900">
                Version {version.versionNumber}{" "}
                <span className="text-sm font-medium text-slate-500">
                  ({formatVersionLabel(version.versionNumber)})
                </span>
              </h1>
            </div>

            <VersionStatusBadges version={version} />

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-blue-700">
                {shareAccessType.label}
              </span>
              <span
                className={[
                  "inline-flex items-center rounded-md px-2 py-0.5 font-semibold ring-1 ring-inset",
                  permissionBadgeClasses,
                ].join(" ")}
              >
                {permissionLabel}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-slate-800">
                Edited by: <span className="font-medium">{version.editedBy}</span>
                {editorRoleLabel ? <span className="text-slate-500"> ({editorRoleLabel})</span> : null}
              </p>
              <p className="text-slate-500" title={formatVersionDateTime(version.editedAt)}>
                Edited {formatRelativeTime(version.editedAt)}
              </p>
            </div>

            {documentProtected ? (
              <div className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                <Lock size={12} />
                Protected document
                {sessionUnlocked ? " • Unlocked temporarily" : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !canPreview}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            {downloading ? "Downloading..." : "Download Version"}
          </button>
        </div>

        <div
          className={[
            "h-[calc(100vh-260px)] min-h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
            canPreview ? "opacity-100" : "pointer-events-none opacity-60",
          ].join(" ")}
        >
          {editorConfigError ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-rose-700">
              {editorConfigError}
            </div>
          ) : editorConfig ? (
            <OnlyOfficeEditor
              documentId={documentIdResolved}
              versionId={versionId}
              externalConfig={editorConfig}
              readOnly
              enabled={canPreview}
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-600">
              {editorConfigLoading ? "Loading version preview..." : "Loading version preview..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
