import { useEffect, useMemo, useState } from "react";
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
  const [page, setPage] = useState(1);

  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name_asc");
  const pageSize = 9;

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

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, sortKey]);

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

  const totalPages = Math.max(1, Math.ceil(visibleTeams.length / pageSize));
  const paginatedTeams = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return visibleTeams.slice(startIndex, startIndex + pageSize);
  }, [visibleTeams, page]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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

  return (
    <div className="space-y-4">
      <ToastContainer />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          Error: {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">My Teams</h1>
        <button
          onClick={() => navigate("/team/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={18} />
          Add Team
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
        {isLoading && !teams.length
          ? Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={`team-skeleton-${index}`}
                className="h-[132px] rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
              >
                <div className="animate-pulse space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="h-6 w-6 rounded bg-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-3/5 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))
          : paginatedTeams.map((team) => (
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

      {!isLoading && !visibleTeams.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No teams found.
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted shadow-sm">
        <span>
          Page {page} of {totalPages} (showing {paginatedTeams.length} on this page, {visibleTeams.length} total)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

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
