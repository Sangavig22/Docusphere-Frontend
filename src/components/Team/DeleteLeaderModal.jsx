import React, { useState } from "react";
import { X, AlertTriangle, Users, Shield } from "lucide-react";

export default function DeleteLeaderModal({ 
  isOpen, 
  onClose, 
  leader, 
  allMembers, 
  onConfirm 
}) {
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !leader) return null;

  const getMemberId = (m) => m?.userId ?? m?.id ?? m?._id;
  const getMemberName = (m) => m?.name ?? m?.userFullName ?? m?.fullName ?? "Unknown Member";
  
  const leaderId = getMemberId(leader);
  const otherMembers = allMembers.filter(m => getMemberId(m) !== leaderId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNewLeaderId) return;

    setIsDeleting(true);
    const newLeader = otherMembers.find(m => String(getMemberId(m)) === String(selectedNewLeaderId));
    
    try {
      await onConfirm(leader, newLeader);
      onClose();
    } catch (err) {
      // Error is handled by the caller
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Delete Team Leader</h3>
              <p className="text-xs text-slate-500">Replacing {getMemberName(leader)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Shield className="text-amber-600 shrink-0" size={20} />
              <p className="text-sm text-amber-800">
                <span className="font-bold">Important:</span> A team must always have a leader. To delete the current leader, you must first assign their role to another member.
              </p>
            </div>

            {otherMembers.length > 0 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users size={16} /> Select New Leader
                </label>
                <select
                  required
                  value={selectedNewLeaderId}
                  onChange={(e) => setSelectedNewLeaderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="">Select a member...</option>
                  {otherMembers.map(m => (
                    <option key={getMemberId(m)} value={getMemberId(m)}>
                      {getMemberName(m)} ({m.role || "Member"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  After transferring leadership, {getMemberName(leader)} will be permanently removed from the team.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  There are no other members in this team to take over leadership. You must add another member before deleting the leader.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || (otherMembers.length === 0) || !selectedNewLeaderId}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200"
            >
              {isDeleting ? "Processing..." : "Transfer & Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
