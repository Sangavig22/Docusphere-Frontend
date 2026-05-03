import { NavLink } from "react-router-dom";
import logo_2 from "../../assets/logo_2.jpeg";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { DASHBOARD_MENU, ADMIN_MENU, SIDEBAR_STYLES } from "../../config/sidebarConfig";
import { LAYOUT_COLORS } from "../../config/layoutConfig";

function Sidebar({ collapsed, onToggle, type = "dashboard" }) {
  const menu = type === "admin" ? ADMIN_MENU : DASHBOARD_MENU;
  const styles = SIDEBAR_STYLES[type];
  const colors = LAYOUT_COLORS[type];
  
  const { primary: primaryMenu, secondary: secondaryMenu } = menu;
  const widthClass = collapsed ? styles.widthCollapsed : styles.widthExpanded;

  return (
    <aside className={`${widthClass} ${styles.container}`}>
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between gap-3 px-4 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center">
            <img src={logo_2} alt="DocuSphere logo" className="h-9 w-9 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-slate-900">
                Docu<span className="text-blue-600">Sphere</span>
              </span>
              {type === "admin" && (
                <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold w-fit mt-1">
                  <Shield size={10} />
                  Admin
                </span>
              )}
            </div>
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
                  end
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? colors.sidebarActiveLink : `text-slate-600 ${colors.sidebarHoverLink}`
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
      {secondaryMenu.length > 0 && (
        <div className="px-3 pb-4 pt-2 border-t border-slate-100">
          <ul className="space-y-1">
            {secondaryMenu.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  {item.to ? (
                    <NavLink
                      to={item.to}
                      end
                      title={collapsed ? item.label : ""}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? colors.sidebarActiveLink : `text-slate-600 ${colors.sidebarHoverLink}`
                        }`
                      }
                    >
                      <Icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ) : (
                    <button
                      title={collapsed ? item.label : ""}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 ${colors.sidebarHoverLink} transition-colors`}
                    >
                      <Icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;