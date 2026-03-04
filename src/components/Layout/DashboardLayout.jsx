import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children, pageTitle, pageSubtitle }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentUser = {
    name: "Nilaks",
    email: "nilaks@example.com",
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          user={currentUser}
          title={pageTitle}
          subtitle={pageSubtitle}
        />
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
