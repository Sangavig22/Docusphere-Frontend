import Layout from "../components/Layout/Layout";
import UploadPage from "../pages/UploadPage";

function withLayout(element, pageTitle, pageSubtitle, type = "dashboard") {
  return (
    <Layout type={type} pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </Layout>
  );
}
export const routes = [

  {
    path: "/uploads",
    element: withLayout(<UploadPage />, "Uploads", "Drag and drop files or browse to upload."),
  },
];
    

