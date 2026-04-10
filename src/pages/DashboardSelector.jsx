import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/Authentication/PrimaryButton";
import AuthPageHeading from "../components/Authentication/AuthPageHeading";
import AuthPageLayout from "../components/Layout/AuthPageLayout";

const DashboardSelector = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole && userRole.toUpperCase().includes("ADMIN");

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Redirect non-admins/user immediately
    if (!userRole) {
      navigate("/signin");
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    // Fix 3: Only show page if confirmed admin
    setIsChecking(false);
  }, [navigate, userRole, isAdmin]);
  
// Show nothing while checking role (prevents button flash)
  if (isChecking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#05152C]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-400" />
      </div>
    );
  }

  const leftContent = (
    <>
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 mt-3">
        Welcome to Docusphere!
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-8">
        Choose your dashboard to continue your journey.
      </p>
    </>
  );

  const rightContent = (
    <>
      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <AuthPageHeading text="Select Dashboard" />

        <p className="text-gray-600 text-lg text-center mb-6">
          Choose where you'd like to go:
        </p>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <PrimaryButton
            type="button"
            onClick={() => navigate("/dashboard")}
            className="!h-14 text-lg"
          >
            User Dashboard
          </PrimaryButton>

          {/* Fix 5: Only show admin button for admins */}
          {isAdmin && (
            <PrimaryButton
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="!h-14 text-lg bg-orange-600 hover:bg-orange-700"
            >
              Admin Dashboard
            </PrimaryButton>
          )}
        </div>

        <p className="text-gray-400 text-sm mt-8">
          Your role will determine which dashboard is available for you.
        </p>
      </div>
    </>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftBg="bg-[#05152C]"
      rightBg="bg-white"
    />
  );
};

export default DashboardSelector;