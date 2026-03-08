function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
      {icon && (
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      )}
      <div>
        <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {title}
        </h4>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard;
