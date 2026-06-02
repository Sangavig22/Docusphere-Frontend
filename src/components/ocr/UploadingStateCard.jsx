export default function UploadingStateCard({ fileName, sizeLabel, percent, onCancel }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{fileName}</p>
          <p className="mt-1 text-xs text-muted">{sizeLabel}</p>
          <p className="mt-3 text-sm text-muted">Uploading document...</p>
        </div>
        <span className="text-sm font-semibold text-blue-700">{percent}%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-card">
        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-card"
      >
        Cancel
      </button>
    </div>
  );
}
