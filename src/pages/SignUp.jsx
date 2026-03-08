import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import InputField from "../components/InputField";
import AuthPageLayout from "../components/Layout/AuthPageLayout";
import SocialAuthButtons from "../components/SocialAuthButtons";
import AuthPageHeading from "../components/AuthPageHeading";

const SignUp = () => {

 const navigate = useNavigate()
    const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
    })

    const handleSubmit = async (e) => {
      e.preventDefault()

      const { fullName, email, password, confirmPassword } = formData
      if (!fullName || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields!')
        return
      }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match!')
          return
        }
      

    }

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
          icon={Lock}
          required
        />

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
                   

               

                
  

