import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { TeamsProvider } from "../features/teams/TeamsProvider";

const AdminLayout = () => {
  return (
    <TeamsProvider>
      <div className="flex min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TeamsProvider>
  );
};

export default AdminLayout;
