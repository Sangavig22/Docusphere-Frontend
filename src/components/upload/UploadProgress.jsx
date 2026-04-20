
export default function UploadProgress({
  filename,
  percent,
  fileSize,
  showCancel = false,
  onCancel,
}) {
  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-700">{filename}</p>
          {fileSize && <p className="text-xs text-slate-500">{formatSize(fileSize)}</p>}
        </div>
        <span className="text-sm font-medium text-slate-600">{percent}%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {percent < 100 ? "Please wait while your file is being uploaded." : "Upload complete."}
      </p>

      {showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </button>
      )}
    </div>
  );
}