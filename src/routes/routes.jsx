import React from "react";
import LandingPage from "../pages/authentication/LandingPage";
import SignUp from "../pages/authentication/SignUp";
import SignIn from "../pages/authentication/SignIn";
import EmailVerification from "../pages/authentication/EmailVerification";
import DashboardSelector from "../pages/authentication/DashboardSelector";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import SettingsPage from "../pages/SettingsPage.jsx";
import Layout from "../components/Layout/Layout";
import Dashboard from "../Pages/Dashboard";
import UploadPage from "../pages/UploadPage";
import AdminReportsPage from "../pages/AdminReportsPage.jsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";
import OCRSummarization from "../pages/OCRSummarization";
import MyDocumentsPage from "../pages/MyDocumentsPage";
import StarredPage from "../pages/StarredPage";
import RecentPage from "../pages/RecentPage";
import TrashPage from "../pages/TrashPage";
import Team from "../pages/Team.jsx";
import TeamNew from "../pages/TeamNew.jsx";
import TeamDetail from "../pages/TeamDetail.jsx";
import SharedDocumentPage from "../pages/SharedDocumentPage";
import SharedVersionPreviewPage from "../pages/SharedVersionPreviewPage";
import AdminTeamManagementPage from "../pages/AdminTeamManagementPage.jsx";
import AdminTeamDetailsPage from "../pages/AdminTeamDetailsPage.jsx";
import AdminMergeTeamsPage from "../pages/AdminMergeTeamsPage.jsx";
import DocumentPreviewPage from "../pages/DocumentPreviewPage";
import DocumentEditorPage from "../pages/DocumentEditorPage";
import VersionPreviewPage from "../pages/VersionPreviewPage";
import AdminGlobalSearch from "../pages/AdminGlobalSearch.jsx";



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
    theme: "light",
    protected: false,
  },
  {
    path: "/signup",
    element: <SignUp />,
    theme: "light",
    protected: false,
  },
  {
    path: "/signin",
    element: <SignIn />,
    theme: "light",
    protected: false,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    theme: "light",
    protected: false,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    theme: "light",
    protected: false,
  },
  {
    path: "/verify-email",
    element: <EmailVerification />,
    theme: "light",
    protected: false,
  },
  {
    path: "/share/:token",
    element: <SharedDocumentPage />,
    protected: false,
  },
  {
    path: "/share/:token/versions/:versionId",
    element: <SharedVersionPreviewPage />,
    protected: false,
  },

  {
    path: "/dashboard-selector",
    element: <DashboardSelector />,
    theme: "light",
    protected: true,
  },
  {
    path: "/dashboard",
    element: withLayout(<Dashboard />, "Dashboard", "Overview of your workspace"),
    protected: true,
  },
  {
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload."),
    protected: true,
  },
  {
    path: "/ocr",
    element: withLayout(
      <OCRSummarization />,
      "OCR Summarization",
      "Extract text and summarize documents."
    ),
    protected: true,
  },
  {
    path: "/documents",
    element: withLayout(<MyDocumentsPage />, "My Documents", "Manage and organize all your documents."),
    protected: true,
  },
  {
    path: "/documents/:documentId/preview",
    element: <DocumentPreviewPage />,
     protected: true,
  },
  {
    path: "/documents/:documentId/versions/:versionId/preview",
    element: <VersionPreviewPage />,
    protected: true,
  },
  {
    path: "/editor/:documentId",
    element: <DocumentEditorPage />,
     protected: true,
  },


  {
    path: "/starred",
    element: withLayout(<StarredPage />, "Starred ", "Manage and organize all starred documents."),
    protected: true,
  },
  {
    path: "/recent",
    element: withLayout(<RecentPage />, "Recent", "Manage and organize all recently opened documents."),
    protected: true,
  },
  {
    path: "/trash",
    element: withLayout(<TrashPage />, "Recycle Bin", "Restore or permanently delete documents."),
    protected: true,
  },
  {
    path: "/team",
    element: withLayout(<Team />, "Teams", "Collaborate with your team members"),
    protected: true,
  },
  {
    path: "/team/new",
    element: withLayout(<TeamNew />, "New Team", "Create a new collaborative workspace"),
    protected: true,
  },
  {
    path: "/team/:teamId",
    element: withLayout(<TeamDetail />, "Team Details", "Manage team documents and members"),
    protected: true,
  },
   {
    path: "/setting",
    element: withLayout(<SettingsPage />, "Settings", "Manage your account and preferences."
    ),
    protected: true,
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
    protected: true,
  },
  {
    path: "/admin/teams",
    element: withLayout(
      <AdminTeamManagementPage />,
      "Teams",
      "Manage all teams",
      "admin"
    ),
    protected: true,
  },
  {
    path: "/admin/merge",
    element: withLayout(
      <AdminMergeTeamsPage />,
      "Merge Teams",
      "Combine two teams into one",
      "admin"
    ),
    protected: true,
  },
  {
    path: "/admin/reports",
    element: withLayout(
      <AdminReportsPage />,
      "Export Reports",
      "Download system data in PDF or CSV format",
      "admin"
    ),
  },
  {
    path: "/admin/search",
    element: withLayout(
      <AdminGlobalSearch />,
      "Global Search",
      "Search across all users, teams, and documents",
      "admin"
    ),
  },
  {
    path: "/admin/teams/new",
    element: withLayout(
      <TeamNew />,
      "New Team",
      "Create a new organization team",
      "admin"
    ),
    protected: true,
  },
  {
    path: "/admin/teams/:teamId",
    element: withLayout(
      <AdminTeamDetailsPage />,
      "Team Details",
      "Manage team members and documents",
      "admin"
    ),
    protected: true,
  },
];
