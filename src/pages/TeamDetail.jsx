import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeamHeader from "../components/Team/TeamHeader";
import TeamTabs from "../components/Team/TeamTabs";
import MembersTable from "../components/Team/MembersTable";
import DocumentsList from "../components/Team/DocumentsList";
import TeamChat from "../components/Team/TeamChat";
import AddMemberModal from "../components/Team/AddMemberModal";
import DocumentsToolbar from "../components/documents/DocumentsToolbar";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import VersionHistoryModal from "../components/documents/version/VersionHistoryModal";
import { DEFAULT_DOCUMENT_ACTIONS } from "../components/documents/DocumentActionsMenu";
import ShareModal from "../components/documents/share/ShareModal";
import { TEAM_DOCUMENT_ACTIONS } from "../components/documents/DocumentActionsMenu";
import useDocumentActions from "../hooks/useDocumentActions";
import { ChevronLeft } from "lucide-react";
import authService from "../services/authService";
import { teamsApi } from "../services/teamsApi";

import { useTeamMemberDetails } from "../hooks/useTeamMemberDetails";
import { useTeamDocuments } from "../hooks/useTeamDocuments";

function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teamData, members, isLoading: isTeamLoading, error: teamError, addMember, deleteMember, updateMemberChatBlock, refetch: refetchTeam } = useTeamMemberDetails(teamId);
  const { documents, isLoading: isDocsLoading, error: docsError, deleteDocument, refetch: refetchDocs, toggleStar } = useTeamDocuments(teamId);

  // Document action handlers (rename, duplicate, move, download, trash, etc.)
  const { modalState, loadingAction, handleAction, closeModal, submitModal, shareWithPeople } = useDocumentActions({ 
    onSuccess: async (type, doc) => {
      if (type === "preview" && doc) {
        navigate(`/documents/${doc.id}/preview`);
      } else {
        if (type === "trash" || type === "delete_permanently") {
          await refetchTeam();
          window.dispatchEvent(
            new CustomEvent("docusphere:teams-changed", { detail: { teamId } }),
          );
        }
        await refetchDocs();
      }
    } 
  });

  const isLoading = isTeamLoading || isDocsLoading;
  const error = teamError || docsError;

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(`team-detail-active-tab:${teamId}`) || "Documents");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatMentionCount, setChatMentionCount] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [memberStatuses, setMemberStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [memberStatusFilter, setMemberStatusFilter] = useState("all");
  
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

  const membersWithStatuses = useMemo(() => {
    const statusByUserId = new Map(
      (Array.isArray(memberStatuses) ? memberStatuses : []).map((item) => [String(item.userId), String(item.status || "").toUpperCase()])
    );

    return members.map((member) => {
      const memberId = String(member.userId ?? member.id ?? member._id);
      const apiStatus = statusByUserId.get(memberId);
      return {
        ...member,
        status: apiStatus || member.status || "INACTIVE",
      };
    });
  }, [members, memberStatuses]);

  const visibleMembers = useMemo(() => {
    const normalizedQuery = memberQuery.trim().toLowerCase();

    return membersWithStatuses.filter((member) => {
      const memberName = String(member.fullName ?? member.userFullName ?? member.name ?? "").toLowerCase();
      const memberEmail = String(member.email ?? member.userEmail ?? "").toLowerCase();
      const memberRole = String(member.role || "").toUpperCase();
      const memberStatus = String(member.status || (member.active === false ? "INACTIVE" : "ACTIVE")).toUpperCase();

      if (normalizedQuery) {
        const matchesQuery = memberName.includes(normalizedQuery) || memberEmail.includes(normalizedQuery);
        if (!matchesQuery) return false;
      }

      if (memberRoleFilter !== "all" && memberRole !== memberRoleFilter) {
        return false;
      }

      if (memberStatusFilter !== "all" && memberStatus !== memberStatusFilter.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [membersWithStatuses, memberQuery, memberRoleFilter, memberStatusFilter]);

  const updateToolbar = (key, value) => {
    setToolbar((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    localStorage.setItem(`team-detail-active-tab:${teamId}`, activeTab);
  }, [activeTab, teamId]);

  useEffect(() => {
    setChatUnreadCount(0);
    setChatMentionCount(0);
    setSelectedDocumentId("");
  }, [teamId]);

  useEffect(() => {
    let cancelled = false;

    const loadStatuses = async () => {
      try {
        const response = await teamsApi.getTeamMemberStatuses(teamId);
        const data = response?.data ?? response;
        if (!cancelled) {
          setMemberStatuses(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setMemberStatuses([]);
        }
      }
    };

    const recordPresence = () => {
      void teamsApi.recordTeamPresence(teamId).catch(() => {});
    };

    recordPresence();
    void loadStatuses();
    const intervalId = window.setInterval(loadStatuses, 5000);

    const handleFocus = () => {
      recordPresence();
      void loadStatuses();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        recordPresence();
        void loadStatuses();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [teamId]);

  const handleOpenTeamDocument = (documentId) => {
    if (!documentId) return;

    setToolbar((prev) => ({ ...prev, query: "", filter: "all" }));
    setSelectedDocumentId(String(documentId));
    setActiveTab("Documents");
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

  const handleToggleChatBlock = async (member) => {
    const memberName = member.name ?? member.userFullName ?? member.fullName ?? "Member";
    const blocked = member.active !== false;

    try {
      await updateMemberChatBlock(member, blocked);
      toast.success(blocked ? `${memberName} can no longer access group chat` : `${memberName} can access group chat again`);
    } catch (err) {
      toast.error(`Failed to update chat access: ${err.message || err.toString()}`);
    }
  };

  const handleDocumentDelete = async (doc) => {
    try {
      await deleteDocument(doc.id);
      await refetchTeam();
      window.dispatchEvent(
        new CustomEvent("docusphere:teams-changed", { detail: { teamId } }),
      );
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <button 
        onClick={() => navigate("/team")} 
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-text shadow-sm transition-all duration-300 hover:border-blue-200 hover:text-blue-700 hover:shadow-md active:scale-95 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-500/10" />
        <ChevronLeft size={16} className="relative z-10 text-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
        <span className="relative z-10">Back to Teams</span>
      </button>

      <TeamHeader
        team={teamData}
        members={members}
        documentCount={documents.length}
        onUpload={handleUploadNavigation}
        onAdd={() => setShowModal(true)}
        canAddMembers={activeTab === "Members" && isLeader}
      />

      <TeamTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chatUnreadCount={chatUnreadCount}
        chatMentionCount={chatMentionCount}
      />

      {activeTab === "Documents" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <DocumentsToolbar
              query={toolbar.query}
              onQueryChange={(v) => updateToolbar("query", v)}
              filterType={toolbar.filter}
              onFilterTypeChange={(v) => updateToolbar("filter", v)}
              sortKey={toolbar.sort}
              onSortKeyChange={(v) => updateToolbar("sort", v)}
               viewMode={toolbar.view}
              onViewModeChange={(v) => updateToolbar("view", v)}
              hideSort={false}
              hideFilter={true}
            />
          </div>

          <DocumentsList
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            viewMode={toolbar.view}
            searchQuery={toolbar.query}
            filterType={toolbar.filter}
            sortKey={toolbar.sort}
            onDelete={handleDocumentDelete}
            onAction={handleAction}
            onToggleStar={toggleStar}
            actions={TEAM_DOCUMENT_ACTIONS}
            canManageAllTeamDocs={canManageAllTeamDocs}
            showStar={false}
          />
          <DocumentActionModal
            open={
              modalState.open &&
              modalState.type !== "version_history" &&
              modalState.type !== "share"
            }
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
          <VersionHistoryModal
            open={modalState.open && modalState.type === "version_history"}
            document={modalState.doc}
            userTeamRole={normalizedCurrentUserRole}
            onClose={closeModal}
            onRestored={() => refetchDocs()}
          />
          <ShareModal
            open={modalState.open && modalState.type === "share"}
            document={modalState.doc}
            loading={loadingAction}
            onClose={closeModal}
            onShareWithPeople={shareWithPeople}
          />
        </div>
      )}

      {activeTab === "Members" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full lg:max-w-md">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Search members</label>
                <input
                  type="text"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Role</label>
                  <select
                    value={memberRoleFilter}
                    onChange={(e) => setMemberRoleFilter(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All roles</option>
                    <option value="LEADER">Leader</option>
                    <option value="MANAGER">Manager</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Status</label>
                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <MembersTable
            members={visibleMembers}
            onDelete={handleMemberDelete}
            useActionMenu={true}
            onToggleChatBlock={handleToggleChatBlock}
            currentUserRole={currentUserRole}
            isAdmin={false}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <div className={activeTab === "Chat" ? "block" : "hidden"}>
        <TeamChat
          teamId={teamId}
          members={members}
          documents={documents}
          canManageAllTeamDocs={canManageAllTeamDocs}
          onOpenDocument={handleOpenTeamDocument}
          isActive={activeTab === "Chat"}
          onUnreadCountChange={setChatUnreadCount}
          onMentionCountChange={setChatMentionCount}
          onMemberBlockStatusChange={refetchTeam}
        />
      </div>

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
