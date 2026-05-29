import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import { forgotPasswordFields } from "../../constants/authField";
import PrimaryButton from "../../components/Authentication/PrimaryButton";
import AuthLink from "../../components/Authentication/AuthLink";
import InputField from "../../components/Authentication/InputField";
import AuthPageLayout from '../../components/Layout/AuthPageLayout';
import AuthPageHeading from '../../components/Authentication/AuthPageHeading';
import AuthPageSubHeading from '../../components/Authentication/AuthPageSubHeading';
import AuthPageLeftContent from '../../components/Authentication/AuthPageLeftContent';
import authService from '../../services/authService';
import useForm from '../../hooks/useForm';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { formData, handleChange, isLoading, executeAsync } = useForm({
    email: ""
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email } = formData;
    
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    await executeAsync(async () => {
      try {
        await authService.requestPasswordReset(email);
        setEmailSentTo(email);
        toast.success("Check your email for the password reset link!");
        setResetEmailSent(true);
      } catch (error) {
        toast.error(error.message || "Failed to send reset link. Please try again.");
        throw error;
      }
    });
  };

  const handleSendAnotherLink = async () => {
    if (!emailSentTo) return;

    await executeAsync(async () => {
      try {
        await authService.requestPasswordReset(emailSentTo);
        toast.success("Password reset link sent again to your email!");
      } catch (error) {
        toast.error(error.message || "Failed to send reset link. Please try again.");
        throw error;
      }
    });
  };

  if (resetEmailSent) {
    return (
      <AuthPageLayout
        leftContent={
          <AuthPageLeftContent
            heading="Check Your Email"
            subheading="We've sent a password reset link to your email address."
          />
        }
        rightContent={
          <div className="w-full max-w-md text-center">
               <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-text text-xl font-bold mb-2">Link Sent Successfully!</h3>
              <p className="text-text text-medium mb-6">
                Click the link in your email to reset your password. The link expires in 30 minutes.
              </p>
              </div>
              <PrimaryButton 
                type="button"
                onClick={handleSendAnotherLink}
                loading={isLoading}
                className="w-full mb-3"
              >
                Send Another Link
              </PrimaryButton>
              <p className="text-text text-lg mt-3 mb-4 font-medium">
                <AuthLink
                  text="Back to Sign In"
                  onClick={() => navigate('/signIn')}
                />
              </p>
            </div>
      
        }
      />
    );
  }

  const leftContent = (
    <AuthPageLeftContent
      heading="Can't remember your password?"
      subheading="It happens! Let's get you back into your account quickly"
    />
  );

  const rightContent = (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full text-center border border-border rounded-xl px-8 sm:px-12 py-6 bg-card/80 backdrop-blur-15xl shadow-10xl">
      <AuthPageHeading text="Forgot Password" />
      <AuthPageSubHeading text="Enter your email address." />

      {forgotPasswordFields.map((field) => (
        <InputField
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChange={handleChange}
          icon={field.icon}
          required={field.required}
          className="mt-9"
        />
      ))}
      <PrimaryButton type="submit" loading={isLoading}> SEND RESET LINK </PrimaryButton>
      <p className="text-text text-lg mt-3 mb-12 font-medium">
        <AuthLink
          text="Back to login"
          onClick={() => navigate('/signIn')}
        />
      </p>
    </form>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
    />
  );
}
export default ForgotPassword
