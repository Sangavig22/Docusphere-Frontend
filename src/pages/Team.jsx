import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Plus } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import DocumentsToolbar from "../components/documents/DocumentsToolbar";
import TeamCard from "../components/Team/TeamCard";
import ConfirmDelete from "../components/Team/ConfirmDelete";

import { useTeams } from "../hooks/useTeams";

function Team() {
  const navigate = useNavigate();

  const { teams, isLoading, error, deleteTeam } = useTeams();
  
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, team: null });

  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name_asc");

  const getTeamId = (team) => team?.id || team?._id || team?.teamId;
  const canDeleteTeam = (team) => String(team?.currentUserRole || "").toUpperCase() === "LEADER";

  const handleTeamClick = (team) => {
    const teamId = getTeamId(team);
    if (!teamId) {
      toast.error("Invalid team id");
      return;
    }
    navigate(`/team/${teamId}`);
  };

  const handleTeamDelete = async (teamId) => {
    try {
      await deleteTeam(teamId);
      toast.success("Team deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete team");
      console.error("Delete error:", err);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTeams = useMemo(() => {
    let list = teams.filter((team) => {
      if (!normalizedQuery) return true;
      return String(team?.name || "").toLowerCase().includes(normalizedQuery);
    });

    list.sort((a, b) => {
      if (sortKey === "name_asc") return a.name.localeCompare(b.name);
      if (sortKey === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [teams, normalizedQuery, sortKey]);



  const confirmDelete = () => {
    if (deleteConfirm.team) {
      const teamId = getTeamId(deleteConfirm.team);
      if (teamId) {
        handleTeamDelete(teamId);
      }
    }
    setDeleteConfirm({ isOpen: false, team: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, team: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600 dark:text-slate-400">Loading teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
        <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ToastContainer />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Teams</h1>
        <button
          onClick={() => navigate("/team/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={18} />
          Add Team
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DocumentsToolbar
          query={query}
          onQueryChange={setQuery}
          filterType="all"
          onFilterTypeChange={() => {}}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          viewMode={view}
          onViewModeChange={setView}
          hideFilter={true}


        />
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
        {visibleTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onOpen={() => handleTeamClick(team)}
            onDelete={() => {
              if (!canDeleteTeam(team)) {
                toast.error("Only team leader can delete this team");
                return;
              }
              setDeleteConfirm({ isOpen: true, team });
            }}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        ))}
      </div>

      {!visibleTeams.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No teams found.
        </div>
      )}

      <ConfirmDelete
        isOpen={deleteConfirm.isOpen}
        title="Delete Team"
        message={<>Are you sure you want to delete "<span className="font-bold">{deleteConfirm.team?.name}</span>" team?</>}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Yes"
        cancelText="No"
        isDangerous={true}
      />
    </div>
  );
}

export default Team;
