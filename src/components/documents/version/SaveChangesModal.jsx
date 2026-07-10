import { useEffect, useState } from "react";

export default function SaveChangesModal({
  open,
  loading = false,
  onClose,
  onSave,
}) {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!open) return;
    setSummary("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-slate-900/40" onMouseDown={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-text">Save Changes</h3>
          <p className="mt-1 text-sm text-muted">Optionally describe what changed in this version.</p>

          <label className="mt-4 block text-sm font-medium text-text" htmlFor="change-summary">
            Change Summary (Optional)
          </label>
          <textarea
            id="change-summary"
            rows={4}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Fixed formatting, added chapter 3, updated project requirements..."
            className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSave?.(summary)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
