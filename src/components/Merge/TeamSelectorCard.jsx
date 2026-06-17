import { Users } from "lucide-react";

/**
 * A card that displays a team selector dropdown with team info preview.
 * Used on the Merge Teams page for picking primary/secondary teams.
 */
export default function TeamSelectorCard({ label, sublabel, color, teams, value, onChange, disabledId }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  const selectedTeam = value ? teams.find(t => (t.id ?? t.teamId) === value) : null;

  return (
    <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border} group-hover:scale-110 transition-transform`}>
          <Users size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">{label}</h3>
          <p className="text-[11px] text-slate-400 font-medium">{sublabel}</p>
        </div>
      </div>

      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Select Team</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 transition-colors"
      >
        <option value="">Choose a team...</option>
        {teams.map((t) => {
          const id = t.id ?? t.teamId;
          const name = t.name ?? t.teamName;
          return (
            <option key={id} value={id} disabled={id === disabledId}>
              {name} ({t.memberCount ?? 0} members · {t.documentCount ?? 0} docs)
            </option>
          );
        })}
      </select>

      {/* Show selected team info */}
      {selectedTeam && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Members</span>
            <span className="font-semibold text-slate-800">{selectedTeam.memberCount ?? 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Documents</span>
            <span className="font-semibold text-slate-800">{selectedTeam.documentCount ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
