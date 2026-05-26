import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import AuthPageHeading from "../../components/Authentication/AuthPageHeading";
import AuthPageLayout from "../../components/Layout/AuthPageLayout";
import { ROLES } from "../../constants/roleConstants";

const DashboardSelector = () => {
  const navigate = useNavigate();
  // Check both sessionStorage and localStorage for user role
  const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");
  const isAdmin = userRole?.toUpperCase() === ROLES.ADMIN;

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!userRole) {
      navigate("/signin");
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    setIsChecking(false);
  }, [navigate, userRole, isAdmin]);

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
        Choose your dashboard
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-8">
         Select where you'd like to continue.
      </p>
    </>
  );

  const rightContent = (
    <>
      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <AuthPageHeading text="Select Dashboard" />

        <p className="text-gray-500 text-lg text-center mb-6">
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

        <p className="text-gray-500 text-sm mt-8">
          Your role will determine which dashboard is available for you.
        </p>
      </div>
    </>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
    />
  );
};

export default DashboardSelector;