import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { downloadSharedDocument, getSharedDocumentByToken } from "../services/documentShareService";
import authService from "../services/authService";

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

export default function SharedDocumentPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const hasShownLoadToast = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const canComment = doc?.permission === "COMMENT" || doc?.canComment === true;
  const resolvedDocumentId = doc?.documentId || doc?.id;
  const commentAnchorId = "comments";

  useEffect(() => {
    let mounted = true;
    authService.bootstrapSession().then((sessionValid) => {
      if (mounted) {
        setIsLoggedIn(Boolean(sessionValid && authService.isAuthenticated()));
      }
    });

    async function run() {
      setLoading(true);
      setError("");
      try {
        const payload = await getSharedDocumentByToken(token);
        if (mounted) {
          setDoc(payload);
          if (!hasShownLoadToast.current) {
            toast.success("Shared document opened.");
            hasShownLoadToast.current = true;
          }
        }
      } catch (err) {
        if (mounted) {
          const message = getFriendlyErrorMessage(err);
          setError(message);
          toast.error(message);
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

  async function handleDownload() {
    if (!resolvedDocumentId) {
      toast.error("Document id is missing in shared payload.");
      return;
    }
    setDownloading(true);
    try {
      await downloadSharedDocument(resolvedDocumentId, token);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download shared document");
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
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{doc?.name || "Shared document"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Type: {doc?.type || "-"} • Size: {Number(doc?.sizeBytes || 0)} bytes
        </p>
        <p className="mt-2 text-sm text-slate-600">Permission: {doc?.permission || "VIEW"}</p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !resolvedDocumentId}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Sign in to comment.
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/signin?redirect=${encodeURIComponent(`/share/${token}#${commentAnchorId}`)}`)
                  }
                  className="ml-2 font-semibold underline"
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
