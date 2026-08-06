import { useEffect, useMemo, useState } from "react";

export default function DocumentActionModal({
  open,
  type,
  title,
  message,
  value = "",
  options = [],
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  loading = false,
  onClose,
  onConfirm,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [selectedValue, setSelectedValue] = useState(options[0]?.value ?? "");

  useEffect(() => {
    setInputValue(value);
  }, [value, open]);

  useEffect(() => {
    setSelectedValue(options[0]?.value ?? "");
  }, [options, open]);

  const confirmClass = useMemo(() => {
    if (confirmVariant === "danger") {
      return "bg-rose-600 hover:bg-rose-700 text-white";
    }
    return "bg-blue-600 hover:bg-blue-700 text-white";
  }, [confirmVariant]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {message ? (
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{message}</p>
        ) : null}

        {type === "input" ? (
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter document name"
          />
        ) : null}

        {type === "select" ? (
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (type === "input") onConfirm?.(inputValue);
              else if (type === "select") onConfirm?.(selectedValue);
              else onConfirm?.();
            }}
            className={`rounded-lg px-3 py-2 text-sm ${confirmClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
