import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PrimaryButton from "../components/Authentication/PrimaryButton";
import AuthPageLayout from "../components/Layout/AuthPageLayout";
import AuthPageHeading from "../components/Authentication/AuthPageHeading";
import authService from "../services/authService";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verifiedRef = useRef(false);

  const email =
    location.state?.email ||
    localStorage.getItem("verificationEmail") ||
    "";

  const [resendTimer, setResendTimer] = useState(0);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);


  const verifyToken = useCallback(
    async (token) => {
      try {
        const data = await authService.verifyEmail(token);

        //store the auth token, role
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        localStorage.setItem("userRole", data.role);

        toast.success("Email verified successfully!");

        setTimeout(() => {
          if (data.role && data.role.toUpperCase().includes("ADMIN")) {
            navigate("/dashboard-selector", { state: { token: data.token } });
          } else {
            navigate("/dashboard", { state: { token: data.token } });
          }
        }, 1000);
      } catch (error) {
        console.error("Verification error:", error);
        toast.error(error.message || "Failed to verify email. Please try again.");
        setIsVerifyingToken(false);
      // Reset verifiedRef on failure so user can retry
        verifiedRef.current = false;
      // Clear sessionStorage guard so user can retry without stale block
        sessionStorage.removeItem("emailVerificationAttempted");
      }
    },
    [navigate]
  );

//reads the token from the URL and verifies the user's email only once,preventing repeated API calls when the page reloads
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (
      token &&
      !verifiedRef.current &&
      !sessionStorage.getItem("emailVerificationAttempted")
    ) {
      verifiedRef.current = true;
      sessionStorage.setItem("emailVerificationAttempted", "true");
      setIsVerifyingToken(true);
      verifyToken(token);
    }
  }, [location.search, verifyToken]); 

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("No email address found. Please sign up again.");
      navigate("/signup");
      return;
    }

    setIsResendLoading(true);
    try {
      await authService.resendVerificationEmail(email);
      toast.success("Verification email sent again ! Check your inbox.");
      setResendTimer(60);
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend email. Please try again.");
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleChangeEmail = () => {
    localStorage.removeItem("verificationEmail");
     //Deletes the stored verification email
    sessionStorage.removeItem("emailVerificationAttempted");
    navigate("/signup");
  };

  const leftContent = (
    <>
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 mt-3">
        Almost There!
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-8">
        Just one more step—verify your email using the link we sent to start
        your journey with Docusphere.
      </p>
    </>
  );

  const rightContent = (
    <>
      <AuthPageHeading className="mb-14" text="Check your email" />
      <p className="text-gray-600 text-lg max-w-md text-left mb-4 -mt-2">
        To start using Docusphere we need you to confirm your account.
      </p>

      <div className="w-full max-w-md bg-gray-50 border border-gray-500 rounded-lg p-5 mb-6">
        <p className="text-gray-600 text-base mb-4">
          Please click the link we sent to the following email:
        </p>

        {/* Fix 10: Handle missing email gracefully in UI */}
        {email ? (
          <p className="text-gray-900 font-semibold text-lg break-all mb-4">
            {email}
          </p>
        ) : (
          <p className="text-red-500 text-base mb-4">
            No email found. Please{" "}
            <button
              onClick={handleChangeEmail}
              className="underline font-medium"
            >
              sign up again
            </button>
            .
          </p>
        )}

        <p className="text-gray-600 text-base">
          Not the right email?{" "}
          <button
            onClick={handleChangeEmail}
            className="font-medium text-base text-[#05152C] hover:text-blue-600 transition-all duration-300"
          >
            Change account
          </button>
        </p>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-3 justify-center">
        <PrimaryButton
          type="button"
          onClick={handleResendEmail}
          disabled={resendTimer > 0 || isResendLoading || !email}
          className={`!w-[250px] ${
            resendTimer > 0 || isResendLoading || !email
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isResendLoading
            ? "Sending..."
            : resendTimer > 0
            ? `Resend in ${resendTimer}s`
            : "Resend Email"}
        </PrimaryButton>

        <PrimaryButton
          type="button"
          onClick={() => window.open("https://gmail.com", "_blank")}
          className="!w-[250px]"
        >
          Open Email Inbox
        </PrimaryButton>
      </div>
    </>
  );

  if (isVerifyingToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#05152C]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-400 mx-auto mb-4"></div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Verifying your email...
          </h1>
          <p className="text-blue-200">
            Please wait while we confirm your account
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftBg="bg-[#05152C]"
      rightBg="bg-white"
      rightScroll={true}
    />
  );
};

export default EmailVerification;