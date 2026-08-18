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
  const raw = String(error?.message || error?.data?.message || error?.data?.error || "").trim();

  if (/share link expired/i.test(raw) || (status === 410 && /expired/i.test(raw))) {
    return {
      type: SHARE_ERROR_TYPES.EXPIRED,
      message: "Link revoked or expired.",
    };
  }

  if (/share link was revoked|share link revoked|link was revoked|no longer valid/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.REVOKED,
      message: "Link revoked or expired.",
    };
  }

  if (/revoked/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.REVOKED,
      message: "Link revoked or expired.",
    };
  }

  if (/expired/i.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.EXPIRED,
      message: "Link revoked or expired.",
    };
  }

  if (status === 401 || /\b401\b/.test(raw)) {
    return {
      type: SHARE_ERROR_TYPES.INVALID,
      message: "This sharing link is invalid.",
    };
  }

  if (status === 403 || /\b403\b/.test(raw)) {
    if (/no longer valid|revoked|expired/i.test(raw)) {
      return {
        type: SHARE_ERROR_TYPES.REVOKED,
        message: "Link revoked or expired.",
      };
    }
    return {
      type: SHARE_ERROR_TYPES.FORBIDDEN,
      message: "You do not have permission to access this document.",
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

export function isTerminalShareAccessError(error) {
  const { type } = parseShareAccessError(error);
  return (
    type === SHARE_ERROR_TYPES.EXPIRED ||
    type === SHARE_ERROR_TYPES.REVOKED ||
    type === SHARE_ERROR_TYPES.INVALID ||
    type === SHARE_ERROR_TYPES.FORBIDDEN
  );
}

export function isExpiredOrRevokedShareError(error) {
  const { type } = parseShareAccessError(error);
  return type === SHARE_ERROR_TYPES.EXPIRED || type === SHARE_ERROR_TYPES.REVOKED;
}

export function getShareErrorTitle(error) {
  const { type } = parseShareAccessError(error);
  if (type === SHARE_ERROR_TYPES.EXPIRED || type === SHARE_ERROR_TYPES.REVOKED) {
    return "Link revoked or expired";
  }
  if (type === SHARE_ERROR_TYPES.INVALID) return "Invalid link";
  if (type === SHARE_ERROR_TYPES.FORBIDDEN) return "Access denied";
  return "Unable to open shared document";
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

export function getShareVersionErrorMessage(error) {
  const status = Number(error?.status) || 0;
  const parsed = parseShareAccessError(error);

  if (parsed.type === SHARE_ERROR_TYPES.EXPIRED || parsed.type === SHARE_ERROR_TYPES.REVOKED) {
    return parsed.message;
  }

  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    parsed.type === SHARE_ERROR_TYPES.INVALID ||
    parsed.type === SHARE_ERROR_TYPES.FORBIDDEN
  ) {
    return "Version history is not available for this share link yet.";
  }

  const raw = String(error?.message || "").trim();
  if (raw && !/^no message available$/i.test(raw) && !/invalid/i.test(raw)) {
    return raw;
  }

  return "Unable to load version history for this share link. Please try again.";
}
