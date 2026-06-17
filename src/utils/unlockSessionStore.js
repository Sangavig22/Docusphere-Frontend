/** Client-side unlock session cache (15 minutes). Does not store passwords. */

export const UNLOCK_SESSION_TTL_MS = 15 * 60 * 1000;

const sessions = new Map();

export function createUnlockSession({ unlockToken, expiresAt } = {}) {
  const expiresAtMs =
    expiresAt != null
      ? typeof expiresAt === "number"
        ? expiresAt
        : new Date(expiresAt).getTime()
      : Date.now() + UNLOCK_SESSION_TTL_MS;

  return {
    token: unlockToken || `session-${crypto.randomUUID?.() ?? Date.now()}`,
    expiresAt: expiresAtMs,
  };
}

function notifyUnlockChange(documentId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("docusphere-unlock-changed", { detail: { documentId: String(documentId) } }),
  );
}

export function setUnlockSession(documentId, session) {
  if (!documentId || !session) return;
  sessions.set(String(documentId), session);
  notifyUnlockChange(documentId);
}

export function getUnlockSession(documentId) {
  if (!documentId) return null;
  return sessions.get(String(documentId)) ?? null;
}

export function clearUnlockSession(documentId) {
  if (!documentId) return;
  sessions.delete(String(documentId));
  notifyUnlockChange(documentId);
}

export function hasValidUnlockSession(documentId) {
  const session = getUnlockSession(documentId);
  if (!session) return false;
  if (Date.now() >= session.expiresAt) {
    sessions.delete(String(documentId));
    return false;
  }
  return true;
}

export function clearAllUnlockSessions() {
  sessions.clear();
}
