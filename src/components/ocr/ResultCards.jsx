export default function ResultCards({
  document,
  onRegenerate,
  onEdit,
  onDelete,
  isRegenerating = false,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h3 className="text-lg font-semibold text-text sm:text-xl">Key Points</h3>
        <ol className="mt-4 space-y-3 text-base text-text">
          {document.keyPoints.map((point, index) => (
            <li key={point} className="flex gap-2">
              <span className="font-semibold text-muted">{index + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h3 className="text-lg font-semibold text-text sm:text-xl">AI Summary</h3>
        <p className="mt-4 text-base leading-7 text-text">{document.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-border px-5 py-2.5 text-base font-semibold text-text hover:bg-card"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-300 px-5 py-2.5 text-base font-semibold text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
