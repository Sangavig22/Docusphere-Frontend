import { useRef, useEffect } from "react";
import { Users, MoreHorizontal } from "lucide-react";

function TeamCard({
  team,
  onOpen,
  onDelete,
  openMenuId,
  setOpenMenuId,
  isAdmin = false,
}) {
  const menuRef = useRef(null);
  const isOpen = openMenuId === team.id;
  const canDeleteTeam = isAdmin || String(team?.currentUserRole || "").toUpperCase() === "LEADER";

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
  }, [isOpen, setOpenMenuId]);

  return (
    <div
      onClick={onOpen}
      className="relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <Users size={18} />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(isOpen ? null : team.id);
            }}
            className="rounded p-1 text-muted transition hover:bg-slate-100 hover:text-text dark:hover:bg-white/10"
          >
            <MoreHorizontal size={18} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
              >
                View
              </button>

              {canDeleteTeam && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text">
          {team.name}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {team.memberCount ?? 0} members - {team.documentCount ?? 0} docs
        </p>
      </div>
    </div>
  );
}

export default TeamCard;
