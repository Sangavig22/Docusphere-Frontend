import { getPasswordRequirementStatus } from "../../../utils/documentProtection";

export default function PasswordRequirementsChecklist({ password, showWhenEmpty = false }) {
  const value = String(password || "");
  if (!value && !showWhenEmpty) return null;

  const items = getPasswordRequirementStatus(value);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-700">Password requirements</p>
      <ul className="mt-1.5 space-y-1" aria-live="polite">
        {items.map((item) => (
          <li
            key={item.id}
            className={[
              "flex items-center gap-1.5 text-xs",
              item.met ? "text-emerald-700" : "text-slate-600",
            ].join(" ")}
          >
            <span className="w-3 shrink-0 text-center font-semibold" aria-hidden>
              {item.met ? "✓" : "✗"}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
