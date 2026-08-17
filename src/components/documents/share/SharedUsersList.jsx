import { Mail, Users, X } from "lucide-react";
import { getPermissionLabel, getPermissionRole } from "./sharePermissions";

export default function SharedUsersList({
  users = [],
  permission = "VIEW",
  onRemove,
  disabled = false,
  activeInvites = [],
  onRevokeInvite,
  revokingToken = "",
}) {
  return (
    <div className="space-y-4">
      {activeInvites.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users size={14} className="text-muted" />
            <p className="text-sm font-medium text-text">People with access</p>
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
              {activeInvites.length}
            </span>
          </div>
          <ul className="max-h-36 space-y-2 overflow-y-auto pr-1">
            {activeInvites.map((invite) => (
              <li
                key={invite.token || invite.id || invite.invitedEmail}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-text">{invite.invitedEmail}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                    {getPermissionLabel(invite.permission)}
                  </span>
                  {onRevokeInvite ? (
                    <button
                      type="button"
                      onClick={() => onRevokeInvite(invite)}
                      disabled={disabled || revokingToken === invite.token}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
                    >
                      {revokingToken === invite.token ? "Revoking..." : "Revoke"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Mail size={14} className="text-muted" />
          <p className="text-sm font-medium text-text">
            {activeInvites.length > 0 ? "Add more recipients" : "Recipients"}
          </p>
          {users.length > 0 ? (
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{users.length}</span>
          ) : null}
        </div>
        {users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-6 text-center">
            <Mail size={20} className="mx-auto mb-2 text-muted" />
            <p className="text-sm text-muted">Add emails above to share this document.</p>
          </div>
        ) : (
          <ul className="max-h-36 space-y-2 overflow-y-auto pr-1">
            {users.map((email) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-text">{email}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                    {getPermissionRole(permission)}
                  </span>
                  {onRemove ? (
                    <button
                      type="button"
                      onClick={() => onRemove(email)}
                      disabled={disabled}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Remove ${email}`}
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
