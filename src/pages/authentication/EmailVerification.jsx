import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import AuthLink from "../../components/Authentication/AuthLink";
import AuthPageLayout from "../../components/Layout/AuthPageLayout";
import AuthPageHeading from "../../components/Authentication/AuthPageHeading";
import AuthPageLeftContent from "../../components/Authentication/AuthPageLeftContent";
import { ROLES } from "../../constants/roleConstants";
import authService from "../../services/authService";
import { getEmailProvider, EMAIL_PROVIDER_URLS } from "../../utils/emailProvider";

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

        // Store auth data using centralized service
        authService.saveAuth(data);
        toast.success("Email verified successfully!");

        setTimeout(() => {
          if (data.role?.toUpperCase() === ROLES.ADMIN) {
            navigate("/dashboard-selector", { state: { token: data.token } });
          } else {
            navigate("/dashboard", { state: { token: data.token } });
          }
        }, 1000);
      } 
        catch (error) {
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
    sessionStorage.removeItem("emailVerificationAttempted");
    navigate("/signup");
  };

  const handleOpenEmail = () => {
    const provider = getEmailProvider(email);
    window.open(EMAIL_PROVIDER_URLS[provider], "_blank");
  };

  const leftContent = (
    <AuthPageLeftContent 
      heading="Almost done!"
      subheading="Just one more step verify your email using the link we sent to start your journey with Docusphere."
    />
  );

  const rightContent = (
    <>
      <AuthPageHeading className="mb-14" text="Check your email" />
      <p className="text-gray-500 text-lg max-w-md text-left mb-4 -mt-2">
        To start using Docusphere we need you to confirm your account.
      </p>

      <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
        <p className="text-gray-500 text-base mb-4">
          Please click the link we sent to the following email:
        </p>
        
        {email ? (
          <p className="text-gray-500 font-semibold text-lg break-all mb-4">
            {email}
          </p>
        ) : (
          <p className="text-red-500 text-base mb-4">
            No email found. Please{" "}
            <AuthLink
              text="sign up again"
              onClick={handleChangeEmail}
              underline
              className="font-medium"
            />
            .
          </p>
        )}

        <p className="text-gray-500 text-base">
          Not the right email?{" "}
          <AuthLink
            text="Change account"
            onClick={handleChangeEmail}
            className="text-base"
          />
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
          onClick={handleOpenEmail}
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
    />
  );
};

export default EmailVerification;