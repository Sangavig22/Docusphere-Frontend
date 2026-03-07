export default function UploadCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
      <div className="mb-6 shrink-0 md:mb-7">
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-base text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
