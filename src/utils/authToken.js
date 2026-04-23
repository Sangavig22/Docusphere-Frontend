const TOKEN_USER_ID_FIELDS = ["userId", "uid", "sub"];

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    return safeJsonParse(decoded);
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return "";

  for (const key of TOKEN_USER_ID_FIELDS) {
    const value = payload?.[key];
    if (value) return String(value).trim();
  }

  return "";
}
