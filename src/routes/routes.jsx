import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import AdminLayout from "../components/Layout/AdminLayout.jsx";

import Dashboard from "../Pages/Dashboard";
import UploadPage from "../pages/UploadPage";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";

// Wrapper functions
function withLayout(element, pageTitle, pageSubtitle) {
  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </DashboardLayout>
  );
}

function withAdminLayout(element, pageTitle, pageSubtitle) {
  return (
    <AdminLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </AdminLayout>
  );
}

// Combined routes
export const routes = [
  // User routes
  {
    path: "/dashboard",
    element: withLayout(<Dashboard />, "Dashboard", "Overview of your workspace"),
  },
  {
    path: "/uploads",
    element: withLayout(
      <UploadPage />,
      "Uploads",
      "Drag and drop files or browse to upload."
    ),
  },

  // Admin route
  {
    path: "/admin/dashboard",
    element: withAdminLayout(
      <AdminDashboardPage />,
      "Dashboard",
      "Manage your platform with ease"
    ),
  },
];
