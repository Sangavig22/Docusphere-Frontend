import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import DocuSphere from "../assets/DocuSphere.png";
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';
import AuthPageLayout from '../components/Layout/AuthPageLayout';
import AuthPageHeading from '../components/AuthPageHeading';
import AuthPageSubHeading from '../components/AuthPageSubHeading';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }
    toast.success("OTP sent your email");
     setTimeout(() => navigate('/ResetPassword'), 1000)
  };

  const leftContent = (
    <img
      src={DocuSphere}
      alt="Illustration"
      loading="lazy"
      className="hidden md:block absolute inset-0 w-full h-full object-cover"
    />
  );

  const rightContent = (
    <form onSubmit={handleSubmit} className="w-full max-w-md text-center border border-white/60 rounded-xl px-8 sm:px-12 py-6 bg-white/80 backdrop-blur-15xl shadow-10xl">
      <AuthPageHeading text="Forgot Password" />
      <AuthPageSubHeading text="Enter your email address." />

      <InputField
        type="email"
        name="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        required
        className="mt-9"
      />
      <PrimaryButton type="submit"> SEND OTP CODE </PrimaryButton>
      <p className="text-[#05152C] text-lg mt-4 mb-12 font-medium">
          <button
            type="button"
            onClick={() => navigate('/SignIn')}
            className="font-medium text-lg sm:text-xl text-[#05152C] hover:text-blue-600 transition-all duration-300"
          >
            Back to login
          </button>
      </p>
    </form>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftBg="bg-[#0f1f3d]"
      rightBg="bg-white"
      isFixed={true}
      rightScroll={true}
    />
  );
}
export default ForgotPassword

