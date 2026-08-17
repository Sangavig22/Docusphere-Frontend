import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signInFields } from "../../constants/authField";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import SecondaryButton from "../../components/Authentication/SecondaryButton";
import AuthLink from "../../components/Authentication/AuthLink";
import InputField from "../../components/Authentication/InputField";
import AuthPageLayout from "../../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../../components/Authentication/SocialAuthButtons";
import AuthPageHeading from "../../components/Authentication/AuthPageHeading";
import AuthPageLeftContent from "../../components/Authentication/AuthPageLeftContent";
import authService from "../../services/authService";
import { ROLES } from "../../constants/roleConstants";
import useForm from "../../hooks/useForm";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rememberMe, setRememberMe] = useState(false);
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const sessionExpired = new URLSearchParams(location.search).get("sessionExpired");

  const googleLogin = () => {
    authService.startGoogleAuth();
  };

  const githubLogin = () => {
    authService.startGitHubAuth();
  };

  const { formData, handleChange, isLoading, executeAsync, resetForm } = useForm({
    email: "",
    password: "",
  });

  const [lockedUntil, setLockedUntilState] = useState(() => {
    const saved = localStorage.getItem('lockedUntil');
    return saved ? parseInt(saved, 10) : null;
  }); // timestamp ms
  
  const setLockedUntil = (until) => {
    if (until) {
      localStorage.setItem('lockedUntil', until);
    } else {
      localStorage.removeItem('lockedUntil');
    }
    setLockedUntilState(until);
  };

  const [lockMessage, setLockMessage] = useState(() => {
    return localStorage.getItem('lockedUntil') ? 'Too many failed attempts.' : '';
  });
  const [countdown, setCountdown] = useState('');
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown('');
      return;
    }

    const update = () => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        setLockedUntil(null);
        setCountdown('');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}m ${secs}s`);
    };

    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPermanentlyLocked) {
      toast.error('Account is permanently locked. Please check your email and reset your password.');
      return;
    }

    if (lockedUntil && lockedUntil > Date.now()) {
      toast.error('Your account is locked. Please try again later.');
      return;
    }

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
        setLockMessage('');
        setLockedUntil(null);

        // Role-based redirect
        setTimeout(() => {
          if (redirectTo && redirectTo.startsWith("/")) {
            navigate(redirectTo);
          } else if (data.role?.toUpperCase() === ROLES.ADMIN) {
            navigate("/dashboard-selector");
          } else {
            console.log("Redirecting to dashboard (USER)");
            navigate("/dashboard");
          }
        }, 500);
      } catch (error) {
        console.error("Sign in error:", error);
        const errorMsg =
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "An error occurred. Please try again.";

        const normalizedError = String(errorMsg).toLowerCase();
        const rawAttempts =
          error?.data?.failedAttempts ??
          error?.data?.failed_attempts ??
          error?.data?.failed_login_attempts ??
          error?.data?.attempts ??
          error?.data?.count ??
          error?.data?.data?.failedAttempts ??
          error?.data?.data?.failed_login_attempts ??
          null;
        const attempts = Number(rawAttempts);
        const hasLockPayload =
          error?.status === 423 ||
          error?.data?.status === 423 ||
          error?.data?.code === "ACCOUNT_LOCKED" ||
          error?.data?.code === "USER_LOCKED" ||
          error?.data?.account_locked_until ||
          error?.data?.accountLockedUntil ||
          normalizedError.includes("locked") ||
          normalizedError.includes("too many failed") ||
          normalizedError.includes("too many attempts") ||
          normalizedError.includes("try again later") ||
          normalizedError.includes("temporarily locked");
        const shouldLock = hasLockPayload || (!Number.isNaN(attempts) && attempts >= 5);

        if (normalizedError.includes("permanently locked")) {
          setIsPermanentlyLocked(true);
          setLockedUntil(null); // Clear normal lock
          setLockMessage("Too many failed attempts. You must reset your password to unlock your account.");
          toast.error("🔒 Account Permanently Locked — check your email.");
        } else if (shouldLock) {
          const unlockAt = error?.data?.unlockAt || error?.data?.unlock_at || error?.data?.lockedUntil || null;
          let until = null;

          if (unlockAt) {
            const t = Date.parse(unlockAt);
            if (!isNaN(t)) until = t;
          }

          if (!until) {
            until = Date.now() + 15 * 60 * 1000;
          }

          setLockedUntil(until);
          setLockMessage("Too many failed attempts.");
          toast.error("🔒 Account Locked — too many failed attempts.");
        } else if (normalizedError.includes("not registered")) {
          toast.error(
            <span>
              Email not registered.{' '}
              <AuthLink
                text="Sign up here"
                onClick={() => navigate("/signup")}
                underline
                className="font-bold"
              />
            </span>
          );
        } else if (
          normalizedError.includes("incorrect") ||
          normalizedError.includes("invalid") ||
          normalizedError.includes("password")
        ) {
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
      >
        SIGN UP
      </SecondaryButton>
    </>
  );

  const rightContent = (
    <>
      <AuthPageHeading text="Sign In" />

      {sessionExpired === 'true' && !isPermanentlyLocked && !lockedUntil && (
        <div className="w-full max-w-md mx-auto mb-4 p-3 rounded-lg bg-red-100 text-red-800 text-center text-sm md:text-base font-medium">
          Your session has timed out. Please log in again.
        </div>
      )}

      {isPermanentlyLocked && (
        <div className="w-full max-w-md mx-auto mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-left">
          <p className="font-semibold text-red-700">🔒 Account Permanently Locked</p>
          <p className="text-sm text-red-700 mt-1">{lockMessage}</p>
          <p className="text-sm text-red-600 mt-2">Check your email for instructions to reset your password.</p>
        </div>
      )}

      {!isPermanentlyLocked && lockedUntil && (
        <div className="w-full max-w-md mx-auto mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-left">
          <p className="font-semibold text-red-700">🔒 Account Locked</p>
          <p className="text-sm text-red-700 mt-1">{lockMessage}</p>
          <p className="text-sm text-red-600 mt-2">Your account will unlock in {countdown || 'a few moments'}.</p>
        </div>
      )}

      <SocialAuthButtons
        onGoogleClick={googleLogin}
        onGitHubClick={githubLogin}
        disabled={Boolean(lockedUntil) || isPermanentlyLocked}
      />

      <p className="text-text text-xl mb-4">Or use your account</p>

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
            disabled={Boolean(lockedUntil) || isPermanentlyLocked}
          />
        ))}

        <div className="w-full max-w-md text-left mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--primary)]"
              style={{ accentColor: 'var(--primary)' }}
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

        <PrimaryButton type="submit" loading={isLoading} disabled={Boolean(lockedUntil) || isPermanentlyLocked}>
          {isPermanentlyLocked ? 'LOCKED PERMANENTLY' : lockedUntil ? `Locked (${countdown || '...'})` : 'SIGN IN'}
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