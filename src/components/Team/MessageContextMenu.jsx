import { useEffect, useRef, useState } from "react";
import { Reply, Edit2, Trash2, Eye } from "lucide-react";

function MessageContextMenu({ message, currentUserId, onClose, onReply, onEdit, onDelete, onMarkSeen, position }) {
  const menuRef = useRef(null);
  const isSender = message != null && Number(message.senderId) === currentUserId;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!position) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [position, onClose]);

  if (!position || !message) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-lg border border-border bg-card shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: "160px",
      }}
    >
      <div className="overflow-hidden">
        {/* Reply - available to all */}
        <button
          onClick={() => {
            onReply(message);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
        >
          <Reply size={14} />
          Reply
        </button>

        {/* Edit - only for sender */}
        {isSender && (
          <button
            onClick={() => {
              onEdit(message);
              onClose();
            }}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <Edit2 size={14} />
            Edit
          </button>
        )}

        {/* Info - only for sender */}
        {isSender && (
          <button
            onClick={() => {
              onMarkSeen(message);
              onClose();
            }}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <Eye size={14} />
            Info
          </button>
        )}

        {/* Delete - for all, with submenu */}
        <MessageDeleteSubmenu
          isSender={isSender}
          onDelete={onDelete}
          message={message}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function MessageDeleteSubmenu({ isSender, onDelete, message, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const openConfirm = (e) => {
    e?.stopPropagation();
    setShowConfirm(true);
  };

  const closeConfirm = (e) => {
    e?.stopPropagation();
    setShowConfirm(false);
  };

  const handleDeleteClick = (scope) => {
    onDelete(String(message.id), scope);
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="relative border-t border-slate-100">
      <button
        type="button"
        onClick={openConfirm}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} />
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />

          <div className="relative z-10 w-[320px] rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-slate-800">Delete message?</h3>
            <p className="text-sm text-slate-600 mb-4">Choose how you'd like to delete this message.</p>

            <div className="flex flex-col gap-2">
              {isSender && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick("for-everyone")}
                  className="w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  Delete for everyone
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteClick("for-me")}
                className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
              >
                Delete for me
              </button>

              <button
                type="button"
                onClick={closeConfirm}
                className="w-full rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageContextMenu;
