/**
 * Determines whether the current user can restore a document version.
 *
 * Personal space: document owner only.
 * Team space: LEADER, MANAGER, or document owner with elevated role — members cannot restore.
 * Shared documents: document owner only (non-owners may view/download).
 */
export function canRestoreVersion({ doc, userTeamRole } = {}) {
  if (!doc) return false;

  const teamId = doc?.teamId ?? doc?.teamID ?? doc?.team?.id;
  const isTeamDocument = teamId != null && String(teamId).trim() !== "";

  if (!isTeamDocument) {
    return doc?.isOwner === true;
  }

  const role = String(userTeamRole || "").toUpperCase();
  if (role === "LEADER" || role === "MANAGER") {
    return true;
  }

  return false;
}

export function canAccessVersionHistory() {
  return true;
}
