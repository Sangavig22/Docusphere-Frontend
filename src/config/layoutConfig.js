// Shared layout colors for sidebar and topbar
const SHARED_COLORS = {
  avatarBg: "bg-blue-400 hover:bg-blue-500",
  sidebarActiveLink: "bg-blue-600 text-white shadow-sm",
  // use transparent hover in dark mode to avoid bright white-highlight
  sidebarHoverLink: "hover:bg-blue-50 dark:hover:bg-transparent",
};

export const LAYOUT_COLORS = {
  dashboard: SHARED_COLORS,
  admin: SHARED_COLORS,
};
