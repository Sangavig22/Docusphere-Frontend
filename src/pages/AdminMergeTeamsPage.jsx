import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GitMerge } from "lucide-react";

import { useMergeTeams } from "../hooks/useMergeTeams";
import TeamSelectorCard from "../components/Merge/TeamSelectorCard";
import MergePreviewBanner from "../components/Merge/MergePreviewBanner";
import MergeConfigCard from "../components/Merge/MergeConfigCard";
import MergeConfirmModal from "../components/Merge/MergeConfirmModal";
import MergeSuccessModal from "../components/Merge/MergeSuccessModal";

const AdminMergeTeamsPage = () => {
  const navigate = useNavigate();
  const m = useMergeTeams();

  // Surface merge errors as toasts
  useEffect(() => {
    if (m.mergeError) {
      toast.error(m.mergeError);
    }
  }, [m.mergeError]);

  if (m.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (m.error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
        <p className="text-red-600 font-medium">Error: {m.error}</p>
      </div>
    );
  }

  if (m.teams.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <GitMerge size={28} />
        </div>
        <p className="text-slate-500">You need at least 2 teams to perform a merge.</p>
        <button onClick={() => navigate("/admin/teams")} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          ← Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Team Selection */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 relative">
        <TeamSelectorCard label="Primary Team" sublabel="This team will be kept" color="blue"
          teams={m.teams} value={m.sourceId} onChange={m.setSourceId} disabledId={m.targetId} />

        <div className="flex shrink-0 items-center justify-center self-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl z-10 -my-4 md:-my-0 md:-mx-4 ring-8 ring-slate-50">
          <GitMerge size={20} />
        </div>

        <TeamSelectorCard label="Secondary Team" sublabel="This team will also be kept" color="emerald"
          teams={m.teams} value={m.targetId} onChange={m.setTargetId} disabledId={m.sourceId} />
      </div>

      {/* Preview Banner */}
      <MergePreviewBanner source={m.source} target={m.target} combinedMembersCount={m.combinedMembersCount} />

      {/* Configuration */}
      <MergeConfigCard
        newName={m.newName} onNameChange={m.setNewName}
        leaderChoice={m.leaderChoice} onLeaderChange={m.setLeaderChoice}
        leaderCandidates={m.leaderCandidates}
        source={m.source} target={m.target}
        loadingMembers={m.loadingMembers} canMerge={m.canMerge}
        onReset={m.resetForm} onMerge={() => m.setShowConfirm(true)}
      />

      {/* Modals */}
      <MergeConfirmModal
        open={m.showConfirm} onClose={() => m.setShowConfirm(false)} onConfirm={m.handleMerge}
        source={m.source} target={m.target} newName={m.newName.trim()}
        leader={m.selectedLeader} memberCount={m.combinedMembersCount} isProcessing={m.isProcessing}
        moveDocuments={m.moveDocuments} onMoveDocumentsChange={m.setMoveDocuments}
      />

      <MergeSuccessModal
        open={m.showSuccess}
        onClose={() => { m.setShowSuccess(false); m.resetForm(); navigate("/admin/teams"); }}
      />
    </div>
  );
};

export default AdminMergeTeamsPage;
