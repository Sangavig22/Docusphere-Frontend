import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const SocialAuthButtons = ({ onGoogleClick, onAppleClick }) => {
  return (
    <div className="flex justify-center gap-6 mb-4">
      <button
        type="button"
        onClick={onGoogleClick}
        className="w-14 h-14 rounded-full border border-[#114692]  flex items-center justify-center shadow-md hover:shadow-xl bg-white hover:bg-white/90 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <FcGoogle size={28} />
      </button>
      <button
        type="button"
        onClick={onAppleClick}
        className="w-14 h-14 rounded-full border border-[#114692]  flex items-center justify-center shadow-md hover:shadow-xl bg-white hover:bg-white/90 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <FaApple size={28} className="text-black" />
      </button>
    </div>
  );
};

export default SocialAuthButtons;
