import { useId, useMemo } from "react";

//Name Input
export function NameInput({ value, onChange, placeholder = "Enter name" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  );
}

//Email Input
export function EmailInput({ value, onChange, placeholder = "Enter email", suggestions = [] }) {
  const listId = useId();
  const normalizedSuggestions = useMemo(() => {
    const items = Array.isArray(suggestions) ? suggestions : [];
    return Array.from(
      new Set(
        items
          .map((item) => {
            if (typeof item === "string") return item.trim();
            return String(item?.email || item?.userEmail || item?.mail || "").trim();
          })
          .filter(Boolean),
      ),
    );
  }, [suggestions]);

  return (
    <>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={normalizedSuggestions.length ? listId : undefined}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {normalizedSuggestions.length ? (
        <datalist id={listId}>
          {normalizedSuggestions.map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>
      ) : null}
    </>
  );
}

//Role Selector
export function RoleSelector({ role, setRole, roles }) {
  const defaultRoles = [
    {
      name: "Member",
      value: "MEMBER",
      description: "Can upload and edit own documents",
    },
    {
      name: "Manager",
      value: "MANAGER",
      description: "Can upload, edit, and view all documents",
    },
  ];

  const roleOptions = roles?.length ? roles : defaultRoles;

  const selected = roleOptions.find((r) => r.value === role);

  return (
    <div>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {roleOptions.map((r) => (
          <option key={r.value} value={r.value}>
            {r.name}
          </option>
        ))}
      </select>

      <p className="text-xs text-slate-500 mt-1">
        {selected?.description}
      </p>
    </div>
  );
}