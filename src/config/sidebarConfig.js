import { LayoutDashboard, FileText, Upload, Users, Star, Clock, Search, ScanText, Settings, HelpCircle, RecycleIcon, GitMerge } from "lucide-react";

// Dashboard menu items
export const DASHBOARD_MENU = {
  primary: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Documents", icon: FileText, to: "/documents" },
    { label: "Uploads", icon: Upload, to: "/uploads" },
    { label: "Team", icon: Users, to: "/team" },
    { label: "Starred", icon: Star, to: "/starred" },
    { label: "Recent", icon: Clock, to: "/recent" },
    { label: "Search", icon: Search, to: "/search" },
    { label: "OCR", icon: ScanText, to: "/ocr" },
  ],
  secondary: [
    { label: "Recycle bin", icon: RecycleIcon, to: "/trash" },
    { label: "Settings", icon: Settings },
    { label: "Help & Support", icon: HelpCircle },
  ],
};

// Admin menu items
export const ADMIN_MENU = {
  primary: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
    { label: "Team Management", icon: Users, to: "/teams" },
    { label: "Merge Teams", icon: GitMerge, to: "/merge" },
  ],
  secondary: [
    { label: "Settings", icon: Settings },
    { label: "Help & Support", icon: HelpCircle },
  ],
};

// Shared sidebar styles
const SHARED_STYLES = {
  widthCollapsed: "w-20",
  widthExpanded: "w-64",
  container: "bg-white h-screen shadow-md flex flex-col transition-all duration-300",
};

// Sidebar styles
export const SIDEBAR_STYLES = {
  dashboard: SHARED_STYLES,
  admin: SHARED_STYLES,
};

