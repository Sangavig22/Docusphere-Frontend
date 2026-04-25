import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ 
  children, 
  pageTitle, 
  pageSubtitle, 
  user,
  type = "dashboard" 
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const defaultUser = {
    name: "sample",
    email: "sample@example.com",
  };

  const currentUser = user ?? defaultUser;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        type={type}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          user={currentUser}
          title={pageTitle}
          subtitle={pageSubtitle}
          type={type}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
