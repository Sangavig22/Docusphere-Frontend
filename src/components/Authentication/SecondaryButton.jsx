import React from "react";

const SecondaryButton = ({ type = "button", children, className = "", ...props }) => {
  const base =
    "inline-flex w-64 items-center justify-center mt-4 px-8 py-3 rounded-2xl text-text font-semibold text-2xl bg-card border-none shadow-lg hover:shadow-xl hover:bg-card transition-all duration-300 transform hover:-translate-y-1";

  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default SecondaryButton;
