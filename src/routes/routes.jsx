import React from "react";
import AdminLayout from "../components/Layout/AdminLayout.jsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";

function withLayout(element, pageTitle, pageSubtitle) {
  return (
    <AdminLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </AdminLayout>
  );
}

export const routes = [
  {
    path: "/admin/dashboard",
    element: withLayout(<AdminDashboardPage />, 
      "Dashboard", 
      "Manage Your platform with ease"),
  },
];
