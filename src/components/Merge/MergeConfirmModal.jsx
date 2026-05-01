import { GitMerge, X, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Confirmation modal shown before merging two teams.
 * Displays a summary of source + target teams, new name, leader, and member count.
 */
export default function MergeConfirmModal({ open, onClose, onConfirm, source, target, newName, leader, memberCount, isProcessing, moveDocuments, onMoveDocumentsChange }) {
  if (!open || !source || !target) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitMerge size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Merge</h3>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">Review the merge details carefully. This action cannot be undone.</p>

          {/* Teams being merged */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
            <div className="flex-1 text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Primary</div>
              <div className="text-sm font-bold text-slate-900">{source.name ?? source.teamName}</div>
              <div className="text-xs text-slate-500">{source.memberCount ?? 0} members</div>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <GitMerge size={14} />
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Secondary</div>
              <div className="text-sm font-bold text-slate-900">{target.name ?? target.teamName}</div>
              <div className="text-xs text-slate-500">{target.memberCount ?? 0} members</div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            <div className="flex justify-between items-center rounded-lg bg-slate-50 px-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase font-semibold">New Team Name</span>
              <span className="text-sm font-semibold text-slate-900">{newName}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-slate-50 px-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase font-semibold">New Leader</span>
              <span className="text-sm font-semibold text-blue-600">{leader?.fullName ?? leader?.userFullName ?? leader?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-slate-50 px-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase font-semibold">Combined Members</span>
              <span className="text-sm font-semibold text-slate-900">{memberCount}</span>
            </div>
          </div>

          {/* Document Migration Option */}
          <div className={`p-4 rounded-xl border transition-colors ${moveDocuments ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center pt-0.5">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer transition-all"
                  checked={moveDocuments}
                  onChange={(e) => onMoveDocumentsChange(e.target.checked)}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900 mb-1">
                  Move Documents
                </div>
                <p className="text-xs text-slate-600">
                  If selected, all documents from both source teams will be transferred to the new merged team.
                </p>
                {moveDocuments && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-amber-200/50">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium">
                      Both source teams will be kept, but their documents will be moved to the new merged team.
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 flex gap-3 justify-end">
          <button onClick={onClose} disabled={isProcessing} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <GitMerge size={16} />
                Confirm Merge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
