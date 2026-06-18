import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import { verifySharedDocumentPassword } from "../services/documentProtectionService";
import { downloadSharedDocument, getSharedDocumentByToken } from "../services/documentShareService";
import {
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  resolveDocumentId,
  setUnlockSession,
} from "../utils/documentProtection";
import { formatBytes, formatDocumentFormat } from "../utils/documentUtils";
import authService from "../services/authService";
import { getPermissionLabel } from "../components/documents/share/sharePermissions";
import { TOAST_ACTION_IDS, showSingleToast } from "../utils/toastFeedback";

function getFriendlyErrorMessage(error) {
  const raw = String(error?.message || "");
  if (/403|expired|revoked|permission/i.test(raw)) {
    return "This share link is expired, revoked, or access is denied.";
  }
  if (/404|not found/i.test(raw)) {
    return "Shared document not found.";
  }
  if (/400|invalid/i.test(raw)) {
    return "Invalid share link.";
  }
  return "Unable to load shared document. Please try again.";
}

function resolveSharedDocumentId(doc) {
  return doc?.documentId || doc?.apiId || doc?.id;
}

function formatPermissionLabel(permission) {
  return getPermissionLabel(permission);
}

export default function SharedDocumentPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const isLoggedIn = useMemo(() => authService.isAuthenticated(), []);
  const canComment = doc?.permission === "COMMENT" || doc?.canComment === true;
  const resolvedDocumentId = resolveSharedDocumentId(doc) || resolveDocumentId(doc);
  const commentAnchorId = "comments";
  const protectedDoc = isDocumentProtected(doc);
  const sessionUnlocked = resolvedDocumentId ? hasValidUnlockSession(resolvedDocumentId) : false;
  const canViewContent = !protectedDoc || unlocked || sessionUnlocked;

  const formatLabel = useMemo(
    () => formatDocumentFormat(doc?.type, doc?.name),
    [doc?.type, doc?.name],
  );
  const sizeLabel = useMemo(() => formatBytes(Number(doc?.sizeBytes || 0)), [doc?.sizeBytes]);
  const permissionLabel = useMemo(() => formatPermissionLabel(doc?.permission), [doc?.permission]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const payload = await getSharedDocumentByToken(token);
        if (mounted) {
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
        }
      } catch (err) {
        if (mounted) {
          const message = getFriendlyErrorMessage(err);
          setError(message);
          showSingleToast(TOAST_ACTION_IDS.SHARED_OPEN, message, "error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!token) {
      setError("Invalid share link.");
      setLoading(false);
      return () => {};
    }

    run();
    return () => {
      mounted = false;
    };
  }, [token]);

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
      await downloadSharedDocument(resolvedDocumentId, token);
      showSingleToast(TOAST_ACTION_IDS.SHARED_DOWNLOAD, "Download started.");
    } catch (err) {
      const raw = String(err?.message || "");
      if (/password|protected|401|403/i.test(raw)) {
        setVerifyOpen(true);
        setVerifyError("Enter the document password to download this file.");
      } else {
        showSingleToast(
          TOAST_ACTION_IDS.SHARED_DOWNLOAD,
          "Failed to download shared document.",
          "error",
        );
      }
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">Loading shared document...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-rose-200 bg-white p-5 text-rose-700 shadow-sm">
          <p className="font-semibold">Unable to open shared document</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
          "mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-opacity duration-200",
          canViewContent ? "opacity-100" : "pointer-events-none opacity-60",
        ].join(" ")}
      >
        <h1 className="truncate text-xl font-semibold text-slate-900" title={doc?.name}>
          {doc?.name || "Shared document"}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {formatLabel}
          </span>
          <span>{sizeLabel}</span>
          <span className="text-slate-300">•</span>
          <span>{permissionLabel}</span>
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

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !resolvedDocumentId}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>

        <div id={commentAnchorId} className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Comments</p>
          {canComment ? (
            isLoggedIn ? (
              <div className="mt-3">
                <textarea
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={!canViewContent}
                />
                <button
                  type="button"
                  className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canViewContent}
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-sm text-slate-700">
                Sign in to comment.
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/signin?redirect=${encodeURIComponent(`/share/${token}#${commentAnchorId}`)}`)
                  }
                  className="ml-1 font-semibold text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
                >
                  Sign in
                </button>
              </div>
            )
          ) : (
            <p className="mt-2 text-sm text-slate-600">Read-only access. Commenting is disabled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
