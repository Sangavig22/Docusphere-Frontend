import { useMemo } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim().toLowerCase());
}

export default function EmailInput({ value, onChange, onAdd, disabled = false, error = "" }) {
  const hasValue = useMemo(() => String(value || "").trim().length > 0, [value]);

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          type="email"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="Add people by email"
          className="h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled || !hasValue}
          className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
