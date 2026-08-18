import { useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";
import PasswordInput from "./PasswordInput";
import PasswordStrengthHint from "./PasswordStrengthHint";
import {
  isDocumentProtected,
  validateCurrentPasswordInput,
  validateDocumentPasswordInput,
  validatePasswordChange,
} from "../../../utils/documentProtection";

function RecoverySection({ onReset, disabled }) {
  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs text-muted">Forgot your current password?</p>
      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="mt-1 text-xs font-medium text-muted underline decoration-border underline-offset-2 hover:text-text disabled:opacity-50"
      >
        Reset protection password
      </button>
    </div>
  );
}

function ForgotCurrentPasswordLink({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-xs text-muted underline decoration-border underline-offset-2 hover:text-text disabled:opacity-50"
    >
      Forgot current password?
    </button>
  );
}

export default function SecureFileModal({
  open,
  document,
  loading = false,
  onClose,
  onEnableProtection,
  onChangePassword,
  onRemoveProtection,
  onResetPassword,
}) {
  const protectedDoc = useMemo(() => isDocumentProtected(document), [document]);
  const canManageProtection = document?.isOwner !== false;

  const [currentPassword, setCurrentPassword] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("main");
  const [submitting, setSubmitting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [returnMode, setReturnMode] = useState("main");

  useEffect(() => {
    if (!open) return;
    setCurrentPassword("");
    setAccountPassword("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMode("main");
    setSubmitting(false);
    setRemoveConfirm(false);
    setShowRecovery(false);
    setReturnMode("main");
  }, [open, document?.id]);

  if (!open) return null;

  const busy = loading || submitting;
  const title = protectedDoc
    ? mode === "change"
      ? "Change password"
      : mode === "remove"
        ? "Remove protection"
        : mode === "reset_confirm" || mode === "reset"
          ? "Reset protection password"
          : "Manage protection"
    : "Protect document";

  function goToResetRecovery(fromMode = mode) {
    if (fromMode === "change" || fromMode === "remove") {
      setReturnMode(fromMode);
    }
    setShowRecovery(true);
    setMode("reset_confirm");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  function handleProtectionResult(result) {
    if (result?.ok) return true;
    if (result?.invalidCurrentPassword) {
      setError("Current password is incorrect.");
      setShowRecovery(true);
      return false;
    }
    if (result?.invalidAccountPassword) {
      setError("Account password is incorrect. Please try again.");
      return false;
    }
    if (result?.message) setError(result.message);
    return false;
  }

  async function handleEnableProtection() {
    const result = validateDocumentPasswordInput(password);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setSubmitting(true);
    try {
      await onEnableProtection?.(result.value);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword() {
    const result = validatePasswordChange({
      currentPassword,
      newPassword: password,
      confirmPassword,
    });
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setSubmitting(true);
    try {
      const response = await onChangePassword?.({
        currentPassword: result.currentPassword,
        newPassword: result.newPassword,
      });
      if (!handleProtectionResult(response)) return;
      setMode("main");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setShowRecovery(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveProtection() {
    const current = validateCurrentPasswordInput(currentPassword);
    if (!current.valid) {
      setError(current.message);
      return;
    }
    if (!removeConfirm) {
      setError("Please confirm removal to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await onRemoveProtection?.(current.value);
      if (!handleProtectionResult(response)) return;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!canManageProtection) {
      setError("Only owner can reset this password.");
      return;
    }
    const next = validateDocumentPasswordInput(password);
    if (!next.valid) {
      setError(next.message);
      return;
    }
    if (String(confirmPassword || "").trim() !== next.value) {
      setError("Passwords do not match.");
      return;
    }
    const account = validateCurrentPasswordInput(accountPassword);
    if (!account.valid) {
      setError("Please sign in again with your account password.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await onResetPassword?.({
        accountPassword: account.value,
        newPassword: next.value,
      });
      if (!handleProtectionResult(response)) return;
      setMode("main");
      setCurrentPassword("");
      setAccountPassword("");
      setPassword("");
      setConfirmPassword("");
      setRemoveConfirm(false);
      setShowRecovery(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] dark:bg-black/60" onMouseDown={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl transition-all duration-200"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Shield size={18} />
              </div>
              <h3 className="text-[16px] font-semibold text-text">{title}</h3>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface"
              onClick={onClose}
              aria-label="Close"
              disabled={busy}
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

          {!protectedDoc ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Protect this file with a password required for preview and download.
              </p>
              <PasswordInput
                id="secure-file-password"
                label="Enter password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (error) setError("");
                }}
                error={error}
                disabled={busy}
                autoFocus
                onSubmit={handleEnableProtection}
              />
              <PasswordStrengthHint password={password} />
              <button
                type="button"
                onClick={handleEnableProtection}
                disabled={busy}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Protecting..." : "Protect document"}
              </button>
            </div>
          ) : !canManageProtection ? (
            <p className="text-sm text-muted">
              Only the document owner can change or remove password protection.
            </p>
          ) : mode === "change" ? (
            <div className="space-y-4">
              <PasswordInput
                id="secure-file-current-password"
                label="Current password"
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  if (error) setError("");
                }}
                error={showRecovery ? error : ""}
                disabled={busy}
                autoFocus
              />
              <PasswordInput
                id="secure-file-new-password"
                label="New password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (error) setError("");
                }}
                disabled={busy}
              />
              <PasswordInput
                id="secure-file-confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  if (error) setError("");
                }}
                disabled={busy}
                onSubmit={handleChangePassword}
              />
              <PasswordStrengthHint password={password} />
              {!showRecovery && error ? <p className="text-sm text-rose-600">{error}</p> : null}

              {!showRecovery ? (
                <ForgotCurrentPasswordLink onClick={() => goToResetRecovery("change")} disabled={busy} />
              ) : (
                <RecoverySection onReset={() => goToResetRecovery("change")} disabled={busy} />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("main");
                    setCurrentPassword("");
                    setPassword("");
                    setConfirmPassword("");
                    setAccountPassword("");
                    setError("");
                    setRemoveConfirm(false);
                    setShowRecovery(false);
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Saving..." : "Save password"}
                </button>
              </div>
            </div>
          ) : mode === "remove" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Enter the current password to remove protection. Preview and download will no longer require a
                password.
              </p>
              <PasswordInput
                id="secure-file-remove-current-password"
                label="Current password"
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  if (error) setError("");
                }}
                error={showRecovery ? error : ""}
                disabled={busy}
                autoFocus
                onSubmit={handleRemoveProtection}
              />
              <label className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={removeConfirm}
                  onChange={(e) => {
                    setRemoveConfirm(e.target.checked);
                    if (error) setError("");
                  }}
                  disabled={busy}
                />
                <span>I understand this will remove password protection for this document.</span>
              </label>
              {!showRecovery && error ? <p className="text-sm text-rose-600">{error}</p> : null}

              {!showRecovery ? (
                <ForgotCurrentPasswordLink onClick={() => goToResetRecovery("remove")} disabled={busy} />
              ) : (
                <RecoverySection onReset={() => goToResetRecovery("remove")} disabled={busy} />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("main");
                    setCurrentPassword("");
                    setError("");
                    setRemoveConfirm(false);
                    setShowRecovery(false);
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemoveProtection}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Removing..." : "Remove protection"}
                </button>
              </div>
            </div>
          ) : mode === "reset_confirm" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Resetting password will invalidate existing unlock sessions.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const backMode =
                      returnMode === "change" || returnMode === "remove" ? returnMode : "main";
                    setMode(backMode);
                    if (backMode === "main") setShowRecovery(false);
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : mode === "reset" ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                Resetting password will invalidate existing unlock sessions.
              </p>
              <PasswordInput
                id="secure-file-reset-account-password"
                label="Sign in again (account password)"
                value={accountPassword}
                onChange={(value) => {
                  setAccountPassword(value);
                  if (error) setError("");
                }}
                error={/account password/i.test(error) ? error : ""}
                disabled={busy}
                autoFocus
              />
              <PasswordInput
                id="secure-file-reset-new-password"
                label="New password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (error) setError("");
                }}
                disabled={busy}
              />
              <PasswordInput
                id="secure-file-reset-confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  if (error) setError("");
                }}
                error={/account password/i.test(error) ? "" : error}
                disabled={busy}
                onSubmit={handleResetPassword}
              />
              <PasswordStrengthHint password={password} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("reset_confirm")}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Resetting..." : "Reset password"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                This document is password protected. People with access still need the password to preview or
                download content.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setReturnMode("change");
                    setMode("change");
                    setCurrentPassword("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                    setRemoveConfirm(false);
                    setShowRecovery(false);
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
                >
                  Change password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReturnMode("remove");
                    setMode("remove");
                    setCurrentPassword("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                    setRemoveConfirm(false);
                    setShowRecovery(false);
                  }}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  Remove protection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
