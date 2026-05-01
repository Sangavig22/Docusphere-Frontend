import { useCallback, useEffect, useMemo, useState } from "react";
import { teamsApi } from "../services/teamsApi";

/**
 * Custom hook encapsulating all state & logic for the Admin Merge Teams page.
 */
export function useMergeTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [newName, setNewName] = useState("");
  const [leaderChoice, setLeaderChoice] = useState("");
  const [moveDocuments, setMoveDocuments] = useState(true);

  const [sourceMembers, setSourceMembers] = useState([]);
  const [targetMembers, setTargetMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeError, setMergeError] = useState(null);

  // ── Fetch all teams ──
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await teamsApi.getAllTeams();
        const list = res?.data ?? res;
        setTeams(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || "Failed to load teams");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Fetch members when a team is selected ──
  const fetchMembers = useCallback(async (teamId, setter) => {
    if (!teamId) { setter([]); return; }
    try {
      const res = await teamsApi.getAdminTeamMembers(teamId);
      const list = res?.data ?? res;
      setter(Array.isArray(list) ? list : []);
    } catch {
      setter([]);
    }
  }, []);

  useEffect(() => {
    setLoadingMembers(true);
    Promise.all([
      fetchMembers(sourceId, setSourceMembers),
      fetchMembers(targetId, setTargetMembers),
    ]).finally(() => setLoadingMembers(false));
    setLeaderChoice("");
  }, [sourceId, targetId, fetchMembers]);

  // ── Derived data ──
  const source = useMemo(() => teams.find(t => (t.id ?? t.teamId) === sourceId) || null, [sourceId, teams]);
  const target = useMemo(() => teams.find(t => (t.id ?? t.teamId) === targetId) || null, [targetId, teams]);

  const allMembers = useMemo(() => {
    const map = new Map();
    [...sourceMembers, ...targetMembers].forEach(m => {
      const id = m.userId ?? m.id ?? m._id;
      if (id && !map.has(String(id))) map.set(String(id), m);
    });
    return [...map.values()];
  }, [sourceMembers, targetMembers]);

  const combinedMembersCount = allMembers.length;

  const leaderCandidates = useMemo(() => {
    return allMembers.map(m => ({
      ...m,
      fromTeam: sourceMembers.includes(m)
        ? (source?.name ?? source?.teamName ?? "Source")
        : (target?.name ?? target?.teamName ?? "Target"),
    }));
  }, [allMembers, sourceMembers, source, target]);

  const selectedLeader = useMemo(() => {
    return leaderCandidates.find(m => String(m.userId ?? m.id ?? m._id) === String(leaderChoice)) || null;
  }, [leaderCandidates, leaderChoice]);

  const canMerge = !!source && !!target && source !== target && !!leaderChoice && newName.trim().length > 0;

  // ── Actions ──
  const resetForm = () => { setSourceId(""); setTargetId(""); setNewName(""); setLeaderChoice(""); setMoveDocuments(true); };

  const handleMerge = async () => {
    if (!canMerge) return;
    setIsProcessing(true);
    setMergeError(null);
    try {
      await teamsApi.mergeTeams(source.id ?? source.teamId, target.id ?? target.teamId, newName.trim(), leaderChoice, moveDocuments);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      setMergeError(err.message || "Failed to merge teams");
      setShowConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    teams, isLoading, error,
    sourceId, setSourceId, targetId, setTargetId,
    newName, setNewName, leaderChoice, setLeaderChoice,
    moveDocuments, setMoveDocuments,
    loadingMembers, source, target,
    combinedMembersCount, leaderCandidates, selectedLeader, canMerge,
    showConfirm, setShowConfirm, showSuccess, setShowSuccess,
    isProcessing, mergeError,
    resetForm, handleMerge,
  };
}
