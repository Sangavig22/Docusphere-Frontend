import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { History, Lock, Pencil } from "lucide-react";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import VersionHistoryModal from "../components/documents/version/VersionHistoryModal";
import CommentSection from "../components/documents/CommentSection";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import { verifySharedDocumentPassword } from "../services/documentProtectionService";
import {
  downloadSharedDocument,
  getSharedDocumentByToken,
  getSharedEditorConfig,
} from "../services/documentShareService";
import {
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  resolveDocumentId,
  setUnlockSession,
} from "../utils/documentProtection";
import { formatBytes, formatDocumentFormat } from "../utils/documentUtils";
import authService from "../services/authService";
import {
  getPermissionBadgeClasses,
  getPermissionLabel,
} from "../components/documents/share/sharePermissions";
import { TOAST_ACTION_IDS, showSingleToast } from "../utils/toastFeedback";
import {
  getShareLoadErrorMessage,
  parseEditorAccessError,
} from "../utils/shareAccessErrors";

function resolveSharedDocumentId(doc) {
  return doc?.documentId || doc?.apiId || doc?.id;
}

function resolveInvitedEmail(doc) {
  const email = doc?.invitedEmail || doc?.inviteeEmail || doc?.recipientEmail;
  return email ? String(email).trim() : "";
}

function resolveDownloadMimeType(doc) {
  return doc?.mimeType || doc?.contentType || doc?.mediaType || null;
}

function InvitedEmailBanner({ invitedEmail, isEdit }) {
  if (!invitedEmail) return null;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <span className="text-slate-600">{isEdit ? "Editing as:" : "Shared with:"}</span>{" "}
      <span className="font-semibold text-slate-900">{invitedEmail}</span>
    </div>
  );
}

export default function SharedDocumentPage() {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editorConfig, setEditorConfig] = useState(null);
  const [editorConfigError, setEditorConfigError] = useState("");
  const [editorConfigLoading, setEditorConfigLoading] = useState(false);
  const configLoadedRef = useRef(false);

  const permission = useMemo(
    () => String(doc?.permission || "VIEW").toUpperCase(),
    [doc?.permission],
  );
  const isEditPermission = permission === "EDIT";
  const invitedEmail = useMemo(() => resolveInvitedEmail(doc), [doc]);
  const canComment =
    permission === "COMMENT" || permission === "EDIT" || doc?.canComment === true;
  const resolvedDocumentId = resolveSharedDocumentId(doc) || resolveDocumentId(doc);
  const protectedDoc = isDocumentProtected(doc);
  const sessionUnlocked = resolvedDocumentId ? hasValidUnlockSession(resolvedDocumentId) : false;
  const canViewContent = !protectedDoc || unlocked || sessionUnlocked;

  const formatLabel = useMemo(
    () => formatDocumentFormat(doc?.type, doc?.name),
    [doc?.type, doc?.name],
  );
  const sizeLabel = useMemo(() => formatBytes(Number(doc?.sizeBytes || 0)), [doc?.sizeBytes]);
  const permissionLabel = useMemo(() => getPermissionLabel(permission), [permission]);
  const permissionBadgeClasses = useMemo(
    () => getPermissionBadgeClasses(permission),
    [permission],
  );

  useEffect(() => {
    let mounted = true;
    authService
      .bootstrapSession()
      .then((session) => {
        if (mounted) setIsLoggedIn(Boolean(session));
      })
      .catch(() => {
        if (mounted) setIsLoggedIn(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const payload = await getSharedDocumentByToken(token);
        if (!mounted) return;

        setDoc(payload);
        const needsPassword = isDocumentProtected(payload);
        const alreadyUnlocked = resolveSharedDocumentId(payload)
          ? hasValidUnlockSession(resolveSharedDocumentId(payload))
          : false;
        setUnlocked(!needsPassword || alreadyUnlocked);
        setVerifyOpen(needsPassword && !alreadyUnlocked);
        if (!needsPassword) {
          showSingleToast(TOAST_ACTION_IDS.SHARED_OPEN, "Shared document opened.");
        }
      } catch (err) {
        if (!mounted) return;
        const message = getShareLoadErrorMessage(err);
        setError(message);
        showSingleToast(TOAST_ACTION_IDS.SHARED_OPEN, message, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!token) {
      setError("This sharing link is invalid.");
      setLoading(false);
      return () => {};
    }

    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    configLoadedRef.current = false;
    setEditorConfig(null);
    setEditorConfigError("");
    setEditorConfigLoading(false);
  }, [token]);

  const showEditor = isEditPermission && canViewContent;

  useEffect(() => {
    if (!showEditor || !resolvedDocumentId || configLoadedRef.current) return;

    let mounted = true;
    setEditorConfigLoading(true);
    setEditorConfigError("");

    getSharedEditorConfig(token, resolvedDocumentId)
      .then((cfg) => {
        if (!mounted) return;
        configLoadedRef.current = true;
        setEditorConfig(cfg);
      })
      .catch((err) => {
        if (!mounted) return;
        setEditorConfigError(parseEditorAccessError(err).message);
      })
      .finally(() => {
        if (mounted) setEditorConfigLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [showEditor, token, resolvedDocumentId]);

  const resolveEditorConfigError = useCallback(
    (error) => parseEditorAccessError(error).message,
    [],
  );

  async function handleVerifyPassword(password) {
    if (!resolvedDocumentId) {
      setVerifyError("Document id is missing in shared payload.");
      return;
    }
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const { unlockSession } = await verifySharedDocumentPassword(token, resolvedDocumentId, password);
      if (unlockSession) setUnlockSession(resolvedDocumentId, unlockSession);
      setUnlocked(true);
      setVerifyOpen(false);
      showSingleToast(TOAST_ACTION_IDS.SHARED_OPEN, "Shared document opened.");
    } catch (err) {
      const raw = String(err?.message || "");
      const invalidPassword = isInvalidPasswordError(raw);
      const message = invalidPassword ? "Invalid password." : raw || "Unable to verify password.";
      setVerifyError(message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDownload() {
    if (!resolvedDocumentId) {
      setVerifyError("Document id is missing in shared payload.");
      return;
    }
    if (protectedDoc && !unlocked && !sessionUnlocked) {
      setVerifyOpen(true);
      setVerifyError("");
      return;
    }
    setDownloading(true);
    try {
      await downloadSharedDocument(resolvedDocumentId, token, {
        fileName: doc?.name,
        mimeType: resolveDownloadMimeType(doc),
      });
      showSingleToast(TOAST_ACTION_IDS.SHARED_DOWNLOAD, "Download started.");
    } catch (err) {
      const raw = String(err?.message || "");
      if (/password|protected/i.test(raw)) {
        setVerifyOpen(true);
        setVerifyError("Enter the document password to download this file.");
      } else {
        showSingleToast(
          TOAST_ACTION_IDS.SHARED_DOWNLOAD,
          raw || "Download failed.",
          "error",
        );
      }
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">
        Loading shared document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-rose-700">Unable to open shared document</p>
          <p className="mt-1 text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  const editorBlocked = isEditPermission && !canViewContent;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PasswordVerifyModal
        open={verifyOpen}
        documentName={doc?.name}
        loading={verifyLoading}
        error={verifyError}
        onClose={() => setVerifyOpen(false)}
        onUnlock={handleVerifyPassword}
      />

      <div
        className={[
          "mx-auto w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-opacity duration-200",
          isEditPermission ? "max-w-6xl" : "max-w-3xl",
          canViewContent ? "opacity-100" : "pointer-events-none opacity-60",
        ].join(" ")}
      >
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-slate-900" title={doc?.name}>
            {doc?.name || "Shared document"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {formatLabel}
            </span>
            <span>{sizeLabel}</span>
            <span
              className={[
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
                permissionBadgeClasses,
              ].join(" ")}
            >
              {isEditPermission ? <Pencil size={12} strokeWidth={2.25} /> : null}
              {permissionLabel}
            </span>
          </div>
        </div>

        {protectedDoc ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
              <Lock size={12} strokeWidth={2.25} />
              Password protected
            </span>
            {canViewContent && sessionUnlocked ? (
              <span className="text-xs text-slate-500">Unlocked temporarily</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !resolvedDocumentId || !canViewContent}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
          {isLoggedIn && resolvedDocumentId ? (
            <button
              type="button"
              onClick={() => setVersionHistoryOpen(true)}
              disabled={!canViewContent}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <History size={16} />
              Version History
            </button>
          ) : null}
        </div>

        {isEditPermission && resolvedDocumentId ? (
          <div className="mt-6">
            {invitedEmail ? (
              <InvitedEmailBanner invitedEmail={invitedEmail} isEdit />
            ) : null}
            <p className="mb-2 text-sm font-semibold text-slate-800">Document editor</p>
            <div className="h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {editorBlocked ? (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
                  Unlock the document to start editing.
                </div>
              ) : editorConfigError ? (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-rose-700">
                  {editorConfigError}
                </div>
              ) : editorConfig ? (
                <OnlyOfficeEditor
                  documentId={resolvedDocumentId}
                  externalConfig={editorConfig}
                  enabled={showEditor}
                  resolveConfigError={resolveEditorConfigError}
                />
              ) : (
                <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-600">
                  {editorConfigLoading ? (
                    <>
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading editor...
                    </>
                  ) : (
                    "Loading editor..."
                  )}
                </div>
              )}
            </div>
          </div>
        ) : invitedEmail ? (
          <InvitedEmailBanner invitedEmail={invitedEmail} isEdit={false} />
        ) : null}

        {canComment ? (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-800">Discussion</p>
            <div className="min-h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white">
              <CommentSection
                documentId={resolvedDocumentId}
                shareToken={token}
                hideHeader
              />
            </div>
          </div>
        ) : !isEditPermission ? (
          <p className="mt-6 text-sm text-slate-600">Read-only access. Commenting is disabled.</p>
        ) : null}
      </div>

      <VersionHistoryModal
        open={versionHistoryOpen}
        document={{
          ...doc,
          id: resolvedDocumentId,
          isOwner: doc?.isOwner ?? false,
        }}
        onClose={() => setVersionHistoryOpen(false)}
      />
    </div>
  );
}
