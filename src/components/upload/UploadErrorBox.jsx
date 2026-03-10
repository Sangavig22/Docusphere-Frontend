export default function UploadErrorBox({ message, onRetry, onChooseNew, showChooseNew }) {
  return (
    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-red-400 bg-red-50 p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <span className="font-bold text-red-600">!</span>
      </div>
      <h3 className="text-base font-semibold text-red-700">Upload Failed</h3>
      <p className="text-sm text-red-700/80">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {showChooseNew && onChooseNew ? (
          <button
            onClick={onChooseNew}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Choose Different File
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}