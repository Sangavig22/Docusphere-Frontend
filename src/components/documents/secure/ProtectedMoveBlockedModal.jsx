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
      <div className="absolute inset-0 bg-slate-200/35 backdrop-blur-[1px]" onMouseDown={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold text-slate-900">Cannot move protected document</h3>
                {documentName ? (
                  <p className="mt-0.5 truncate text-sm text-slate-500" title={documentName}>
                    {documentName}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
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

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Password protection is enabled</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  To move this file into a Team Space, remove password protection first.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            You can still securely share this file using the Share option.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
