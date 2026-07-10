import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Globe, Lock } from "lucide-react";
import EmailInput, { isValidEmail } from "./EmailInput";
import SharedUsersList from "./SharedUsersList";
import {
  getPermissionLabel,
  INVITE_PERMISSION_OPTIONS,
  PUBLIC_PERMISSION_OPTIONS,
} from "./sharePermissions";
import { isDocumentProtected } from "../../../utils/documentProtection";
import { TOAST_ACTION_IDS, showSingleToast } from "../../../utils/toastFeedback";

function uniqueEmails(list) {
  return Array.from(new Set(list.map((email) => email.trim().toLowerCase())));
}

export default function ShareModal({
  open,
  document,
  loading = false,
  onClose,
  onShareWithPeople,
}) {
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [invitePermission, setInvitePermission] = useState("VIEW");
  const [generalAccessType, setGeneralAccessType] = useState("EMAIL_INVITE");
  const [generalPermission, setGeneralPermission] = useState("VIEW");
  const [publicLink, setPublicLink] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingGeneralAccess, setUpdatingGeneralAccess] = useState(false);
  const [invitePermissionOpen, setInvitePermissionOpen] = useState(false);
  const [generalPermissionOpen, setGeneralPermissionOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState({ type: "", message: "" });
  const documentName = useMemo(() => document?.name || "Document", [document?.name]);

  useEffect(() => {
    if (!open) return;
    setEmailDraft("");
    setEmailError("");
    setRecipients([]);
    setInvitePermission("VIEW");
    setGeneralAccessType("EMAIL_INVITE");
    setGeneralPermission("VIEW");
    setPublicLink("");
    setSending(false);
    setUpdatingGeneralAccess(false);
    setInvitePermissionOpen(false);
    setGeneralPermissionOpen(false);
    setSendStatus({ type: "", message: "" });
  }, [open]);

  function handleAddEmail() {
    const normalized = String(emailDraft || "").trim().toLowerCase();
    if (!normalized) return;
    if (!isValidEmail(normalized)) {
      setEmailError("Please enter a valid email.");
      return;
    }
    if (recipients.includes(normalized)) {
      setEmailError("This email is already added.");
      return;
    }
    setRecipients((prev) => [...prev, normalized]);
    setEmailError("");
    setEmailDraft("");
  }

  async function handleSend() {
    const draft = String(emailDraft || "").trim().toLowerCase();
    const sourceEmails = draft ? [...recipients, draft] : recipients;
    const deduped = uniqueEmails(sourceEmails);
    if (deduped.length === 0) {
      setEmailError("Add at least one email to share.");
      setSendStatus({ type: "error", message: "Please add at least one recipient email." });
      return;
    }
    if (draft && !isValidEmail(draft)) {
      setEmailError("Please enter a valid email.");
      setSendStatus({ type: "error", message: "Please enter a valid email before sending." });
      return;
    }
    setSending(true);
    setSendStatus({ type: "", message: "" });
    try {
      // Email-invite share path (per selected invite permission).
      await onShareWithPeople?.(document, {
        type: "EMAIL_INVITE",
        permission: invitePermission,
        emails: deduped,
      });
      showSingleToast(TOAST_ACTION_IDS.SHARE, "Document shared successfully.");
      setRecipients(deduped);
      setEmailDraft("");
      setEmailError("");
      setSendStatus({ type: "", message: "" });
    } catch {
      setSendStatus({ type: "error", message: "Failed to share document. Please try again." });
    } finally {
      setSending(false);
    }
  }

  async function handleGeneralAccessUpdate(nextType, nextPermission = generalPermission) {
    setUpdatingGeneralAccess(true);
    setSendStatus({ type: "", message: "" });
    try {
      if (nextType === "EMAIL_INVITE") {
        // Switching back to invite-only clears previously generated public link in UI.
        setGeneralAccessType("EMAIL_INVITE");
        setPublicLink("");
        setSendStatus({ type: "", message: "" });
        return "";
      }

      const payload = await onShareWithPeople?.(document, {
        type: "PUBLIC",
        permission: nextPermission,
      });
      const nextLink = payload?.shareUrl || payload?.data?.shareUrl || "";
      setGeneralAccessType("PUBLIC");
      setGeneralPermission(nextPermission);
      setPublicLink(nextLink);
      showSingleToast(TOAST_ACTION_IDS.GENERAL_ACCESS, "General access updated.");
      setSendStatus({ type: "", message: "" });
      return nextLink;
    } catch {
      setSendStatus({ type: "error", message: "Failed to update general access." });
      return "";
    } finally {
      setUpdatingGeneralAccess(false);
    }
  }

  async function handleCopyLink() {
    try {
      // Invite-only mode has no public URL; do not call the PUBLIC API here or the
      // backend would enable link sharing and the UI would jump to "Anyone with link".
      if (generalAccessType === "EMAIL_INVITE") {
        return;
      }

      let linkToCopy = publicLink;
      if (!linkToCopy) {
        linkToCopy = await handleGeneralAccessUpdate("PUBLIC", generalPermission);
      }
      if (!linkToCopy) {
        setSendStatus({ type: "error", message: "No public link available to copy." });
        return;
      }
      await navigator.clipboard.writeText(linkToCopy);
      showSingleToast(TOAST_ACTION_IDS.COPY_LINK, "Link copied to clipboard.");
      setSendStatus({ type: "", message: "" });
    } catch {
      setSendStatus({ type: "error", message: "Unable to copy link." });
    }
  }

  return (
    open ? (
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] dark:bg-black/60" onMouseDown={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold text-text">Share</h3>
                <p className="mt-0.5 truncate text-sm text-muted" title={documentName}>
                  {documentName}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-card"
                onClick={onClose}
                aria-label="Close"
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
              {isDocumentProtected(document) ? (
                <p className="text-xs text-muted">
                  Shared users will need the document password to access preview or download.
                </p>
              ) : null}
              <EmailInput
                value={emailDraft}
                onChange={(value) => {
                  setEmailDraft(value);
                  if (emailError) setEmailError("");
                }}
                onAdd={handleAddEmail}
                disabled={loading || sending || updatingGeneralAccess}
                error={emailError}
              />

              <div className="rounded-xl border border-border bg-card px-3 py-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">Invited people permission</p>
                    <p className="text-xs text-muted">Apply to users in the shared list</p>
                  </div>
                  <div className="relative self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess) return;
                        setInvitePermissionOpen((prev) => !prev);
                        setGeneralPermissionOpen(false);
                      }}
                      disabled={loading || sending || updatingGeneralAccess}
                      className="inline-flex min-w-[150px] items-center justify-between rounded-lg border border-border bg-card py-2 pl-3 pr-2 text-sm text-text"
                    >
                      <span>{getPermissionLabel(invitePermission)}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                    {invitePermissionOpen ? (
                      <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                        {INVITE_PERMISSION_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setInvitePermission(option.value);
                              setInvitePermissionOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-surface"
                          >
                            <span>{option.label}</span>
                            {invitePermission === option.value ? <Check size={14} className="text-blue-600" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                {invitePermission === "EDIT" ? (
                  <p className="mt-2 text-xs text-muted">
                    Edit access allows invited users to modify document content.
                  </p>
                ) : null}
              </div>

              <SharedUsersList users={recipients} permission={invitePermission} />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || sending || updatingGeneralAccess || (recipients.length === 0 && !String(emailDraft || "").trim())}
                  className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>

              <div>
                <p className="mb-2 text-base font-semibold text-text">General access</p>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-text">
                        {generalAccessType === "PUBLIC" ? <Globe size={18} /> : <Lock size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text">Anyone on the web with link</p>
                        <p className="text-xs text-muted">
                          {generalAccessType === "PUBLIC" ? "Anyone with this link can access" : "Public link sharing off"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={generalAccessType === "PUBLIC"}
                      aria-label="Toggle public link sharing"
                      disabled={loading || sending || updatingGeneralAccess}
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess) return;
                        setInvitePermissionOpen(false);
                        setGeneralPermissionOpen(false);
                        const next = generalAccessType === "PUBLIC" ? "EMAIL_INVITE" : "PUBLIC";
                        handleGeneralAccessUpdate(next, generalPermission);
                      }}
                      className={[
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        generalAccessType === "PUBLIC" ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 ease-out",
                          generalAccessType === "PUBLIC" ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </button>
                  </div>

                  {generalAccessType === "PUBLIC" ? (
                    <>
                        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium text-muted">People with the link</p>
                        <div className="relative self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (loading || sending || updatingGeneralAccess) return;
                              setGeneralPermissionOpen((prev) => !prev);
                              setInvitePermissionOpen(false);
                            }}
                            disabled={loading || sending || updatingGeneralAccess}
                              className="inline-flex min-w-[150px] items-center justify-between rounded-lg border border-border bg-card py-2 pl-3 pr-2 text-sm text-text"
                          >
                            <span>{getPermissionLabel(generalPermission)}</span>
                            <ChevronDown size={14} className="text-muted" />
                          </button>
                          {generalPermissionOpen ? (
                            <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                              {PUBLIC_PERMISSION_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setGeneralPermission(option.value);
                                    handleGeneralAccessUpdate("PUBLIC", option.value);
                                    setGeneralPermissionOpen(false);
                                  }}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-surface"
                                >
                                  <span>{option.label}</span>
                                  {generalPermission === option.value ? <Check size={14} className="text-blue-600" /> : null}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                        <div className="mt-3 rounded-lg border border-border bg-card px-3 py-2">
                          <p className="mb-2 text-xs font-medium text-muted">Public link</p>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {publicLink ? (
                            <a
                              href={publicLink}
                              target="_blank"
                              rel="noreferrer"
                              className="min-w-0 flex-1 truncate text-left text-xs font-medium text-blue-600 underline sm:flex-initial sm:text-right"
                              title={publicLink}
                            >
                              Open public link
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            disabled={loading || sending || updatingGeneralAccess}
                            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Copy public link
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              {sendStatus.message ? (
                <p
                  className={[
                    "text-sm",
                    sendStatus.type === "success"
                      ? "text-emerald-600"
                      : sendStatus.type === "info"
                        ? "text-muted"
                        : "text-rose-600",
                  ].join(" ")}
                >
                  {sendStatus.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}
