import { useEffect, useMemo, useState } from "react";
import { X, CheckCheck, Check } from "lucide-react";
import { teamsApi } from "../../services/teamsApi";

function MessageInfoModal({ message, onClose, members, teamId, currentUserId, currentUserName, socketConnected }) {
  const [fetchedMembers, setFetchedMembers] = useState([]);

  const resolveId = (value) => {
    if (value == null) return null;
    if (typeof value === "object") {
      return Number(value.userId ?? value.id ?? value._id ?? value.value ?? NaN);
    }
    return Number(value);
  };

  const resolveMemberName = (m) => {
    if (!m || typeof m !== "object") return null;
    const user = m.user ?? m.member ?? null;
    const firstName = m.firstName || user?.firstName || "";
    const lastName = m.lastName || user?.lastName || "";
    const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return (
      m.fullName ||
      m.name ||
      combinedName ||
      m.userFullName ||
      m.userName ||
      m.email ||
      m.userEmail ||
      user?.fullName ||
      user?.name ||
      user?.email ||
      null
    );
  };

  const memberMap = useMemo(() => {
    const combined = [...(Array.isArray(members) ? members : []), ...(Array.isArray(fetchedMembers) ? fetchedMembers : [])];
    // Use a Map keyed by resolved id -> display name, prefer local `members` over fetched
    const map = new Map();
    for (const m of combined) {
      const id = resolveId(m.userId ?? m.id ?? m._id ?? m.user?.id ?? m.user?.userId ?? m.memberId);
      if (!Number.isFinite(id)) continue;
      if (!map.has(id)) {
        map.set(id, resolveMemberName(m));
      }
    }
    return map;
  }, [members, fetchedMembers]);

  const payload = message?.data ?? message?.message ?? message;
  const senderId = resolveId(payload?.senderId);
  const seenSource = Array.isArray(payload?.seenBy ?? payload?.seen_by) ? (payload?.seenBy ?? payload?.seen_by) : [];
  const deliveredSource = Array.isArray(payload?.deliveredTo ?? payload?.delivered_to)
    ? (payload?.deliveredTo ?? payload?.delivered_to)
    : [];

  const seenIds = useMemo(
    () => new Set(seenSource.map((id) => resolveId(id)).filter(Number.isFinite)),
    [seenSource]
  );

  const deliveredIds = useMemo(
    () => new Set(deliveredSource.map((id) => resolveId(id)).filter(Number.isFinite)),
    [deliveredSource]
  );

  const resolvedSeenBy = useMemo(() => {
    return seenSource
      .map((id) => resolveId(id))
      .filter((id) => Number.isFinite(id))
      .filter((id) => id !== senderId)
      .map((id) => memberMap.get(id) || `User ${id}`);
  }, [seenSource, senderId, memberMap]);

  const resolvedDeliveredTo = useMemo(() => {
    const deliveredVisibleIds = deliveredSource
      .map((id) => resolveId(id))
      .filter((id) => Number.isFinite(id))
      .filter((id) => id !== senderId)
      .filter((id) => !seenIds.has(id));

    return deliveredVisibleIds.map((id) => memberMap.get(id) || `User ${id}`);
  }, [deliveredSource, senderId, memberMap, seenIds]);

  useEffect(() => {
    if (message && members) {
      // If we have receipt ids that are missing from memberMap, try fetching fresh members for the team
      const allIds = Array.from(new Set([...seenIds, ...deliveredIds]));
      const missing = allIds.filter((id) => !memberMap.has(id));
      if (missing.length > 0 && teamId) {
        (async () => {
          try {
            const resp = await teamsApi.getTeamMembers(teamId);
            const mdata = resp?.data ?? resp;
            if (Array.isArray(mdata) && mdata.length > 0) setFetchedMembers(mdata);
          } catch (e) {
            // ignore fetch errors; mapping will fall back to User {id}
          }
        })();
      }
    }
  }, [message, members, currentUserId, currentUserName, socketConnected, memberMap, seenIds, deliveredIds, teamId]);

  useEffect(() => {
    if (!message) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 id="message-info-title" className="text-lg font-semibold text-slate-800">
            Message Info
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <CheckCheck size={16} className="text-blue-600" />
              <h4 className="font-medium text-slate-700">Seen by</h4>
            </div>
            {resolvedSeenBy.length > 0 ? (
              <ul className="space-y-1 pl-6">
                {resolvedSeenBy.map((name, idx) => (
                  <li key={idx} className="text-sm text-slate-600">
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pl-6 text-sm text-slate-400">No one has seen yet</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Check size={16} className="text-slate-400" />
              <h4 className="font-medium text-slate-700">Delivered to</h4>
            </div>
            {resolvedDeliveredTo.length > 0 ? (
              <ul className="space-y-1 pl-6">
                {resolvedDeliveredTo.map((name, idx) => (
                  <li key={idx} className="text-sm text-slate-600">
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pl-6 text-sm text-slate-400">
                Not delivered to anyone
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default MessageInfoModal;
