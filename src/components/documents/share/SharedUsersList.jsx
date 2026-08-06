import { getPermissionRole } from "./sharePermissions";

export default function SharedUsersList({ users = [], permission = "VIEW" }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Shared list</p>
      <ul className="mt-2 space-y-2">
        {users.length === 0 ? (
          <li className="text-sm text-muted">No recipients added yet.</li>
        ) : (
          users.map((email) => (
            <li key={email} className="rounded-lg bg-card px-3 py-2 text-sm text-text">
              {email} ({getPermissionRole(permission)})
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
