import DashboardLayout from "../components/Layout/DashboardLayout";
import UploadPage from "../pages/UploadPage";
import { Navigate } from "react-router-dom";

import Dashboard from "../Pages/Dashboard";

function withLayout(element, pageTitle, pageSubtitle) {
  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </DashboardLayout>
  );
}

export const routes = [

  {
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload."),
  },
];
<<<<<<< sangavi/feature/upload-document
    

=======
    element: withLayout(
      <Dashboard />,
      "Dashboard",
      "Overview of your workspace"
    ),
  },
];
>>>>>>> develop
