export default function ResultCards({
  document,
  onRegenerate,
  onEdit,
  onDelete,
  isRegenerating = false,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Key Points</h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          {document.keyPoints.map((point, index) => (
            <li key={point} className="flex gap-2">
              <span className="font-semibold text-slate-500">{index + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">AI Summary</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">{document.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
