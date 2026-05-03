import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function MembersTable({
  members,
  onDelete,
  useActionMenu = false,
  onChangeRole,
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No members found for this team.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
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
          
          // In user view, leader can only see actions for OTHER members
          const isMe = String(mId) === String(currentUserId);
          const showActions = isAdmin || (isUserLeader && !isMe);

          return (
          <tr key={mId} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium text-slate-900">{mName}</td>
            <td className="px-4 py-3 text-slate-700">{mEmail}</td>
            <td className="px-4 py-3 text-slate-700">{m.role || "Member"}</td>
            <td className="px-4 py-3 text-slate-700">{m.status || "Active"}</td>
            
            {(isAdmin || isUserLeader) && (
              <td className="px-4 py-3 text-right">
                {showActions ? (
                  useActionMenu ? (
                    <div className="relative inline-flex" ref={openMenuId === mId ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === mId ? null : mId)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Open actions for ${mName}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openMenuId === mId && (
                        <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-left">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onChangeRole?.(m);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              Change role
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDelete(m);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
                  <div className="text-slate-300 px-2">—</div>
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
