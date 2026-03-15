export default function UploadingStateCard({ fileName, sizeLabel, percent, onCancel }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{fileName}</p>
          <p className="mt-1 text-xs text-slate-500">{sizeLabel}</p>
          <p className="mt-3 text-sm text-slate-600">Uploading document...</p>
        </div>
        <span className="text-sm font-semibold text-blue-700">{percent}%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
    </div>
  );
}
