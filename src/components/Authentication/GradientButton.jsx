import React from "react";

const GradientButton = ({ type = "button", children, className = "", variant = "dark", ...props }) => {
  const darkVariant =
    "px-2 sm:px-4 md:px-6 py-2 sm:py-3 max-w-md h-12 sm:h-14 rounded-2xl text-white font-semibold text-sm sm:text-lg md:text-2xl bg-gradient-to-r from-[#114692] to-[#05152C] hover:from-[#175BBF] hover:to-[#0A264F] hover:shadow-lg hover:shadow-[#114692]/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center mx-auto block";

  const lightVariant =
    "px-2 sm:px-4 md:px-6 py-2 sm:py-3 max-w-md h-12 sm:h-14 rounded-2xl text-text mt-7 font-semibold text-sm sm:text-lg md:text-2xl bg-card border-2 border-border hover:border-blue-400 hover:bg-card transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center mx-auto block";

  const base = variant === "light" ? lightVariant : darkVariant;

  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default GradientButton;
