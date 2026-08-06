import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ChevronLeft } from "lucide-react";
import Layout from "../components/Layout/Layout";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <Layout pageTitle="Access Denied" pageSubtitle="Insufficient permissions">
      <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6 animate-bounce">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-slate-455 max-w-md mb-8">
          You do not have the required permissions to view or edit this document. If you believe this is an error, please contact your administrator or team leader.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
          Go Back
        </button>
      </div>
    </Layout>
  );
}
