import { Lock, Shield } from "lucide-react";

export default function ProtectedMoveBlockedModal({
  open,
  documentName = "",
  loading = false,
  onClose,
  onManageProtection,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] dark:bg-black/60" onMouseDown={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold text-text">Cannot move protected document</h3>
                {documentName ? (
                  <p className="mt-0.5 truncate text-sm text-muted" title={documentName}>
                    {documentName}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
              onClick={onClose}
              aria-label="Close"
              disabled={loading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-text">Password protection is enabled</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  To move this file into a Team Space, remove password protection first.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted">
            You can still securely share this file using the Share option.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onManageProtection}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Manage Protection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
