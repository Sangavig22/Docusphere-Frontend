
import MyDocumentsPage from "../pages/MyDocumentsPage";
import StarredPage from "../pages/StarredPage";
import RecentPage from "../pages/RecentPage";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";


function withLayout(element, pageTitle, pageSubtitle) {
  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </DashboardLayout>
  );
}

export const documentRoutes = [
  {
    path: "/dashboard",
    element: <Navigate to="/documents" replace />,
  },
  {
    path: "/documents",
    element: withLayout(<MyDocumentsPage />, "My Documents", "Manage and organize all your documents."),
  },
 
  {
    path: "/starred",
    element: withLayout(<StarredPage />, "Starred", "Manage and organize all your documents."),
  },
  {
    path: "/recent",
    element: withLayout(<RecentPage />, "Recent", "Manage and organize all your documents."),
  },
];
