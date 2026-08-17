export const PUBLIC_LINK_EXPIRY_OPTIONS = [
  { value: "default", label: "24 hours (default)" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

export function buildShareExpiresAt(days) {
  const parsed = Number(days);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  const date = new Date();
  date.setDate(date.getDate() + parsed);
  return date.toISOString().slice(0, 19);
}

export function resolveShareExpiresAt(expiryChoice) {
  if (!expiryChoice || expiryChoice === "default") return undefined;
  return buildShareExpiresAt(expiryChoice);
}

export function extractShareMetadata(payload) {
  const root = payload?.data ?? payload ?? {};
  const nested = root?.data && typeof root.data === "object" ? root.data : null;
  const source = nested || root;

  const shareUrl = source.shareUrl || source.publicUrl || root.shareUrl || "";
  let token = source.token || source.shareToken || source.linkToken || "";

  if (!token && shareUrl) {
    const match = String(shareUrl).match(/\/share\/([^/?#]+)/i);
    if (match) token = decodeURIComponent(match[1]);
  }

  const expiresAt =
    source.expiresAt || source.expiry || source.expiresAtUtc || root.expiresAt || null;

  return { shareUrl, token, expiresAt };
}

export function formatShareExpiry(expiresAt) {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildShareUrl(token) {
  if (!token || typeof window === "undefined") return "";
  return `${window.location.origin}/share/${encodeURIComponent(token)}`;
}

export function parseDocumentShares(payload) {
  const root = payload?.data ?? payload;
  const list = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.shares)
      ? root.shares
      : Array.isArray(root)
        ? root
        : [];

  return list.map(normalizeShareRecord).filter(Boolean).filter((item) => !item.revokedAt);
}

function normalizeShareRecord(raw) {
  if (!raw || typeof raw !== "object") return null;

  const token = String(raw.token || raw.shareToken || raw.linkToken || "").trim();
  const type = String(raw.type || raw.shareType || raw.accessType || "").toUpperCase();
  const invitedEmail = String(raw.invitedEmail || raw.email || raw.recipientEmail || "")
    .trim()
    .toLowerCase();
  const shareUrl = raw.shareUrl || raw.publicUrl || (token ? buildShareUrl(token) : "");

  return {
    id: String(raw.id || token || invitedEmail || shareUrl),
    token,
    type,
    permission: String(raw.permission || "VIEW").toUpperCase(),
    invitedEmail,
    expiresAt: raw.expiresAt || raw.expiry || raw.expiresAtUtc || null,
    revokedAt: raw.revokedAt || raw.revoked || null,
    shareUrl,
  };
}
