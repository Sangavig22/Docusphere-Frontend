import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// --- Icons ---
const IconAdminHubLogo = () => (
  <div className="w-8 h-8 rounded bg-slate-900 dark:bg-white flex items-center justify-center shrink-0 transition-colors">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white dark:text-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  </div>
);

const IconDashboard = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconTeam = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMerge = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="8" cy="12" r="4" />
    <circle cx="16" cy="12" r="4" />
    <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1.2" />
    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.2" />
  </svg>
);

const IconChevronRight = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? "w-[90px]" : "w-[260px]";
  const linkPadding = isCollapsed ? "justify-center px-0" : "px-4";

  const linkBase = `flex items-center gap-3 py-3 rounded-2xl text-[14px] transition-all font-semibold mb-2 ${linkPadding}`;
  
  // Updated for Light and Dark mode
  const linkInactive = "bg-[#f8fafc] dark:bg-slate-800/50 text-[#64748b] dark:text-slate-400 hover:bg-[#f1f5f9] dark:hover:bg-slate-800 hover:text-[#0f172a] dark:hover:text-white";
  const linkActive = "bg-[#3b82f6] text-white shadow-lg shadow-blue-100 dark:shadow-none";

  return (
    <aside className={`
      ${sidebarWidth} 
      bg-white dark:bg-slate-900 
      border-r border-slate-100 dark:border-slate-800 
      flex flex-col py-5 px-4 font-sans h-screen 
      sticky top-0 transition-all duration-300 ease-in-out
    `}>
      
      {/* Logo Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} font-bold text-slate-900 dark:text-white tracking-wide text-[15px] mb-8 px-2 overflow-hidden`}>
        <IconAdminHubLogo />
        {!isCollapsed && <span className="whitespace-nowrap">AdminHub</span>}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <IconDashboard className="shrink-0 w-5 h-5" />
          {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
        </NavLink>

        <NavLink to="/teams" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <IconTeam className="shrink-0 w-5 h-5" />
          {!isCollapsed && <span className="whitespace-nowrap">Team Management</span>}
        </NavLink>

        <NavLink to="/merge" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <IconMerge className="shrink-0 w-5 h-5" />
          {!isCollapsed && <span className="whitespace-nowrap">Merge Teams</span>}
        </NavLink>
      </nav>

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mt-auto`}
        aria-label="Collapse sidebar"
      >
        <IconChevronRight className={`shrink-0 w-4 h-4 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} />
        {!isCollapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};

export default Sidebar;