import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const SocialAuthButtons = ({ onGoogleClick, onGitHubClick }) => {
  return (
    <div className="flex justify-center gap-6 mb-4">
      <button
        type="button"
        onClick={onGoogleClick}
        className="w-14 h-14 rounded-full border border-border flex items-center justify-center shadow-md hover:shadow-xl bg-card hover:bg-card transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <FcGoogle size={28} />
      </button>
      <button
        type="button"
        onClick={onGitHubClick}
        className="w-14 h-14 rounded-full border border-border flex items-center justify-center shadow-md hover:shadow-xl bg-card hover:bg-card transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <FaGithub size={28} className="text-text" />
      </button>
    </div>
  );
};

export default SocialAuthButtons;
