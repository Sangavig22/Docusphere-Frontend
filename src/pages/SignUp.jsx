import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import PrimaryButton from "../components/Authentication/PrimaryButton";
import SecondaryButton from "../components/Authentication/SecondaryButton";
import InputField from "../components/Authentication/InputField";
import AuthPageLayout from "../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../components/Authentication/SocialAuthButtons";
import AuthPageHeading from "../components/Authentication/AuthPageHeading";
import PasswordIndicator from "../components/Authentication/PasswordIndicator";
import authService from "../services/authService";
const SignUp = () => {
 const navigate = useNavigate()
    const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
    })

    const [isPasswordFocused, setIsPasswordFocused] = React.useState(false)
     const [isLoading, setIsLoading] = useState(false)

    // Check if password meets all requirements
    const isPasswordStrong = React.useMemo(() => {
      const hasMinLength = formData.password.length >= 8;
      const hasNumber = /\d/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasSpecialChar = /[@#$%!]/.test(formData.password);
      
      return hasMinLength && hasNumber && hasLowerCase && hasUpperCase && hasSpecialChar;
    }, [formData.password])

    const handleSubmit = async (e) => {
      e.preventDefault()

      const { fullName, email, password, confirmPassword } = formData
      
      if (!fullName || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields!')
        return
      }

      if (!isPasswordStrong) {
        const missing = [];
        if (password.length < 8) missing.push("8+ characters");
        if (!/\d/.test(password)) missing.push("1 number");
        if (!/[a-z]/.test(password)) missing.push("1 lowercase letter");
        if (!/[A-Z]/.test(password)) missing.push("1 uppercase letter");
        if (!/[@#$%!]/.test(password)) missing.push("1 special character");
        
        toast.error(`Password needs: ${missing.join(", ")}`);
        return
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match!')
        return
      }

      setIsLoading(true);
       try {
      await authService.signUp({ fullName, email, password, confirmPassword });
      localStorage.setItem("verificationEmail", email);
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email", { state: { email } });
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

  const leftContent = (
    <>
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 mt-3">
        Welcome Back!
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-4">
        Already have an account? Sign in to continue your experience.
      </p>
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

      <p className="text-black text-xl mb-4">Or use your email for registration</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full text-center">
        <InputField
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
          required
          className="mt-4"
        />

        <InputField
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          required
        />

        <InputField
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          icon={Lock}
          required
        />

        <PasswordIndicator password={formData.password} isFocused={isPasswordFocused} />

        <InputField
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          required
        />

        <PrimaryButton type="submit">SIGN UP</PrimaryButton>
      </form>
    </>
  );

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

export default SignUp;
                   

               

                
  

