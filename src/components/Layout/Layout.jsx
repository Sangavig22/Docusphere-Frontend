import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import authService from "../../services/authService";

function Layout({
  children,
  pageTitle,
  pageSubtitle,
  user,
  role = "user",
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const storedUser =
    typeof authService?.getUser === "function"
      ? authService.getUser()
      : (() => {
          try {
            const raw = localStorage.getItem("authUser");
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

  const currentUser = user ?? storedUser ?? { name: "User", email: "" };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        role={role}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          user={currentUser}
          title={pageTitle}
          subtitle={pageSubtitle}
          type={role}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
