import OcrProcessingStepper from "./OcrProcessingStepper";

export default function ProcessingStateCard({ fileName, activeStep, steps, onCancel }) {
  return (
    <div className="flex min-h-[400px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-card p-8 text-center ring-offset-4">
      <div className="mx-auto mb-5">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>

      <h3 className="text-xl font-bold text-text">Processing document...</h3>
      <p className="mt-2 text-sm font-medium text-muted">{fileName}</p>
      <p className="mt-1 text-xs text-muted">This may take a few moments.</p>

      <div className="mt-10 w-full">
        <OcrProcessingStepper steps={steps} activeIndex={activeStep} />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-10 text-sm font-semibold text-blue-500 hover:text-blue-600"
      >
        Cancel
      </button>
    </div>
  );
}
