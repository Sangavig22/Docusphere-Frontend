import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function MembersTable({
  members,
  onDelete,
  useActionMenu = false,
  onChangeRole,
  onToggleChatBlock,
  currentUserRole = "",
  isAdmin = false,
  currentUserId = null,
}) {
  const isUserLeader = currentUserRole?.toUpperCase() === "LEADER";
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [openMenuId]);

  if (!members?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted">
        No members found for this team.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-muted dark:bg-white/5">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {(isAdmin || isUserLeader) && <th className="px-4 py-3 font-medium text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
        {members.map((m) => {
          const mId = m.userId ?? m.id ?? m._id;
          const mName = m.fullName ?? m.userFullName ?? m.name ?? "Member";
          const mEmail = m.email ?? m.userEmail ?? "-";
          const isBlocked = m.active === false;
          const normalizedStatus = String(m.status || "INACTIVE").toUpperCase();
          const isOnline = normalizedStatus === "ACTIVE";
          
          // In user view, leader can only see actions for OTHER members
          const isMe = String(mId) === String(currentUserId);
          const showActions = isAdmin || (isUserLeader && !isMe);

          return (
          <tr key={mId} className="border-t border-border">
            <td className="px-4 py-3 font-medium text-text">{mName}</td>
            <td className="px-4 py-3 text-muted">{mEmail}</td>
            <td className="px-4 py-3 text-muted">{m.role || "Member"}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted"
                }`}
              >
                {isOnline ? "Active" : "Inactive"}
              </span>
            </td>
            
            {(isAdmin || isUserLeader) && (
              <td className="px-4 py-3 text-right">
                {showActions ? (
                  useActionMenu ? (
                    <div className="relative inline-flex" ref={openMenuId === mId ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === mId ? null : mId)}
                        className="rounded-md p-1 text-muted transition hover:bg-slate-100 hover:text-text dark:hover:bg-white/10"
                        aria-label={`Open actions for ${mName}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openMenuId === mId && (
                        <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-lg border border-border bg-card py-1 text-left shadow-lg">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onChangeRole?.(m);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
                            >
                              Change role
                            </button>
                          )}
                          {!isAdmin && isUserLeader && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onToggleChatBlock?.(m);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 ${isBlocked ? "text-sky-700 dark:text-sky-300" : "text-amber-700 dark:text-amber-300"}`}
                            >
                              {isBlocked ? "Unblock Chat" : "Block Chat"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDelete(m);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onDelete(m)}
                      className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${mName}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )
                ) : (
                  <div className="px-2 text-muted">—</div>
                )}
              </td>
            )}
          </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}
