/**
 * Resolves the document owner ID from various possible fields in the document object.
 */
export const resolveDocumentOwnerId = (doc) => {
  const candidates = [
    doc?.ownerId,
    doc?.ownerUserId,
    doc?.uploadedById,
    doc?.createdById,
    doc?.creatorId,
    doc?.userId,
    doc?.createdBy?.id,
    doc?.createdBy?.userId,
    doc?.uploadedBy?.id,
    doc?.uploadedBy?.userId,
  ];

  for (const candidate of candidates) {
    const value = candidate == null ? "" : String(candidate).trim();
    if (value) return value;
  }

  return "";
};

/**
 * Checks if a user has permission to view a document.
 */
export const canViewDocument = (document, currentUserId, currentUserGlobalRole, userTeamRole) => {
  if (!document) return false;

  const ownerId = resolveDocumentOwnerId(document);
  const userIdStr = currentUserId == null ? "" : String(currentUserId).trim();

  // Platform Admin has global access
  if (currentUserGlobalRole?.toUpperCase() === "ADMIN") {
    return true;
  }

  // Personal Documents (teamId is null or undefined or empty string/UUID)
  const isPersonal = !document.teamId;
  if (isPersonal) {
    return ownerId !== "" && ownerId === userIdStr;
  }

  // Team Documents - user must be in the team (i.e. has a valid role)
  if (!userTeamRole) return false;
  
  const roleStr = String(userTeamRole).toUpperCase();
  return roleStr === "LEADER" || roleStr === "MANAGER" || roleStr === "MEMBER";
};

/**
 * Checks if a user has permission to download a document.
 */
export const canDownloadDocument = (document, currentUserId, currentUserGlobalRole, userTeamRole) => {
  if (!document) return false;

  const ownerId = resolveDocumentOwnerId(document);
  const userIdStr = currentUserId == null ? "" : String(currentUserId).trim();

  // Platform Admin has global access
  if (currentUserGlobalRole?.toUpperCase() === "ADMIN") {
    return true;
  }

  // Personal Documents
  const isPersonal = !document.teamId;
  if (isPersonal) {
    return ownerId !== "" && ownerId === userIdStr;
  }

  // Team Documents - user must be in the team
  if (!userTeamRole) return false;

  const roleStr = String(userTeamRole).toUpperCase();
  return roleStr === "LEADER" || roleStr === "MANAGER" || roleStr === "MEMBER";
};

/**
 * Checks if a user has permission to edit a document.
 */
export const canEditDocument = (document, currentUserId, currentUserGlobalRole, userTeamRole) => {
  if (!document) return false;

  const ownerId = resolveDocumentOwnerId(document);
  const userIdStr = currentUserId == null ? "" : String(currentUserId).trim();

  // Platform Admin has global access
  if (currentUserGlobalRole?.toUpperCase() === "ADMIN") {
    return true;
  }

  // Personal Documents
  const isPersonal = !document.teamId;
  if (isPersonal) {
    return ownerId !== "" && ownerId === userIdStr;
  }

  // Team Documents
  if (!userTeamRole) return false;

  const roleStr = String(userTeamRole).toUpperCase();
  if (roleStr === "LEADER" || roleStr === "MANAGER") {
    return true;
  }

  if (roleStr === "MEMBER") {
    // Member who uploaded document: edit own document
    return ownerId !== "" && ownerId === userIdStr;
  }

  return false;
};
