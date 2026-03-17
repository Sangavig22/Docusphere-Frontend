import React from "react";

const SecondaryButton = ({ type = "button", children, className = "", ...props }) => {
  const base =
    "inline-flex w-64 items-center justify-center mt-4 px-8 py-3 rounded-2xl text-[#05152C] font-semibold text-2xl uppercase bg-white border-none shadow-lg hover:shadow-xl hover:bg-slate-100 transition-all duration-300 transform hover:-translate-y-1";

  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default SecondaryButton;
