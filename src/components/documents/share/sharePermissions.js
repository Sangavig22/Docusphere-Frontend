export const INVITE_PERMISSION_OPTIONS = [
  { value: "VIEW", label: "view" },
  { value: "COMMENT", label: "comment" },
  { value: "EDIT", label: "edit" },
];

export const PUBLIC_PERMISSION_OPTIONS = [
  { value: "VIEW", label: "view" },
  { value: "COMMENT", label: "comment" },
];

export function getPermissionLabel(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "COMMENT") return "comment";
  if (value === "EDIT") return "edit";
  return "view";
}

export function getPermissionRole(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "COMMENT") return "Commenter";
  if (value === "EDIT") return "Editor";
  return "Viewer";
}

export function getPermissionBadgeClasses(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "EDIT") {
    return "bg-violet-100 text-violet-800 ring-violet-200";
  }
  if (value === "COMMENT") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }
  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

export function getInvitePermissionHint(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "COMMENT") return "Invited users can view and add comments.";
  if (value === "EDIT") return "Invited users can edit document content.";
  return "Invited users can view and download only.";
}

export function getPublicPermissionHint(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "COMMENT") return "Anyone with the link can view and comment.";
  return "Anyone with the link can view and download only.";
}

export function resolveShareAccessType(doc) {
  if (isEmailInviteShare(doc)) {
    return {
      key: "email",
      label: "Email invite",
      description: "This link was sent to a specific email address. No sign-in is required.",
    };
  }
  return {
    key: "public",
    label: "Public link",
    description: "Anyone with this link can access the current document. No sign-in is required.",
  };
}

export function isEmailInviteShare(doc) {
  const email = doc?.invitedEmail || doc?.inviteeEmail || doc?.recipientEmail;
  if (email && String(email).trim()) return true;

  const shareType = String(
    doc?.shareType || doc?.accessType || doc?.share?.type || doc?.type || "",
  ).toUpperCase();

  return shareType === "EMAIL_INVITE" || shareType === "EMAIL";
}

export function canAccessSharedVersionHistory(doc) {
  return isEmailInviteShare(doc);
}

export function getSharedAccessSummary(permission, shareAccessType) {
  const value = String(permission || "VIEW").toUpperCase();
  const isPublic = shareAccessType?.key === "public";

  if (isPublic) {
    if (value === "COMMENT") {
      return "Download the current document and join the discussion below. Sign-in is not required.";
    }
    return "Download the current document using the button above. Sign-in is not required.";
  }

  if (value === "EDIT") {
    return "You can edit, download, and view version history via this email invite. Sign-in is not required.";
  }
  if (value === "COMMENT") {
    return "You can download, comment, and browse version history via this email invite. Sign-in is not required.";
  }
  return "You can download and browse version history via this email invite. Sign-in is not required.";
}
