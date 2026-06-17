import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import PasswordInput from "./PasswordInput";

export default function PasswordVerifyModal({
  open,
  documentName = "Document",
  loading = false,
  error = "",
  onClose,
  onUnlock,
}) {
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setLocalError("");
  }, [open]);

  if (!open) return null;

  const displayError = localError || error;

  async function handleUnlock() {
    const trimmed = String(password || "").trim();
    if (!trimmed) {
      setLocalError("Password is required.");
      return;
    }
    setLocalError("");
    await onUnlock?.(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[85] animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-200/35 backdrop-blur-[1px]" onMouseDown={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-200"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Lock size={18} />
              </div>
              <h3 className="text-[16px] font-semibold text-slate-900">Password protected</h3>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
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

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              This file is protected with a password.
              <br />
              Enter password to continue.
            </p>
            <PasswordInput
              id="verify-document-password"
              label="Enter password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (localError) setLocalError("");
              }}
              error={displayError}
              disabled={loading}
              autoFocus
              onSubmit={handleUnlock}
            />
            <button
              type="button"
              onClick={handleUnlock}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
