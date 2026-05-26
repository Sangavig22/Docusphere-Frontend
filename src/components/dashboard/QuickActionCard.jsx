const colorClasses = {
  indigo: "bg-indigo-50 text-indigo-800",
  emerald: "bg-emerald-50 text-emerald-800",
  sky: "bg-sky-50 text-sky-800",
  amber: "bg-amber-50 text-amber-800",
  rose: "bg-rose-50 text-rose-800",
};

function QuickActionCard({ title, description, icon, color = "indigo" }) {
  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <button
      className={`flex flex-col items-start gap-2 rounded-xl px-4 py-3 text-left transition-shadow hover:shadow-md ${colors}`}
    >
      {icon && (
        <div className="h-9 w-9 rounded-lg bg-card/80 flex items-center justify-center text-current shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs opacity-80">{description}</p>
      </div>
    </button>
  );
}

export default QuickActionCard;
