import React from "react";

const Backdrop = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[59]"
    onMouseDown={onClose}
  />
);

const AdminModal = ({ open, title, description, children, footer, onClose, size = "md" }) => {
  if (!open) return null;

  const maxWidth =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-5`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(title || description) && (
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                {title && (
                  <div className="text-[16px] font-semibold text-slate-900 dark:text-slate-50">
                    {title}
                  </div>
                )}
                {description && (
                  <div className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">
                    {description}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )}

          {children}

          {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </>
  );
};

export default AdminModal;

