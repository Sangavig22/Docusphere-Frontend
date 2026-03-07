export default function UploadCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm w-full">
      <div className="mb-5 sm:mb-6 shrink-0 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}