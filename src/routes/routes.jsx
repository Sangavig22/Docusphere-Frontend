import React from "react";
import LandingPage from "../pages/authentication/LandingPage";
import SignUp from "../pages/authentication/SignUp";
import SignIn from "../pages/authentication/SignIn";
import EmailVerification from "../pages/authentication/EmailVerification";
import DashboardSelector from "../pages/authentication/DashboardSelector";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import Layout from "../components/Layout/Layout";
import Dashboard from "../Pages/Dashboard";
import UploadPage from "../pages/UploadPage";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";
import OCRSummarization from "../pages/OCRSummarization";
import MyDocumentsPage from "../pages/MyDocumentsPage";
import StarredPage from "../pages/StarredPage";
import RecentPage from "../pages/RecentPage";
import TrashPage from "../pages/TrashPage";
import Team from "../pages/Team.jsx";
import TeamNew from "../pages/TeamNew.jsx";
import TeamDetail from "../pages/TeamDetail.jsx";

function withLayout(element, pageTitle, pageSubtitle, type = "dashboard") {
  return (
    <Layout type={type} pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </Layout>
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
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/dashboard-selector",
    element: <DashboardSelector />,
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
   {
    path: "/trash",
    element: withLayout(<TrashPage />, "Recycle Bin", "Restore or permanently delete documents."),
  },
  {
    path: "/team",
    element: withLayout(<Team />, "Teams", "Collaborate with your team members"),
  },
  {
    path: "/team/new",
    element: withLayout(<TeamNew />, "New Team", "Create a new collaborative workspace"),
  },
  {
    path: "/team/:teamId",
    element: withLayout(<TeamDetail />, "Team Details", "Manage team documents and members"),
  },

  // Admin route
  {
    path: "/admin/dashboard",
    element: withLayout(
      <AdminDashboardPage />,
      "Dashboard",
      "Manage your platform with ease",
      "admin"
    ),
  },
];
