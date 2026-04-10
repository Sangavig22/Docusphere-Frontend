import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import PrimaryButton from "../components/Authentication/PrimaryButton";
import SecondaryButton from "../components/Authentication/SecondaryButton";
import InputField from "../components/Authentication/InputField";
import AuthPageLayout from "../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../components/Authentication/SocialAuthButtons";
import AuthPageHeading from "../components/Authentication/AuthPageHeading";
import authService from "../services/authService";

const SignIn = () => {

 const navigate = useNavigate()
 const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    })
    
      const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault()

      const { email, password } = formData

      if (!email || !password) {
        toast.error("Please fill in all fields")
        return
      }
     setIsLoading(true);
    try {
      const data = await authService.signIn(email, password);

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.role) {
        localStorage.setItem("userRole", data.role);
      }

      toast.success("Sign in successful!");

      //Role-based redirect
      setTimeout(() => {
        if (data.role && data.role.toUpperCase().includes("ADMIN")) {
          navigate("/dashboard-selector");
        } else {
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
        <button
          onClick={() => navigate("/signup")}
          className="underline text-[#05152C] font-bold hover:text-blue-600 transition-all duration-300"
        >
          Sign up here
        </button>
      </span>
    );
  } else {
    toast.error(errorMsg);
  }
} finally {
  setIsLoading(false);
}
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

  const leftContent = (
    <>
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 mt-3">
        Hey There!
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-4">
        Begin your amazing journey by creating an account with us today.
      </p>
      <SecondaryButton type="button" onClick={() => navigate('/signup')}>
        SIGN UP
      </SecondaryButton>
    </>
  );

  const rightContent = (
    <>
      <AuthPageHeading text="Sign In" />

      <SocialAuthButtons
        onGoogleClick={() => console.log("Google login")}
        onAppleClick={() => console.log("Apple login")}
      />

      <p className="text-black text-xl mb-4">Or use your account</p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full text-center">
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
          icon={Lock}
          required
          className="mt-3"
        />

        <div className="w-full max-w-md text-center mt-2">
          <button
            type="button"
            onClick={() => navigate('/forgotPassword')}
            className="font-medium text-lg sm:text-xl text-[#05152C] hover:text-blue-600 transition-all duration-300"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton type="submit">SIGN IN</PrimaryButton>
      </form>
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
            
}

export default SignIn;