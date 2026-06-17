import { Crown, GitMerge } from "lucide-react";

/**
 * Configuration card for entering the merged team name, choosing a leader,
 * and triggering the merge action.
 */
export default function MergeConfigCard({ newName,onNameChange,leaderChoice,onLeaderChange,leaderCandidates,source,target,loadingMembers,canMerge,onReset,onMerge,}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
        <h3 className="text-sm font-bold text-slate-900">Merge Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
            Merged Team Name
          </label>
          <input
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter new team name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 transition-colors"
          />
          <p className="mt-1.5 text-[11px] text-slate-400 italic">
            Tip: Use a clear and descriptive name
          </p>
        </div>

        {/* Leader */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
            New Team Leader
          </label>
          <div className="relative">
            <Crown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            <select
              value={leaderChoice}
              onChange={(e) => onLeaderChange(e.target.value)}
              disabled={!source || !target || loadingMembers}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Choose a leader...</option>
              {leaderCandidates.map((m) => {
                const id = m.userId ?? m.id ?? m._id;
                const name = m.fullName ?? m.userFullName ?? m.name ?? "Unknown";
                const role = m.role ?? "MEMBER";
                return (
                  <option key={id} value={id}>
                    {name} ({role}) — from {m.fromTeam}
                  </option>
                );
              })}
              {source && target && !loadingMembers && leaderCandidates.length === 0 && (
                <option value="" disabled>No members found</option>
              )}
            </select>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400 italic">
            All members from both teams are listed
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Reset Form
        </button>
        <button
          type="button"
          disabled={!canMerge}
          onClick={onMerge}
          className={[
            "w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            canMerge
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          ].join(" ")}
        >
          <GitMerge size={16} />
          Merge Teams
        </button>
      </div>
    </div>
  );
}
