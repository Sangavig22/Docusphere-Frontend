export default function SuccessBanner({ fileName }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-100/60 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-green-700">OCR Complete</p>
          <p className="text-sm text-green-700/90">Text extracted successfully from {fileName}</p>
        </div>
      </div>
    </div>
  );
}
