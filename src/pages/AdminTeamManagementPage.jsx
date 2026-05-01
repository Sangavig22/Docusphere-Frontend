import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { toast } from 'react-toastify';
import ConfirmDelete from "../components/Team/ConfirmDelete";
import DocumentsToolbar from "../components/documents/DocumentsToolbar";
import TeamCard from "../components/Team/TeamCard";
import { useAdminTeams } from "../hooks/useAdminTeams";



const AdminTeamManagementPage = () => {
  const navigate = useNavigate();
  const { teams, isLoading, error, deleteTeam } = useAdminTeams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, team: null });
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name_asc");
  const menuRef = useRef(null);

  const getTeamId = (t) => t?.id || t?._id || t?.teamId;
  const handleTeamClick = (t) => {
    const id = getTeamId(t);
    id ? navigate(`/admin/teams/${id}`) : toast.error("Invalid team id");
  };

  const handleTeamDelete = async (id) => {
    setDeleteConfirm(p => ({ ...p, isLoading: true }));
    try {
      await deleteTeam(id);
      toast.success("Team deleted successfully");
      setDeleteConfirm({ isOpen: false, team: null, isLoading: false });
    } catch (err) {
      toast.error(err.message || "Failed to delete team");
      setDeleteConfirm(p => ({ ...p, isLoading: false }));
    }
  };

  useEffect(() => {
    const handler = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [openMenuId]);

  const visibleTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter(t => !q || (t?.name || "").toLowerCase().includes(q))
      .sort((a, b) => sortKey === "name_asc" ? a.name.localeCompare(b.name) : sortKey === "name_desc" ? b.name.localeCompare(a.name) : 0);
  }, [teams, query, sortKey]);

  if (isLoading) return <div className="flex justify-center py-12 text-slate-600">Loading teams...</div>;
  if (error) return <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Teams</h2>
        <button onClick={() => navigate("/admin/teams/new")} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200">
          <Plus size={18} /> Create New Team
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DocumentsToolbar query={query} onQueryChange={setQuery} filterType="all" onFilterTypeChange={() => { }} sortKey={sortKey} onSortKeyChange={setSortKey} viewMode={view} onViewModeChange={setView} hideFilter={true} />
      </div>
      <div className={view === "grid" ? "grid grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
        {visibleTeams.map((t) => <TeamCard key={t.id} team={t} onOpen={() => handleTeamClick(t)} onDelete={() => setDeleteConfirm({ isOpen: true, team: t, isLoading: false })} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} isAdmin={true} />)}
      </div>
      {!visibleTeams.length && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">No teams found.</div>}
      <ConfirmDelete isOpen={deleteConfirm.isOpen} title="Delete Team" message={<>Are you sure you want to delete "<span className="font-bold">{deleteConfirm.team?.name}</span>" team?</>} onConfirm={() => { const id = getTeamId(deleteConfirm.team); id ? handleTeamDelete(id) : setDeleteConfirm({ isOpen: false, team: null, isLoading: false }) }} onCancel={() => setDeleteConfirm({ isOpen: false, team: null, isLoading: false })} confirmText="Yes" cancelText="No" isDangerous={true} isLoading={deleteConfirm.isLoading} />
    </div>
  );
};

export default AdminTeamManagementPage;
