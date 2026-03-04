import React, { useMemo, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useTheme } from "../theme/useTheme.js";
import DropdownMenu from "../ui/DropdownMenu";

// --- Icons ---
const IconMoon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconBell = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconUser = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLogOut = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// --- Styles ---
const btnBase = "w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200";

// --- Notification Dropdown Component ---
const NotificationDropdown = () => {
  const notifications = [
    { id: 1, message: "New User Registered", time: "2 min ago" },
    { id: 2, message: "Security Alert", time: "10 min ago" },
  ];

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
        <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
          2 new
        </span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors group">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{n.message}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{n.time}</p>
          </div>
        ))}
      </div>
      <button className="w-full py-3 text-[13px] text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-t border-slate-50 dark:border-slate-800">
        View All Notifications
      </button>
    </div>
  );
};

const Topbar = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { title, subtitle } = useMemo(() => {
    if (matchPath({ path: "/teams/:teamId" }, pathname) || matchPath({ path: "/teams" }, pathname)) {
      return { title: "Team Management", subtitle: "Manage your platform with ease" };
    }
    if (matchPath({ path: "/merge" }, pathname)) {
      return { title: "Merge Teams", subtitle: "Manage your platform with ease" };
    }
    return { title: "Dashboard", subtitle: "Manage Your platform with ease" };
  }, [pathname]);

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/95 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          {title}
        </h1>
        <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          className={btnBase}
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
        >
          <IconMoon className={`shrink-0 ${theme === "dark" ? "text-amber-300" : ""}`} />
        </button>

        {/* Notifications */}
        <DropdownMenu
          trigger={
            <button
              type="button"
              className={`relative ${btnBase}`}
              aria-label="Notifications"
            >
              <IconBell className="shrink-0" />
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                2
              </span>
            </button>
          }
          widthClassName="w-72"
        >
          <NotificationDropdown />
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu
          trigger={
            <button type="button" className={btnBase} aria-label="Profile">
              <IconUser className="shrink-0" />
            </button>
          }
          widthClassName="w-64"
        >
          {({ close }) => (
            <div className="py-2">
              <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Admin User</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">admin@docusphere.com</p>
              </div>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 font-semibold transition-colors"
                onClick={() => {
                  console.log("Logging out...");
                  close();
                }}
              >
                <IconLogOut className="shrink-0" />
                Sign Out
              </button>
            </div>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;