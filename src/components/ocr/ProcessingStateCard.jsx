import OcrProcessingStepper from "./OcrProcessingStepper";

export default function ProcessingStateCard({ fileName, activeStep, steps, onCancel }) {
  return (
    <div className="flex min-h-[320px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
        <svg className="h-12 w-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-slate-900">Processing document...</h3>
      <p className="mt-1 text-sm text-slate-600">{fileName}</p>
      <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>

      <OcrProcessingStepper steps={steps} activeIndex={activeStep} />

      <button
        type="button"
        onClick={onCancel}
        className="mt-6 text-sm text-slate-500 underline hover:text-slate-700"
      >
        Cancel
      </button>
    </div>
  );
}
