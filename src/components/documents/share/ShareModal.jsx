import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Globe, Lock } from "lucide-react";
import EmailInput, { isValidEmail } from "./EmailInput";
import SharedUsersList from "./SharedUsersList";
import {
  getPermissionLabel,
  getInvitePermissionHint,
  getPublicPermissionHint,
  INVITE_PERMISSION_OPTIONS,
  PUBLIC_PERMISSION_OPTIONS,
} from "./sharePermissions";
import { isDocumentProtected } from "../../../utils/documentProtection";
import { TOAST_ACTION_IDS, showSingleToast } from "../../../utils/toastFeedback";
import { revokeDocumentShare, fetchDocumentShares } from "../../../services/documentActionsService";
import {
  extractShareMetadata,
  formatShareExpiry,
  parseDocumentShares,
  PUBLIC_LINK_EXPIRY_OPTIONS,
  resolveShareExpiresAt,
} from "../../../utils/shareLinkUtils";

function resolveDocumentShareId(document) {
  return document?.apiId || document?.id || document?.documentId || "";
}

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
  const [shareToken, setShareToken] = useState("");
  const [linkExpiresAt, setLinkExpiresAt] = useState("");
  const [publicLinkExpiryChoice, setPublicLinkExpiryChoice] = useState("default");
  const [emailInviteExpiryChoice, setEmailInviteExpiryChoice] = useState("default");
  const [revokingLink, setRevokingLink] = useState(false);
  const [revokingInviteToken, setRevokingInviteToken] = useState("");
  const [activeEmailInvites, setActiveEmailInvites] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingGeneralAccess, setUpdatingGeneralAccess] = useState(false);
  const [invitePermissionOpen, setInvitePermissionOpen] = useState(false);
  const [generalPermissionOpen, setGeneralPermissionOpen] = useState(false);
  const [expiryChoiceOpen, setExpiryChoiceOpen] = useState(false);
  const [emailExpiryChoiceOpen, setEmailExpiryChoiceOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState({ type: "", message: "" });
  const documentName = useMemo(() => document?.name || "Document", [document?.name]);
  const documentShareId = useMemo(() => resolveDocumentShareId(document), [document]);

  const loadExistingShares = useCallback(async () => {
    if (!documentShareId) return;
    setSharesLoading(true);
    try {
      const payload = await fetchDocumentShares(documentShareId);
      const items = parseDocumentShares(payload);
      const publicShare = items.find((item) => item.type === "PUBLIC");
      const emailShares = items.filter(
        (item) => item.type === "EMAIL_INVITE" || item.type === "EMAIL" || item.invitedEmail,
      );

      setActiveEmailInvites(emailShares);

      if (publicShare?.token) {
        setGeneralAccessType("PUBLIC");
        setShareToken(publicShare.token);
        setPublicLink(publicShare.shareUrl || "");
        setLinkExpiresAt(publicShare.expiresAt || "");
        setGeneralPermission(publicShare.permission || "VIEW");
      }
    } catch {
      // Keep modal usable when list endpoint is unavailable.
    } finally {
      setSharesLoading(false);
    }
  }, [documentShareId]);

  useEffect(() => {
    if (!open) return;
    setEmailDraft("");
    setEmailError("");
    setRecipients([]);
    setInvitePermission("VIEW");
    setGeneralAccessType("EMAIL_INVITE");
    setGeneralPermission("VIEW");
    setPublicLink("");
    setShareToken("");
    setLinkExpiresAt("");
    setPublicLinkExpiryChoice("default");
    setEmailInviteExpiryChoice("default");
    setRevokingLink(false);
    setRevokingInviteToken("");
    setActiveEmailInvites([]);
    setSharesLoading(false);
    setSending(false);
    setUpdatingGeneralAccess(false);
    setInvitePermissionOpen(false);
    setGeneralPermissionOpen(false);
    setExpiryChoiceOpen(false);
    setEmailExpiryChoiceOpen(false);
    setSendStatus({ type: "", message: "" });
    loadExistingShares();
  }, [open, loadExistingShares]);

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

  function handleRemoveRecipient(email) {
    setRecipients((prev) => prev.filter((item) => item !== email));
    setSendStatus({ type: "", message: "" });
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
      const expiresAt = resolveShareExpiresAt(emailInviteExpiryChoice);
      await onShareWithPeople?.(document, {
        type: "EMAIL_INVITE",
        permission: invitePermission,
        emails: deduped,
        ...(expiresAt ? { expiresAt } : {}),
      });
      showSingleToast(TOAST_ACTION_IDS.SHARE, "Document shared successfully.");
      setRecipients(deduped);
      setEmailDraft("");
      setEmailError("");
      setSendStatus({ type: "success", message: "Document shared successfully." });
      await loadExistingShares();
    } catch {
      setSendStatus({ type: "error", message: "Failed to share document. Please try again." });
    } finally {
      setSending(false);
    }
  }

  async function clearPublicShare({ notify = false } = {}) {
    const docId = resolveDocumentShareId(document);
    if (shareToken && docId) {
      try {
        await revokeDocumentShare(docId, shareToken);
        if (notify) {
          showSingleToast(TOAST_ACTION_IDS.GENERAL_ACCESS, "Link revoked.");
        }
      } catch {
        if (notify) {
          setSendStatus({ type: "error", message: "Failed to revoke link." });
        }
        throw new Error("Failed to revoke link.");
      }
    }
    setGeneralAccessType("EMAIL_INVITE");
    setPublicLink("");
    setShareToken("");
    setLinkExpiresAt("");
    setSendStatus({ type: "", message: "" });
    return true;
  }

  async function handleGeneralAccessUpdate(
    nextType,
    nextPermission = generalPermission,
    expiryChoice = publicLinkExpiryChoice,
  ) {
    setUpdatingGeneralAccess(true);
    setSendStatus({ type: "", message: "" });
    try {
      if (nextType === "EMAIL_INVITE") {
        try {
          await clearPublicShare();
        } catch {
          setSendStatus({ type: "error", message: "Failed to revoke link." });
          return "";
        }
        return "";
      }

      const expiresAt = resolveShareExpiresAt(expiryChoice);
      const payload = await onShareWithPeople?.(document, {
        type: "PUBLIC",
        permission: nextPermission,
        ...(expiresAt ? { expiresAt } : {}),
      });
      const meta = extractShareMetadata(payload);
      const nextLink = meta.shareUrl || payload?.shareUrl || payload?.data?.shareUrl || "";
      setGeneralAccessType("PUBLIC");
      setGeneralPermission(nextPermission);
      setPublicLink(nextLink);
      setShareToken(meta.token || "");
      setLinkExpiresAt(meta.expiresAt || "");
      showSingleToast(TOAST_ACTION_IDS.GENERAL_ACCESS, "Link shared successfully.");
      setSendStatus({ type: "success", message: "Link shared successfully." });
      return nextLink;
    } catch {
      setSendStatus({ type: "error", message: "Failed to update general access." });
      return "";
    } finally {
      setUpdatingGeneralAccess(false);
    }
  }

  async function handleRevokeInvite(invite) {
    const docId = resolveDocumentShareId(document);
    const inviteToken = invite?.token;
    if (!docId || !inviteToken) return;

    setRevokingInviteToken(inviteToken);
    setSendStatus({ type: "", message: "" });
    try {
      await revokeDocumentShare(docId, inviteToken);
      setActiveEmailInvites((prev) => prev.filter((item) => item.token !== inviteToken));
      showSingleToast(TOAST_ACTION_IDS.SHARE, "Access revoked.");
      setSendStatus({ type: "success", message: "Access revoked." });
    } catch {
      setSendStatus({ type: "error", message: "Failed to revoke access." });
    } finally {
      setRevokingInviteToken("");
    }
  }

  async function handleRevokeLink() {
    setRevokingLink(true);
    setSendStatus({ type: "", message: "" });
    try {
      const cleared = await clearPublicShare({ notify: true });
      if (cleared) {
        setSendStatus({ type: "success", message: "Link revoked." });
      }
    } finally {
      setRevokingLink(false);
    }
  }

  async function handleCopyLink() {
    try {
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
            className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
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
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-5">
              {isDocumentProtected(document) ? (
                <p className="rounded-xl bg-surface px-3 py-2.5 text-xs leading-relaxed text-muted">
                  Shared users will need the document password to open or download this file.
                </p>
              ) : null}
              <EmailInput
                value={emailDraft}
                onChange={(value) => {
                  setEmailDraft(value);
                  if (emailError) setEmailError("");
                }}
                onAdd={handleAddEmail}
                disabled={loading || sending || updatingGeneralAccess || revokingLink}
                error={emailError}
              />

              <section className="space-y-4 rounded-2xl border border-border bg-surface/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-text">Invite permission</p>
                  <div className="relative self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess) return;
                        setInvitePermissionOpen((prev) => !prev);
                        setGeneralPermissionOpen(false);
                        setExpiryChoiceOpen(false);
                        setEmailExpiryChoiceOpen(false);
                      }}
                      disabled={loading || sending || updatingGeneralAccess || revokingLink}
                      className="inline-flex min-w-[150px] items-center justify-between rounded-xl border border-border bg-card py-2.5 pl-3 pr-2 text-sm text-text"
                    >
                      <span>{getPermissionLabel(invitePermission)}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                    {invitePermissionOpen ? (
                      <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
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

                <p className="text-xs leading-relaxed text-muted">
                  {getInvitePermissionHint(invitePermission)}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-muted">Invite expires</p>
                  <div className="relative self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess || revokingLink) return;
                        setEmailExpiryChoiceOpen((prev) => !prev);
                        setInvitePermissionOpen(false);
                        setGeneralPermissionOpen(false);
                        setExpiryChoiceOpen(false);
                      }}
                      disabled={loading || sending || updatingGeneralAccess || revokingLink}
                      className="inline-flex min-w-[150px] items-center justify-between rounded-xl border border-border bg-card py-2.5 pl-3 pr-2 text-sm text-text"
                    >
                      <span>
                        {PUBLIC_LINK_EXPIRY_OPTIONS.find((o) => o.value === emailInviteExpiryChoice)?.label ||
                          "24 hours (default)"}
                      </span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                    {emailExpiryChoiceOpen ? (
                      <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                        {PUBLIC_LINK_EXPIRY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setEmailInviteExpiryChoice(option.value);
                              setEmailExpiryChoiceOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-surface"
                          >
                            <span>{option.label}</span>
                            {emailInviteExpiryChoice === option.value ? (
                              <Check size={14} className="text-blue-600" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <SharedUsersList
                    users={recipients}
                    permission={invitePermission}
                    onRemove={handleRemoveRecipient}
                    activeInvites={activeEmailInvites}
                    onRevokeInvite={handleRevokeInvite}
                    revokingToken={revokingInviteToken}
                    disabled={
                      loading ||
                      sending ||
                      updatingGeneralAccess ||
                      revokingLink ||
                      revokingInviteToken ||
                      sharesLoading
                    }
                  />
                </div>
              </section>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    loading ||
                    sending ||
                    updatingGeneralAccess ||
                    revokingLink ||
                    (recipients.length === 0 && !String(emailDraft || "").trim())
                  }
                  className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-text">General access</p>
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
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
                        {generalAccessType === "PUBLIC" && linkExpiresAt ? (
                          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                            Active link expires on {formatShareExpiry(linkExpiresAt)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={generalAccessType === "PUBLIC"}
                      aria-label="Toggle public link sharing"
                      disabled={loading || sending || updatingGeneralAccess || revokingLink}
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess || revokingLink) return;
                        setInvitePermissionOpen(false);
                        setGeneralPermissionOpen(false);
                        setExpiryChoiceOpen(false);
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
                      <div className="mt-4 space-y-3 border-t border-border pt-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-text">Link permission</p>
                          <div className="relative self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => {
                                if (loading || sending || updatingGeneralAccess || revokingLink) return;
                                setGeneralPermissionOpen((prev) => !prev);
                                setInvitePermissionOpen(false);
                                setExpiryChoiceOpen(false);
                                setEmailExpiryChoiceOpen(false);
                              }}
                              disabled={loading || sending || updatingGeneralAccess || revokingLink}
                              className="inline-flex min-w-[150px] items-center justify-between rounded-xl border border-border bg-card py-2.5 pl-3 pr-2 text-sm text-text"
                            >
                              <span>{getPermissionLabel(generalPermission)}</span>
                              <ChevronDown size={14} className="text-muted" />
                            </button>
                            {generalPermissionOpen ? (
                              <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
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
                                    {generalPermission === option.value ? (
                                      <Check size={14} className="text-blue-600" />
                                    ) : null}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted">
                          {getPublicPermissionHint(generalPermission)}
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium text-muted">Link expires</p>
                          <div className="relative self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => {
                                if (loading || sending || updatingGeneralAccess || revokingLink) return;
                                setExpiryChoiceOpen((prev) => !prev);
                                setInvitePermissionOpen(false);
                                setGeneralPermissionOpen(false);
                                setEmailExpiryChoiceOpen(false);
                              }}
                              disabled={loading || sending || updatingGeneralAccess || revokingLink}
                              className="inline-flex min-w-[150px] items-center justify-between rounded-xl border border-border bg-card py-2.5 pl-3 pr-2 text-sm text-text"
                            >
                              <span>
                                {PUBLIC_LINK_EXPIRY_OPTIONS.find((o) => o.value === publicLinkExpiryChoice)?.label ||
                                  "24 hours (default)"}
                              </span>
                              <ChevronDown size={14} className="text-muted" />
                            </button>
                            {expiryChoiceOpen ? (
                              <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                                {PUBLIC_LINK_EXPIRY_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setPublicLinkExpiryChoice(option.value);
                                      setExpiryChoiceOpen(false);
                                      if (publicLink) {
                                        handleGeneralAccessUpdate("PUBLIC", generalPermission, option.value);
                                      }
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-surface"
                                  >
                                    <span>{option.label}</span>
                                    {publicLinkExpiryChoice === option.value ? (
                                      <Check size={14} className="text-blue-600" />
                                    ) : null}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-3">
                          <p className="text-xs font-medium text-muted">Public link</p>
                          {publicLink ? (
                            <input
                              readOnly
                              value={publicLink}
                              title={publicLink}
                              className="mt-2 w-full truncate rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text"
                            />
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              disabled={loading || sending || updatingGeneralAccess || revokingLink}
                              className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                              Copy link
                            </button>
                            {publicLink ? (
                              <a
                                href={publicLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-text hover:bg-surface sm:flex-none"
                              >
                                Open link
                              </a>
                            ) : null}
                          </div>
                          {shareToken ? (
                            <div className="mt-3 border-t border-border pt-3">
                              <button
                                type="button"
                                onClick={handleRevokeLink}
                                disabled={loading || sending || updatingGeneralAccess || revokingLink}
                                className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
                              >
                                {revokingLink ? "Revoking link..." : "Revoke public link"}
                              </button>
                              <p className="mt-1 text-xs text-muted">
                                Anyone with this link will lose access immediately.
                              </p>
                            </div>
                          ) : null}
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
      </div>
    ) : null
  );
}
