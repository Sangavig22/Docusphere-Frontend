import { getPermissionRole } from "./sharePermissions";

export default function SharedUsersList({ users = [], permission = "VIEW" }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shared list</p>
      <ul className="mt-2 space-y-2">
        {users.length === 0 ? (
          <li className="text-sm text-slate-500">No recipients added yet.</li>
        ) : (
          users.map((email) => (
            <li key={email} className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
              {email} ({getPermissionRole(permission)})
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
