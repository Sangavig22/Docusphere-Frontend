import { useRef, useEffect } from "react";
import { Users, MoreHorizontal, X } from "lucide-react";

function TeamCard({
  team,
  onOpen,
  onDelete,
  openMenuId,
  setOpenMenuId,
}) {
  const menuRef = useRef(null);
  const isOpen = openMenuId === team.id;
  const canDeleteTeam = String(team?.currentUserRole || "").toUpperCase() === "LEADER";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div
      onClick={onOpen}
      className="relative bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Users size={18} />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(isOpen ? null : team.id);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <MoreHorizontal size={18} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              
              {/* View */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
              >
                View
              </button>

              {/* Delete */}
              {canDeleteTeam && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Bottom */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {team.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {team.memberCount || 0} members · {team.documentCount || 0} docs
        </p>
      </div>
    </div>
  );
}

export default TeamCard;