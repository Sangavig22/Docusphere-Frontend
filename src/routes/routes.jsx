import DashboardLayout from "../components/Layout/DashboardLayout";
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
    path: "/dashboard",
    element: withLayout(
      <Dashboard />,
      "Dashboard",
      "Overview of your workspace"
    ),
  },
];
