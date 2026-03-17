export default function SuccessBanner({ fileName }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-emerald-900">OCR Summarization Successful</h3>
        <p className="text-sm font-medium text-emerald-700/80">
          The document <span className="font-bold underline">"{fileName}"</span> has been fully processed and analyzed.
        </p>
      </div>
    </div>
  );
}
