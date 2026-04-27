import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import AuthLink from "../../components/Authentication/AuthLink";
import InputField from "../../components/Authentication/InputField";
import PasswordIndicator from "../../components/Authentication/PasswordIndicator";
import AuthPageLayout from "../../components/Layout/AuthPageLayout";
import AuthPageHeading from "../../components/Authentication/AuthPageHeading";
import AuthPageSubHeading from "../../components/Authentication/AuthPageSubHeading";
import AuthPageLeftContent from "../../components/Authentication/AuthPageLeftContent";
import useForm from "../../hooks/useForm";
import authService from "../../services/authService";
import { validatePassword, getPasswordErrorMessage } from "../../utils/passwordValidator";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenVerifiedRef = useRef(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const { formData, handleChange, isLoading, executeAsync, resetForm } = useForm({
    password: "",
    confirmPassword: "",
  });

  // Extract and verify token from URL
  const verifyToken = useCallback(
    async (token) => {
      try {
        await authService.verifyPasswordResetToken(token);
        setTokenValid(true);
      } catch (error) {
        toast.error("Password reset link has expired. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 2000);
        tokenVerifiedRef.current = false;
        sessionStorage.removeItem("passwordResetAttempted");
      } finally {
        setIsVerifyingToken(false);
      }
    },
    [navigate]
  );

  // Read token from URL and verify only once
  useEffect(() => {
    setTokenValid(true);
    setIsVerifyingToken(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    const { isStrong, missing } = validatePassword(password);

    if (!isStrong) {
      toast.error(getPasswordErrorMessage(missing));
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    await executeAsync(async () => {
      try {
        await authService.resetPassword(token, password, confirmPassword);
        toast.success("Password reset successfully! Redirecting to login...");
        resetForm();
        setTimeout(() => navigate("/signin"), 1500);
      } catch (error) {
        toast.error(error.message || "Failed to reset password. Please try again.");
        throw error;
      }
    });
  };

  // Show loading while verifying token
  if (isVerifyingToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#05152C]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-400" />
      </div>
    );
  }

  // Show error if token invalid
  if (!tokenValid) {
    return null; // Already handling redirect in useEffect
  }

  const leftContent = (
    <AuthPageLeftContent
      heading="Create New Password"
      subheading="Enter a strong password to secure your account."
    />
  );

  const rightContent = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-3 w-full text-center border border-white/60 rounded-xl px-8 sm:px-12 py-6 bg-white/80 backdrop-blur-15xl shadow-10xl"
    >
      <AuthPageHeading text="Reset Password" />
      <AuthPageSubHeading text="Enter a new password." />

      <InputField
        type="password"
        name="password"
        placeholder="New Password"
        value={formData.password}
        onChange={handleChange}
        icon={Lock}
        required
        className="mt-9"
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
      />

      {isPasswordFocused && formData.password && (
        <div className="mt-4">
          <PasswordIndicator password={formData.password} />
        </div>
      )}

      <InputField
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={Lock}
        required
        className="mt-4"
      />

      <PrimaryButton type="submit" loading={isLoading}>
        RESET PASSWORD
      </PrimaryButton>

      <p className="text-[#05152C] text-lg mt-4 mb-12 font-medium">
        <AuthLink
          text="Back to login"
          onClick={() => navigate("/signin")}
        />
      </p>
    </form>
  );

  return (
    <AuthPageLayout leftContent={leftContent} rightContent={rightContent} />
  );
};

export default ResetPassword;
