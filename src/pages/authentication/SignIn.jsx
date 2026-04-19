import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signInFields } from "../../constants/authField";
import PrimaryButton from "../components/Authentication/PrimaryButton";
import SecondaryButton from "../components/Authentication/SecondaryButton";
import AuthLink from "../../components/Authentication/AuthLink";
import InputField from "../components/Authentication/InputField";
import AuthPageLayout from "../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../components/Authentication/SocialAuthButtons";
import AuthPageHeading from "../components/Authentication/AuthPageHeading";
import AuthPageLeftContent from "../../components/Authentication/AuthPageLeftContent";
import authService from "../services/authService";
import { ROLES } from "../../constants/roleConstants";
import useForm from "../../hooks/useForm";
import { useRememberMe } from "../../hooks/useRememberMe";

const SignIn = () => {
  const navigate = useNavigate();
  const { isRestoringSession } = useRememberMe();
  const [rememberMe, setRememberMe] = useState(false);

  const { formData, handleChange, isLoading, executeAsync, resetForm } = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    await executeAsync(async () => {
      try {
        const data = await authService.signIn(email, password, rememberMe);

        toast.success("Sign in successful!");
        resetForm();

        // Role-based redirect
        setTimeout(() => {
          if (data.role?.toUpperCase() === ROLES.ADMIN) {
            navigate("/dashboard-selector");
          } else {
            console.log("Redirecting to dashboard (USER)");
            navigate("/dashboard");
          }
        }, 500);

      } catch (error) {
        console.error("Sign in error:", error);
        const errorMsg = error.message || "An error occurred. Please try again.";

        if (errorMsg.includes('not registered') || errorMsg.includes('Email not registered')) {
          toast.error(
            <span>
              Email not registered.{" "}
              <AuthLink
                text="Sign up here"
                onClick={() => navigate("/signup")}
                underline
                className="font-bold"
              />
            </span>
          );
        } else if (errorMsg.includes('incorrect') || errorMsg.includes('Invalid') || errorMsg.includes('password')) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(errorMsg);
        }
        throw error;
      }
    });
  };

  const leftContent = (
    <>
      <AuthPageLeftContent
        heading="Hey There!"
        subheading="Begin your amazing journey by creating an account with us today."
      />
      <SecondaryButton
        type="button"
        onClick={() => navigate('/signup')}
        disabled={isRestoringSession}
      >
        SIGN UP
      </SecondaryButton>
    </>
  );

  const rightContent = isRestoringSession ? (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Restoring your session...</p>
    </div>
  ) : (
    <>
      <AuthPageHeading text="Sign In" />

      <SocialAuthButtons
        onGoogleClick={() => console.log("Google login")}
        onAppleClick={() => console.log("Apple login")}
      />

      <p className="text-black text-xl mb-4">Or use your account</p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 w-full text-center"
      >
        {signInFields.map((field) => (
          <InputField
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={handleChange}
            icon={field.icon}
            required={field.required}
            className={field.className}
          />
        ))}

        <div className="w-full max-w-md text-left mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[#05152C]"
              style={{ accentColor: '#05152C' }}
            />
            <span className="font-medium text-lg sm:text-xl text-[#05152C]">
              Remember me
            </span>
          </label>
          <AuthLink
            text="Forgot password?"
            onClick={() => navigate("/forgot-password")}
          />
        </div>

        <PrimaryButton type="submit" loading={isLoading || isRestoringSession}>
          {isRestoringSession ? "Restoring session..." : "SIGN IN"}
        </PrimaryButton>
      </form>
    </>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
    />
  );
};

export default SignIn;