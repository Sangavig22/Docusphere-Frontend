import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signUpFields } from "../../constants/authField";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import SecondaryButton from "../../components/Authentication/SecondaryButton";
import InputField from "../../components/Authentication/InputField";
import AuthPageLayout from "../../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../../components/Authentication/SocialAuthButtons";
import AuthPageHeading from "../../components/Authentication/AuthPageHeading";
import AuthPageLeftContent from "../../components/Authentication/AuthPageLeftContent";
import PasswordIndicator from "../../components/Authentication/PasswordIndicator";
import authService from "../../services/authService";
import useForm from "../../hooks/useForm";
import { validatePassword, getPasswordErrorMessage } from "../../utils/passwordValidator";

const SignUp = () => {
  const navigate = useNavigate();
  const { formData, handleChange, isLoading, executeAsync, resetForm } = useForm({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const inputFields = signUpFields.map((field) => {
    if (field.name === "password") {
      return {
        ...field,
        onFocus: () => setIsPasswordFocused(true),
        onBlur: () => setIsPasswordFocused(false),
      };
    }
    return field;
  });

    const handleSubmit = async (e) => {
      e.preventDefault()

      const { fullName, email, password, confirmPassword } = formData
      
      if (!fullName || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields!')
        return
      }

      const { isStrong, missing } = validatePassword(password);

      if (!isStrong) {
        toast.error(getPasswordErrorMessage(missing));
        return
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match!')
        return
      }

      await executeAsync(async () => {
        try {
          await authService.signUp({ fullName, email, password, confirmPassword });
          authService.saveVerificationEmail(email);
          toast.success("Account created! Please verify your email.");
          resetForm();
          navigate("/verify-email", { state: { email } });
        } catch (error) {
          console.error("Sign up error:", error);
          toast.error(error.message || "An error occurred. Please try again.");
        }
      });
  };

  const leftContent = (
    <>
      <AuthPageLeftContent
        heading="Welcome Back!"
        subheading="Already have an account? Sign in to continue your experience."
      />
      <SecondaryButton type="button" onClick={() => navigate('/signin')}>
        SIGN IN
      </SecondaryButton>
    </>
  );

  const rightContent = (
    <>
      <AuthPageHeading text="Sign Up" />

      <SocialAuthButtons
        onGoogleClick={() => console.log("Google login")}
        onAppleClick={() => console.log("Apple login")}
      />

      <p className="text-text text-xl mb-4">Or use your email for registration</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full text-center">
        {inputFields.map((field) => {
          const isPasswordField = field.name === "password";

          return (
            <div key={field.name} className="w-full flex flex-col items-center">
              <InputField
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                onFocus={field.onFocus}
                onBlur={field.onBlur}
                icon={field.icon}
                required={field.required}
                className={field.className}
              />

              {isPasswordField && (
                <PasswordIndicator
                  password={formData.password}
                  isFocused={isPasswordFocused}
                />
              )}
            </div>
          );
        })}

        <PrimaryButton type="submit" loading={isLoading}>SIGN UP</PrimaryButton>
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

export default SignUp;
                   

               

                
  

