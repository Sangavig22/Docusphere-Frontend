import React, { useState } from "react";
import { X, Shield, Users, UserCog } from "lucide-react";

export default function ChangeRoleModal({ isOpen, onClose, member, allMembers, onRoleChange, isAdmin = false }) {
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState("");
  const [newRole, setNewRole] = useState(member?.role || "MEMBER");

  if (!isOpen || !member) return null;

  const isLeader = member.role === "LEADER";
  const getMemberId = (m) => m?.userId ?? m?.id ?? m?._id;
  const getMemberName = (m) => m?.name ?? m?.userFullName ?? m?.fullName ?? "Unknown Member";
  
  const memberId = getMemberId(member);
  const otherMembers = allMembers.filter(m => getMemberId(m) !== memberId);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLeader) {
      if (!selectedNewLeaderId) return;
      const newLeader = otherMembers.find(m => getMemberId(m) == selectedNewLeaderId);
      onRoleChange(member, "MEMBER", newLeader); // Special case: transfer leadership from current leader
    } else {
      onRoleChange(member, newRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCog size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Change Role</h3>
              <p className="text-xs text-slate-500">Updating permissions for {getMemberName(member)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isLeader ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Shield className="text-amber-600 shrink-0" size={20} />
                <p className="text-sm text-amber-800">
                  <span className="font-bold">Transfer Leadership:</span> You are changing the role of the current Team Leader. Please assign a new Leader before proceeding.
                </p>
              </div>

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
                    <option key={getMemberId(m)} value={getMemberId(m)}>{getMemberName(m)} ({m.role})</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Note: {getMemberName(member)} will be demoted to <span className="font-semibold uppercase">Member</span> automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Assign New Position</label>
                <div className="grid grid-cols-2 gap-3">
                  {["MANAGER", "MEMBER"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewRole(role)}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        newRole === role
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {newRole === "MANAGER" 
                    ? "Managers can upload, edit, and view all team documents." 
                    : "Members can only upload and edit their own documents."}
              </p>
            </div>
          )}

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
              disabled={isLeader && !selectedNewLeaderId}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-200"
            >
              {isLeader ? "Transfer & Save" : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
