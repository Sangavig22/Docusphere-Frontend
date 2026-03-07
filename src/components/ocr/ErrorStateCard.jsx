export default function ErrorStateCard({ message, onTryAgain }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-base font-semibold text-red-700">Upload Failed</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onTryAgain}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
