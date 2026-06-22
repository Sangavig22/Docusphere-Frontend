export default function RestoreVersionDialog({ version, loading, onCancel, onConfirm }) {
  if (!version) return null;

  return (
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-slate-900/40" onMouseDown={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <h4 className="text-lg font-semibold text-text">Restore Version?</h4>
          <p className="mt-2 text-sm text-muted">
            The current document state will be saved as a new version before restoration.
          </p>
          <p className="mt-2 text-sm font-medium text-text">
            Restoring Version {version.versionNumber} ({version.changeSummary || "Document edited"})
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Restoring..." : "Restore"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
