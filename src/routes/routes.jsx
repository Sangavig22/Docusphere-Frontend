import DashboardLayout from "../components/Layout/DashboardLayout";
import UploadPage from "../pages/UploadPage";
import { Navigate } from "react-router-dom";


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
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload."),
  },
];
