import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TeamHeader from "../components/Team/TeamHeader";
import TeamTabs from "../components/Team/TeamTabs";
import MembersTable from "../components/Team/MembersTable";
import DocumentsList from "../components/Team/DocumentsList";
import AddMemberModal from "../components/Team/AddMemberModal";
import ChangeRoleModal from "../components/Team/ChangeRoleModal";
import DeleteLeaderModal from "../components/Team/DeleteLeaderModal";
import { DocumentsToolbar } from "../components/documents";
import ConfirmDelete from "../components/Team/ConfirmDelete";
import { ChevronLeft } from "lucide-react";
import authService from "../services/authService";
import useDocumentActions from "../hooks/useDocumentActions";
import { ADMIN_ACTIONS } from "../components/documents/DocumentActionsMenu";

import { useTeamMemberDetails } from "../hooks/useTeamMemberDetails";
import { useTeamDocuments } from "../hooks/useTeamDocuments";
import { teamsApi } from "../services/teamsApi";

function AdminTeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teamData, members, isLoading: isTeamLoading, error: teamError, addMember, deleteMember, updateMemberRole, transferLeader } = useTeamMemberDetails(teamId, true);
  const { documents, isLoading: isDocsLoading, error: docsError, deleteDocument, refetch: refetchDocs } = useTeamDocuments(teamId, true);
  const { handleAction: handleDocAction } = useDocumentActions({ onSuccess: refetchDocs });

  const isLoading = isTeamLoading || isDocsLoading;
  const error = teamError || docsError;
  const [activeTab, setActiveTab] = useState("Documents");
  const [showModal, setShowModal] = useState(false);
  const [roleModal, setRoleModal] = useState({ isOpen: false, member: null });
  const [deleteLeaderModal, setDeleteLeaderModal] = useState({ isOpen: false, member: null });
  const [deleteDocModal, setDeleteDocModal] = useState({ isOpen: false, doc: null });

  const [toolbar, setToolbar] = useState({
    query: "",
    filter: "all",
    sort: "name_asc",
    view: "grid",
  });

  const updateToolbar = (k, v) => setToolbar(p => ({ ...p, [k]: v }));

  const handleRoleUpdate = async (member, newRole, newLeader = null) => {
    try {
      if (newLeader) {
        await transferLeader(newLeader.userId ?? newLeader.id ?? newLeader._id);
        toast.success(`Leadership transferred to ${newLeader.name ?? newLeader.userFullName ?? "new leader"}`);
      } else {
        await updateMemberRole(member, newRole);
        toast.success(`${member.name ?? member.userFullName ?? "Member"}'s role updated to ${newRole}`);
      }
    } catch (err) { toast.error(`Failed: ${err.message}`); }
  };

  const handleMemberDelete = async (member) => {
    if ((member.role ?? "").toUpperCase() === "LEADER") return setDeleteLeaderModal({ isOpen: true, member });
    try {
      await deleteMember(member.userId ?? member.id ?? member._id);
      toast.success("User deleted successfully");
    } catch (err) { toast.error(`Failed: ${err.message}`); }
  };

  const handleDeleteLeaderConfirm = async (oldLeader, newLeader) => {
    try {
      await transferLeader(newLeader.userId ?? newLeader.id ?? newLeader._id);
      await deleteMember(oldLeader.userId ?? oldLeader.id ?? oldLeader._id);
      toast.success("Leadership transferred and user deleted");
    } catch (err) { toast.error(`Failed: ${err.message}`); throw err; }
  };

  const handleDocumentDeleteClick = (doc) => {
    setDeleteDocModal({ isOpen: true, doc });
  };

  const confirmDocumentDelete = async () => {
    if (!deleteDocModal.doc) return;
    try { 
      await deleteDocument(deleteDocModal.doc.id ?? deleteDocModal.doc._id); 
      toast.success("Document deleted"); 
      setDeleteDocModal({ isOpen: false, doc: null });
    }
    catch (err) { toast.error(`Failed: ${err.message}`); }
  };

  const handleAction = async (key, doc) => {
    if (key === "trash") {
      handleDocumentDeleteClick(doc);
    } else if (key === "preview") {
      const docId = doc?.id || doc?.apiId || doc?.documentId || doc?.fileId;
      if (docId) {
        navigate(`/documents/${docId}/preview`);
      } else {
        toast.error("Cannot preview: missing document ID.");
      }
    } else {
      handleDocAction(key, doc);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/teams")}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 transition-all duration-300 hover:border-blue-200 hover:text-blue-700 hover:shadow-md active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <ChevronLeft size={16} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1 text-slate-400 group-hover:text-blue-600" />
        <span className="relative z-10">Back to Teams</span>
      </button>

      <TeamHeader
        team={teamData}
        members={members}
        onAdd={() => setShowModal(true)}
        canAddMembers={activeTab === "Members"}
      />

      <TeamTabs activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={true} />

      {activeTab === "Documents" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <DocumentsToolbar
              query={toolbar.query} onQueryChange={(v) => updateToolbar("query", v)}
              filterType={toolbar.filter} onFilterTypeChange={(v) => updateToolbar("filter", v)}
              sortKey={toolbar.sort} onSortKeyChange={(v) => updateToolbar("sort", v)}
              viewMode={toolbar.view} onViewModeChange={(v) => updateToolbar("view", v)}
            />
          </div>
          <DocumentsList
            documents={documents} viewMode={toolbar.view} searchQuery={toolbar.query}
            filterType={toolbar.filter} sortKey={toolbar.sort} onDelete={handleDocumentDeleteClick}
            onAction={handleAction}
            actions={ADMIN_ACTIONS}
            actionKeys={["preview", "trash"]} showStar={false}
          />
        </div>
      )}

      {activeTab === "Members" && (
        <MembersTable members={members} onDelete={handleMemberDelete} useActionMenu={true}
          onChangeRole={(m) => setRoleModal({ isOpen: true, member: m })} isAdmin={true} />
      )}
      <AddMemberModal isOpen={showModal} onClose={() => setShowModal(false)} onAddMember={addMember} existingMembers={members} />
      <ChangeRoleModal isOpen={roleModal.isOpen} onClose={() => setRoleModal({ isOpen: false, member: null })}
        member={roleModal.member} allMembers={members} onRoleChange={handleRoleUpdate} isAdmin={true} />
      <DeleteLeaderModal isOpen={deleteLeaderModal.isOpen} onClose={() => setDeleteLeaderModal({ isOpen: false, member: null })}
        leader={deleteLeaderModal.member} allMembers={members} onConfirm={handleDeleteLeaderConfirm} />
      <ConfirmDelete
        isOpen={deleteDocModal.isOpen}
        title="Delete Document"
        message={
          <>
            Are you sure you want to delete "<strong>{deleteDocModal.doc?.name}</strong>"?
          </>
        }
        onConfirm={confirmDocumentDelete}
        onCancel={() => setDeleteDocModal({ isOpen: false, doc: null })}
      />
      <ToastContainer />
    </div>
  );
}




export default AdminTeamDetail;