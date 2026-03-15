import { Navigate } from "react-router-dom";

import DashboardLayout from "../components/Layout/DashboardLayout";
import UploadPage from "../pages/UploadPage";
import OcrSummarizationPage from "../pages/OcrSummarizationPage";
import Dashboard from "../pages/Dashboard";

function withLayout(element, pageTitle, pageSubtitle) {
  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </DashboardLayout>
  );
}

export const routes = [
  {
    path: "/dashboard",
    element: withLayout(<Dashboard />, "Dashboard", "Overview of your workspace"),
  },
  {
    path: "/documents",
    element: <Navigate to="/uploads" replace />,
  },
  {
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload."),
  },
  {
    path: "/ocr",
    element: withLayout(<OcrSummarizationPage />, "OCR Summarization", "Extract and summarize text from images and PDFs."),
  },
];
