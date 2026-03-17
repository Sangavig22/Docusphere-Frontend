export default function ErrorStateCard({ message, onTryAgain }) {
  return (
    <div className="flex min-h-[350px] w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-red-400 bg-red-50/50 p-8 text-center transition-all">
      {/* Icon Circle */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100/80 shadow-sm">
        <span className="text-xl font-bold text-red-500">!</span>
      </div>
      
      {/* Text Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-red-600">Upload Failed</h3>
        <p className="max-w-md text-sm font-medium text-red-500/80 leading-relaxed">
          {message || "Upload failed. The file is corrupted or exceeds the size limit."}
        </p>
      </div>
      
      {/* Action Button */}
      <button
        type="button"
        onClick={onTryAgain}
        className="mt-2 rounded-xl bg-[#0f172a] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
