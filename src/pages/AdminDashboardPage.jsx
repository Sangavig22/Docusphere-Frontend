import React from "react";
import AdminStatCard from "../components/ui/AdminStatCard";
import AdminChartLine from "../components/ui/ChartLine";
import AdminChartBar from "../components/ui/ChartBar";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Users"
          value="2,847"
          hint="+12% from last month"
          variant="users"
          icon="users"
        />
        <AdminStatCard
          title="Total Documents"
          value="14,562"
          hint="+8% from last month"
          variant="documents"
          icon="document"
        />
        <AdminStatCard
          title="Active Session"
          value="268"
          hint="Currently online"
          variant="sessions"
        />
        <AdminStatCard
          title="Total Teams"
          value="01"
          hint="+2% from last month"
          variant="teams"
          icon="teams"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col min-h-[340px] transition-colors duration-500">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 m-0 mb-1">
            Monthly Uploads
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm m-0 mb-4">
            Document upload trends over the year
          </p>
          <div className="flex-1 min-h-[280px]">
            <AdminChartLine />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col min-h-[340px] transition-colors duration-500">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 m-0 mb-1">
            Active Team
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm m-0 mb-4">
            Daily active users this week
          </p>
          <div className="flex-1 min-h-[280px]">
            <AdminChartBar />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
