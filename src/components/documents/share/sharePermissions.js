export const INVITE_PERMISSION_OPTIONS = [
  { value: "VIEW", label: "Can view" },
  { value: "COMMENT", label: "Can comment" },
  { value: "EDIT", label: "Can edit" },
];

export const PUBLIC_PERMISSION_OPTIONS = [
  { value: "VIEW", label: "Can view" },
  { value: "COMMENT", label: "Can comment" },
];

export function getPermissionLabel(permission) {
  const value = String(permission || "VIEW").toUpperCase();
  if (value === "COMMENT") return "Can comment";
  if (value === "EDIT") return "Can edit";
  return "Can view";
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
