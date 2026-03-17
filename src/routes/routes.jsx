import React from "react";
import LandingPage from "../pages/LandingPage";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import DashboardLayout from "../components/Layout/DashboardLayout";
import AdminLayout from "../components/Layout/AdminLayout.jsx";
import Dashboard from "../Pages/Dashboard";
import UploadPage from "../pages/UploadPage";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";
import OCRSummarization from "../pages/OCRSummarization";
import MyDocumentsPage from "../pages/MyDocumentsPage";
import StarredPage from "../pages/StarredPage";
import RecentPage from "../pages/RecentPage";

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

  {
    path: "/",
    element: <LandingPage />,
  },
   {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/dashboard",
    element: withLayout(<Dashboard />, "Dashboard", "Overview of your workspace"),
  },
  {
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload." ),
  },
  {
    path: "/ocr",
    element: withLayout(
      <OCRSummarization />,
      "OCR Summarization",
      "Extract text and summarize documents."
    ),
  },
   {
    path: "/documents",
    element: withLayout(<MyDocumentsPage />, "My Documents", "Manage and organize all your documents."),
  },
 
  {
    path: "/starred",
    element: withLayout(<StarredPage />, "Starred ", "Manage and organize all starred documents."),
  },
  {
    path: "/recent",
    element: withLayout(<RecentPage />, "Recent", "Manage and organize all recently opened documents."),
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