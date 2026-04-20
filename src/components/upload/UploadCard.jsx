export default function UploadCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-[520px] min-w-0 w-full flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:min-h-[560px] sm:p-8 md:p-9">
      <div className="mb-6 min-w-0 shrink-0 sm:mb-7">
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.75rem]">{title}</h2>
        {subtitle ? (
          <p className="mt-2.5 text-sm text-slate-500 sm:text-[0.95rem]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}