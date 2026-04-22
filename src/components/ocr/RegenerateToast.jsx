export default function RegenerateToast({ show, title, subtitle, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-xs rounded-xl border border-blue-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-700">{title || "Regenerating summary..."}</p>
          <p className="mt-1 text-xs text-slate-600">{subtitle || "AI is creating a new summary..."}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          x
        </button>
      </div>
    </div>
  );
}
