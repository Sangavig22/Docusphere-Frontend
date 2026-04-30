import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Check, ChevronDown, Globe, Lock } from "lucide-react";
import EmailInput, { isValidEmail } from "./EmailInput";
import SharedUsersList from "./SharedUsersList";

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
  const [generalAccessOpen, setGeneralAccessOpen] = useState(false);
  const [generalPermissionOpen, setGeneralPermissionOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState({ type: "", message: "" });
  const title = useMemo(() => `Share "${document?.name || "Document"}"`, [document?.name]);

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
    setGeneralAccessOpen(false);
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
      toast.success("Document shared successfully");
      setRecipients(deduped);
      setEmailDraft("");
      setEmailError("");
      setSendStatus({ type: "success", message: "Document shared successfully." });
    } catch {
      toast.error("Failed to share document");
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
        setSendStatus({ type: "success", message: "General access set to invited users only." });
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
      toast.success("General access updated");
      setSendStatus({ type: "success", message: "General access updated successfully." });
      return nextLink;
    } catch {
      toast.error("Failed to update general access");
      setSendStatus({ type: "error", message: "Failed to update general access." });
      return "";
    } finally {
      setUpdatingGeneralAccess(false);
    }
  }

  async function handleCopyLink() {
    try {
      let linkToCopy = publicLink;
      if (!linkToCopy) {
        // Lazily creates/refreshes public link before copy.
        linkToCopy = await handleGeneralAccessUpdate("PUBLIC", generalPermission);
      }
      if (!linkToCopy) {
        toast.warning("No public link available.");
        setSendStatus({ type: "error", message: "No public link available to copy." });
        return;
      }
      await navigator.clipboard.writeText(linkToCopy);
      toast.success("Link copied to clipboard");
      setSendStatus({ type: "success", message: "Link copied to clipboard." });
    } catch {
      toast.error("Unable to copy link");
      setSendStatus({ type: "error", message: "Unable to copy link." });
    }
  }

  return (
    open ? (
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-slate-200/35 backdrop-blur-[1px]" onMouseDown={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
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

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Invited people permission</p>
                    <p className="text-xs text-slate-500">Apply to users in the shared list</p>
                  </div>
                  <div className="relative self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (loading || sending || updatingGeneralAccess) return;
                        setInvitePermissionOpen((prev) => !prev);
                        setGeneralAccessOpen(false);
                        setGeneralPermissionOpen(false);
                      }}
                      disabled={loading || sending || updatingGeneralAccess}
                      className="inline-flex min-w-[150px] items-center justify-between rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-2 text-sm text-slate-700"
                    >
                      <span>{invitePermission === "COMMENT" ? "Can comment" : "Can view"}</span>
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                    {invitePermissionOpen ? (
                      <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                        {[
                          { value: "VIEW", label: "Can view" },
                          { value: "COMMENT", label: "Can comment" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setInvitePermission(option.value);
                              setInvitePermissionOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <span>{option.label}</span>
                            {invitePermission === option.value ? <Check size={14} className="text-blue-600" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <SharedUsersList users={recipients} permission={invitePermission} />

              <div>
                <p className="mb-2 text-base font-semibold text-slate-700">General access</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                        {generalAccessType === "PUBLIC" ? <Globe size={18} /> : <Lock size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (loading || sending || updatingGeneralAccess) return;
                              setGeneralAccessOpen((prev) => !prev);
                              setInvitePermissionOpen(false);
                              setGeneralPermissionOpen(false);
                            }}
                            disabled={loading || sending || updatingGeneralAccess}
                            className="inline-flex items-center gap-2 bg-transparent py-1 text-left text-sm font-semibold text-slate-900"
                          >
                            <span>{generalAccessType === "PUBLIC" ? "Anyone on the web with link" : "Only people invited"}</span>
                            <ChevronDown size={14} className="text-slate-500" />
                          </button>
                          {generalAccessOpen ? (
                            <div className="absolute left-0 top-9 z-30 min-w-[250px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                              {[
                                { value: "EMAIL_INVITE", label: "Only people invited" },
                                { value: "PUBLIC", label: "Anyone on the web with link" },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    handleGeneralAccessUpdate(option.value, generalPermission);
                                    setGeneralAccessOpen(false);
                                  }}
                                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                                >
                                  <span>{option.label}</span>
                                  {generalAccessType === option.value ? <Check size={14} className="text-blue-600" /> : null}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">
                          {generalAccessType === "PUBLIC"
                            ? "Anyone with this link can access"
                            : "Only explicitly invited users can access"}
                        </p>
                      </div>
                    </div>

                    <div className="relative self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (loading || sending || updatingGeneralAccess) return;
                          setGeneralPermissionOpen((prev) => !prev);
                          setInvitePermissionOpen(false);
                          setGeneralAccessOpen(false);
                        }}
                        disabled={loading || sending || updatingGeneralAccess}
                        className="inline-flex min-w-[150px] items-center justify-between rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-2 text-sm text-slate-700"
                      >
                        <span>{generalPermission === "COMMENT" ? "Can comment" : "Can view"}</span>
                        <ChevronDown size={14} className="text-slate-500" />
                      </button>
                      {generalPermissionOpen ? (
                        <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                          {[
                            { value: "VIEW", label: "Can view" },
                            { value: "COMMENT", label: "Can comment" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setGeneralPermission(option.value);
                                if (generalAccessType === "PUBLIC") {
                                  handleGeneralAccessUpdate("PUBLIC", option.value);
                                }
                                setGeneralPermissionOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <span>{option.label}</span>
                              {generalPermission === option.value ? <Check size={14} className="text-blue-600" /> : null}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  {publicLink ? (
                    <a
                      href={publicLink}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs font-medium text-blue-600 underline"
                      title={publicLink}
                    >
                      Open shared link
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={loading || sending || updatingGeneralAccess}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

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
              {sendStatus.message ? (
                <p
                  className={[
                    "text-sm",
                    sendStatus.type === "success" ? "text-emerald-600" : "text-rose-600",
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
