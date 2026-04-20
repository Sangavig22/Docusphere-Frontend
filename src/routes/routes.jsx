import Layout from "../components/Layout/Layout";

function withLayout(element, pageTitle, pageSubtitle, type = "dashboard") {
  return (
    <Layout type={type} pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {element}
    </Layout>
  );
}
export const routes = [

  {
    path: "/",
    element: <LandingPage />,
  },
];
    

