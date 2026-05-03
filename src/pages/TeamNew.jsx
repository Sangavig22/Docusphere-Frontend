import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { EmailInput, RoleSelector } from "../components/Team/FormFields";
import { teamsApi } from "../services/teamsApi";

// roles for regular users (no Leader option)
const userRoleOptions = [
  { name: "Member", value: "MEMBER", description: "Can upload and edit own documents" },
  { name: "Manager", value: "MANAGER", description: "Can upload, edit, and view all documents" },
];

// roles for admin (includes Leader)
const adminRoleOptions = [
  { name: "Leader", value: "LEADER", description: "Full administrative access to the team" },
  { name: "Member", value: "MEMBER", description: "Can upload and edit own documents" },
  { name: "Manager", value: "MANAGER", description: "Can upload, edit, and view all documents" },
];

function TeamNew({ backPath = "/team" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're on the admin route
  const isAdmin = location.pathname.startsWith("/admin");
  const resolvedBackPath = isAdmin ? "/admin/teams" : backPath;
  const baseRoles = isAdmin ? adminRoleOptions : userRoleOptions;

  const [teamName, setTeamName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentRole, setCurrentRole] = useState("MEMBER");
  const [members, setMembers] = useState([]);

  // Only one leader allowed — hide LEADER option once assigned
  const hasLeader = members.some((m) => m.role === "LEADER");
  const roleOptions = hasLeader
    ? baseRoles.filter((r) => r.value !== "LEADER")
    : baseRoles;

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // add member
  const handleAddMember = (e) => {
    e.preventDefault();

    const email = currentEmail.trim();

    if (!email) {
      toast.error("Enter email");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email");
      return;
    }

    const duplicate = members.some(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (duplicate) {
      toast.error("Already added");
      return;
    }

    // Prevent adding a second leader
    if (currentRole === "LEADER" && hasLeader) {
      toast.error("Only one leader allowed per team");
      return;
    }

    setMembers((prev) => [...prev, { email, role: currentRole }]);
    setCurrentEmail("");
    // Reset role selector to MEMBER after adding a leader
    if (currentRole === "LEADER") setCurrentRole("MEMBER");
  };

  const removeMember = (index) => {
    const removed = members[index];
    setMembers((prev) => prev.filter((_, i) => i !== index));
    // If leader was removed, reset role selector
    if (removed?.role === "LEADER") setCurrentRole("MEMBER");
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Enter team name");
      return;
    }

    try {
      if (isAdmin) {
        // Admin endpoint — roles assigned by admin are sent as-is (LEADER, MEMBER, MANAGER)
        const adminPayload = {
          name: teamName.trim(),
          additionalMembers: members.map(m => ({ email: m.email, role: m.role })),
        };
        await teamsApi.createAdminTeam(adminPayload);
      } else {
        // Regular user endpoint — POST /api/teams
        await teamsApi.createTeam({
          name: teamName.trim(),
          members,
        });
      }

      toast.success("Team created!");

      setTimeout(() => navigate(resolvedBackPath), 1000);
    } catch (err) {
      if (err?.status === 409 || err?.code === "TEAM_ALREADY_EXISTS") {
        toast.error("A team with this name already exists. Please choose another name.");
        return;
      }

      toast.error(err?.message || "Failed to create team");
    }
  };

  return (
    <>
      <ToastContainer />

      {/* ORIGINAL UI PRESERVED */}
      <div className="flex justify-center">
        <div className="mt-6 w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-6">

          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Create New Team
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Team Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Team Name
              </label>

              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Add Team Users
              </label>

              <EmailInput value={currentEmail} onChange={setCurrentEmail} />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Role
              </label>

              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <RoleSelector
                    role={currentRole}
                    setRole={setCurrentRole}
                    roles={roleOptions}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Members list */}
            {members.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Team Users ({members.length})
                </span>

                <ul className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  {members.map((m, index) => (
                    <li
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span>{m.email}</span>
                      <span>{m.role}</span>

                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(resolvedBackPath)}
                className="px-4 py-2 text-sm text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-full bg-blue-600 px-6 py-2 text-white"
              >
                Create Team
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default TeamNew;