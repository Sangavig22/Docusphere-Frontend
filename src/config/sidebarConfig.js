import { LayoutDashboard, FileText, Upload, Users, Star, Clock, Search, ScanText, Settings, HelpCircle, RecycleIcon, GitMerge,Download } from "lucide-react";

// Dashboard menu items
export const DASHBOARD_MENU = {
  primary: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Documents", icon: FileText, to: "/documents" },
    { label: "Uploads", icon: Upload, to: "/uploads" },
    { label: "Team", icon: Users, to: "/team" },
    { label: "Starred", icon: Star, to: "/starred" },
    { label: "Recent", icon: Clock, to: "/recent" },
    { label: "OCR", icon: ScanText, to: "/ocr" },

  ],
  secondary: [
    { label: "Recycle bin", icon: RecycleIcon, to: "/trash" },
    { label: "Settings", icon: Settings, to: "/setting" },
    { label: "Help & Support", icon: HelpCircle, to: "/help" },
  ],
};

// Admin menu items
export const ADMIN_MENU = {
  primary: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
    { label: "Team Management", icon: Users, to: "/admin/teams" },
    { label: "Global Search", icon: Search, to: "/admin/search" },
    { label: "Export Reports", icon: Download, to: "/admin/reports" },
    { label: "Merge Teams", icon: GitMerge, to: "/admin/merge" },
  ],
  secondary: [
    { label: "Settings", icon: Settings, to: "/setting" },
    { label: "Help & Support", icon: HelpCircle, to: "/help" },
  ],
};

// Shared sidebar styles
const SHARED_STYLES = {
  widthCollapsed: "w-20",
  widthExpanded: "w-64",
  container: "bg-card h-screen shadow-md flex flex-col transition-all duration-300",
};

// Sidebar styles
export const SIDEBAR_STYLES = {
  dashboard: SHARED_STYLES,
  admin: SHARED_STYLES,
};

