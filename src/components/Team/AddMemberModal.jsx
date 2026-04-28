import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

// Internal Form Components
const NameInput = ({ value, onChange, placeholder = "Enter name" }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  />
);

const EmailInput = ({ value, onChange, placeholder = "Enter email" }) => (
  <input
    type="email"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  />
);

const RoleSelector = ({ role, setRole }) => {
  const roleOptions = [
    { name: "Member", value: "MEMBER", description: "Can upload and edit own documents" },
    { name: "Manager", value: "MANAGER", description: "Can upload, edit, and view all documents" },
    { name: "Leader", value: "LEADER", description: "Full administrative access to the team" },
  ];

  const selected = roleOptions.find((r) => r.value === role);

  return (
    <div>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {roleOptions.map((r) => (
          <option key={r.value} value={r.value}>{r.name}</option>
        ))}
      </select>
      <p className="text-xs text-slate-500 mt-1">{selected?.description}</p>
    </div>
  );
};

function AddMemberModal({ isOpen, onClose, onAddMember, existingMembers = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

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
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <NameInput value={name} onChange={setName} placeholder="e.g. John Doe" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <EmailInput value={email} onChange={setEmail} placeholder="e.g. john@example.com" />
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
