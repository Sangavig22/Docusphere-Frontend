import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { EmailInput, RoleSelector } from "./FormFields";
import { useTeamEmailSuggestions } from "../../hooks/useTeamEmailSuggestions";

function AddMemberModal({ isOpen, onClose, onAddMember, existingMembers = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const emailSuggestions = useTeamEmailSuggestions();

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error("Enter a valid email");
      return;
    }

    const exists = existingMembers.some(
      (m) => m.email?.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (exists) {
      toast.error("This member is already in the team");
      return;
    }

    onAddMember({
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      role,
    });

    toast.success("Invitation sent successfully!");
    setName("");
    setEmail("");
    setRole("MEMBER");
    onClose();
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setRole("MEMBER");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-slate-100">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Add Team User</h2>
          <button 
            onClick={handleCancel}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <EmailInput value={email} onChange={setEmail} placeholder="e.g. john@example.com" suggestions={emailSuggestions} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <RoleSelector role={role} setRole={setRole} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={handleCancel} 
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMemberModal;
