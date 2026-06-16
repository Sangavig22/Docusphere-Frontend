import { toast } from "react-toastify";

/** Stable toast IDs — one lifecycle per document action. */
export const TOAST_ACTION_IDS = {
  DUPLICATE: "action-document-duplicate",
  SHARE: "action-document-share",
  MOVE: "action-document-move",
  GENERAL_ACCESS: "action-document-general-access",
  COPY_LINK: "action-document-copy-link",
  SHARED_OPEN: "action-shared-document-open",
  SHARED_DOWNLOAD: "action-shared-document-download",
};

function dismissByActionId(actionId) {
  if (!actionId) return;
  toast.dismiss(actionId);
}

/**
 * Replace any existing toast for this action with a new one (no stacking).
 */
export function showSingleToast(actionId, message, type = "success", options = {}) {
  dismissByActionId(actionId);
  const fn = toast[type] || toast.success;
  return fn(message, {
    toastId: actionId,
    autoClose: 3000,
    ...options,
  });
}

export function showActionLoading(actionId, message, options = {}) {
  dismissByActionId(actionId);
  return toast.loading(message, {
    toastId: actionId,
    closeOnClick: false,
    ...options,
  });
}

export function completeActionToast(actionId, message, type = "success", options = {}) {
  if (toast.isActive(actionId)) {
    return toast.update(actionId, {
      render: message,
      type,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      ...options,
    });
  }
  return showSingleToast(actionId, message, type, options);
}

export function dismissActionToast(actionId) {
  dismissByActionId(actionId);
}
