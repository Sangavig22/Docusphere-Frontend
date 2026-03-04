import { NavLink } from "react-router-dom";
import logo_2 from "../../assets/logo_2.jpeg";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  Star,
  Clock,
  Search,
  ScanText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Sidebar({ collapsed, onToggle }) {
  const primaryMenu = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Documents", icon: FileText, to: "/documents" },
    { label: "Uploads", icon: Upload, to: "/uploads" },
    { label: "Team", icon: Users, to: "/team" },
    { label: "Starred", icon: Star, to: "/starred" },
    { label: "Recent", icon: Clock, to: "/recent" },
    { label: "Search", icon: Search, to: "/search" },
    { label: "OCR", icon: ScanText, to: "/ocr" },
  ];

  const secondaryMenu = [
    { label: "Settings", icon: Settings },
    { label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <aside
      className={`bg-white h-screen shadow-md flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between gap-3 px-4 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center">
            <img
              src={logo_2}
              alt="DocuSphere logo"
              className="h-9 w-9 object-contain"
            />
          </div>
          {!collapsed && (
            <span className="text-xl font-semibold text-slate-900">
              Docu<span className="text-blue-600">Sphere</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {primaryMenu.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-blue-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-100">
        <ul className="space-y-1">
          {secondaryMenu.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 transition-colors">
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
