import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeamHeader from "../components/Team/TeamHeader";
import TeamTabs from "../components/Team/TeamTabs";
import MembersTable from "../components/Team/MembersTable";
import DocumentsList from "../components/Team/DocumentsList";
import AddMemberModal from "../components/Team/AddMemberModal";
import DocumentsToolbar from "../components/documents/DocumentsToolbar";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import { DEFAULT_DOCUMENT_ACTIONS } from "../components/documents/DocumentActionsMenu";
import useDocumentActions from "../hooks/useDocumentActions";
import { ChevronLeft } from "lucide-react";
import authService from "../services/authService";

import { useTeamMemberDetails } from "../hooks/useTeamMemberDetails";
import { useTeamDocuments } from "../hooks/useTeamDocuments";

function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teamData, members, isLoading: isTeamLoading, error: teamError, addMember, deleteMember, updateMemberRole, transferLeader } = useTeamMemberDetails(teamId);
  const { documents, isLoading: isDocsLoading, error: docsError, deleteDocument, refetch: refetchDocs, toggleStar } = useTeamDocuments(teamId);

  // Document action handlers (rename, duplicate, move, download, trash, etc.)
  const { modalState, loadingAction, handleAction, closeModal, submitModal } = useDocumentActions({ 
    onSuccess: (type, doc) => {
      if (type === "preview" && doc) {
        navigate(`/documents/${doc.id}/preview`);
      } else {
        refetchDocs();
      }
    } 
  });

  const isLoading = isTeamLoading || isDocsLoading;
  const error = teamError || docsError;

  const [activeTab, setActiveTab] = useState("Documents");
  const [showModal, setShowModal] = useState(false);
  const [roleModal, setRoleModal] = useState({ isOpen: false, member: null });
  
  const [toolbar, setToolbar] = useState({
    query: "",
    filter: "all",
    sort: "name_asc",
    view: "grid",
  });

  const currentUserId = authService.getUserId();
  const currentUserMember = members.find(m => String(m.userId || m.id) === String(currentUserId));
  const currentUserRole = currentUserMember?.role || "";
  const normalizedCurrentUserRole = String(currentUserRole || "").toUpperCase();
  const isLeader = normalizedCurrentUserRole === "LEADER";
  const canManageAllTeamDocs = isLeader || normalizedCurrentUserRole === "MANAGER";

  const updateToolbar = (key, value) => {
    setToolbar((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoleUpdate = async (member, newRole, newLeader = null) => {
    try {
      if (newLeader) {
        // Transfer leadership
        const newLeaderId = newLeader.userId ?? newLeader.id ?? newLeader._id;
        await transferLeader(newLeaderId);
        toast.success(`Leadership transferred to ${newLeader.name ?? newLeader.userFullName ?? "the new leader"}`);
      } else {
        await updateMemberRole(member, newRole);
        toast.success(`${member.name ?? member.userFullName ?? "Member"}'s role updated to ${newRole}`);
      }
    } catch (err) {
      toast.error(`Failed to update role: ${err.message || err.toString()}`);
    }
  };

  const handleMemberDelete = async (member) => {
    const memberName = member.name ?? member.userFullName ?? member.fullName ?? "Member";
    const memberId = member.userId ?? member.id ?? member._id;
    try {
      await deleteMember(memberId);
      toast.success(`${memberName} removed from team`);
    } catch (err) {
      toast.error(`Failed to remove member: ${err.message || err.toString()}`);
    }
  };

  const handleDocumentDelete = async (doc) => {
    try {
      await deleteDocument(doc.id);
      toast.success(`Document "${doc.name}" deleted`);
    } catch (err) {
      toast.error(`Failed to delete document: ${err.message || err.toString()}`);
    }
  };

  const handleUploadNavigation = () => {
    localStorage.setItem("teamId", teamId);
    navigate("/uploads");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
        <p className="text-red-600">Error loading team details: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate("/team")} 
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 transition-all duration-300 hover:border-blue-200 hover:text-blue-700 hover:shadow-md active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <ChevronLeft size={16} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1 text-slate-400 group-hover:text-blue-600" />
        <span className="relative z-10">Back to Teams</span>
      </button>

      <TeamHeader
        team={teamData}
        members={members}
        onUpload={handleUploadNavigation}
        onAdd={() => setShowModal(true)}
        canAddMembers={activeTab === "Members" && isLeader}
      />

      <TeamTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Documents" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <DocumentsToolbar
              query={toolbar.query}
              onQueryChange={(v) => updateToolbar("query", v)}
              filterType={toolbar.filter}
              onFilterTypeChange={(v) => updateToolbar("filter", v)}
              sortKey={toolbar.sort}
              onSortKeyChange={(v) => updateToolbar("sort", v)}
               viewMode={toolbar.view}
              onViewModeChange={(v) => updateToolbar("view", v)}
              Sort={true}
              Filter={false}
            />
          </div>

          <DocumentsList
            documents={documents}
            viewMode={toolbar.view}
            searchQuery={toolbar.query}
            filterType={toolbar.filter}
            sortKey={toolbar.sort}
            onDelete={handleDocumentDelete}
            onAction={handleAction}
            onToggleStar={toggleStar}
            actions={DEFAULT_DOCUMENT_ACTIONS}
            canManageAllTeamDocs={canManageAllTeamDocs}
            showStar={false}
          />
          <DocumentActionModal
            open={modalState.open}
            type={modalState.type}
            title={modalState.title}
            message={modalState.message}
            value={modalState.value}
            options={modalState.options}
            confirmText={modalState.confirmText}
            confirmVariant={modalState.confirmVariant}
            loading={loadingAction}
            onClose={closeModal}
            onConfirm={submitModal}
          />
        </div>
      )}

      {activeTab === "Members" && (
        <MembersTable
          members={members}
          onDelete={handleMemberDelete}
          useActionMenu={true}
          onChangeRole={(m) => setRoleModal({ isOpen: true, member: m })}
          currentUserRole={currentUserRole}
          isAdmin={false}
          currentUserId={currentUserId}
        />
      )}

      <ToastContainer />
      <AddMemberModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddMember={addMember}
      />
    </div>
  );
}



export default TeamDetail;