export function formatVersionLabel(versionNumber) {
  const num = Number(versionNumber);
  if (!Number.isFinite(num) || num <= 0) return "V?";
  return `V${num}`;
}

export function formatEditorRole(role) {
  const normalized = String(role || "").trim();
  if (!normalized) return null;

  const upper = normalized.toUpperCase();
  if (upper === "LEADER") return "Team Lead";
  if (upper === "MANAGER") return "Manager";
  if (upper === "MEMBER") return "Member";
  if (upper === "ADMIN") return "Admin";
  if (upper === "OWNER") return "Owner";

  return normalized;
}

export function resolveChangeSummary(summary) {
  const text = String(summary || "").trim();
  return text || "Document edited";
}

export function decorateVersionStatuses(versions, { page = 1, documentProtected = false } = {}) {
  if (!Array.isArray(versions) || versions.length === 0) return [];

  const maxVersionNumber = Math.max(...versions.map((version) => version.versionNumber));

  return versions.map((version) => ({
    ...version,
    isLatest: Boolean(version.isLatest) || (page === 1 && version.versionNumber === maxVersionNumber),
    isProtected: Boolean(version.isProtected) || Boolean(documentProtected),
    changeSummary: resolveChangeSummary(version.changeSummary),
  }));
}
