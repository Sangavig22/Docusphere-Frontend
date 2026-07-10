export class ShareAccessError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ShareAccessError";
    this.status = status;
    this.code = code;
  }
}

export const SHARE_ERROR_TYPES = {
  FORBIDDEN: "FORBIDDEN",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
  INVALID: "INVALID",
  EDITOR_UNAVAILABLE: "EDITOR_UNAVAILABLE",
  GENERIC: "GENERIC",
};

export function parseShareAccessError(error) {
  const status = Number(error?.status) || 0;
  const raw = String(error?.message || error?.data?.message || error?.data?.error || "");

  if (status === 401 || /\b401\b/.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.INVALID,
      message: "This sharing link is invalid.",
    };
  }

  if (status === 403 || /\b403\b/.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.FORBIDDEN,
      message: "You do not have permission to access this document.",
    };
  }

  if (/revoked/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.REVOKED,
      message: "This share link has been revoked.",
    };
  }

  if (status === 410 || /expired/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.EXPIRED,
      message: "This share link has expired.",
    };
  }

  if (status === 404 || status === 400 || /not found/i.test(raw) || /invalid/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.INVALID,
      message: "This sharing link is invalid.",
    };
  }

  return {
    type: SHARE_ERROR_TYPES.GENERIC,
    message: raw || "Unable to open this shared document. Please try again.",
  };
}

export function parseEditorAccessError(error) {
  const status = Number(error?.status) || 0;

  if (status === 404 || status === 502 || status === 503) {
    return {
      type: SHARE_ERROR_TYPES.EDITOR_UNAVAILABLE,
      message: "Unable to load the document editor. Please try again in a moment.",
    };
  }

  const parsed = parseShareAccessError(error);
  if (
    parsed.type === SHARE_ERROR_TYPES.FORBIDDEN ||
    parsed.type === SHARE_ERROR_TYPES.EXPIRED ||
    parsed.type === SHARE_ERROR_TYPES.REVOKED ||
    parsed.type === SHARE_ERROR_TYPES.INVALID
  ) {
    return parsed;
  }

  return {
    type: SHARE_ERROR_TYPES.GENERIC,
    message: "Unable to load the document editor. Please try again.",
  };
}

export function getShareLoadErrorMessage(error) {
  return parseShareAccessError(error).message;
}

export function getShareCommentErrorMessage(error) {
  const parsed = parseShareAccessError(error);
  if (parsed.type !== SHARE_ERROR_TYPES.GENERIC) {
    return parsed.message;
  }
  const raw = String(error?.message || "").trim();
  return raw || "Unable to load comments. Please try again.";
}
