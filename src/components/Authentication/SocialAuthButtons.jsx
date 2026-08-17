import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const SocialAuthButtons = ({ onGoogleClick, onGitHubClick, disabled = false }) => {
  const buttonClassName = disabled
    ? "w-14 h-14 rounded-full border border-border flex items-center justify-center shadow-md bg-card opacity-50 cursor-not-allowed pointer-events-none"
    : "w-14 h-14 rounded-full border border-border flex items-center justify-center shadow-md hover:shadow-xl bg-card hover:bg-card transition-all duration-300 ease-in-out transform hover:-translate-y-1";

  return (
    <div className="flex justify-center gap-6 mb-4">
      <button
        type="button"
        onClick={!disabled ? onGoogleClick : undefined}
        disabled={disabled}
        className={buttonClassName}
      >
        <FcGoogle size={28} />
      </button>
      <button
        type="button"
        onClick={!disabled ? onGitHubClick : undefined}
        disabled={disabled}
        className={buttonClassName}
      >
        <FaGithub size={28} className="text-text" />
      </button>
    </div>
  );
};

export default SocialAuthButtons;
