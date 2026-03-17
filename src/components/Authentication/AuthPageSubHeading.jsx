import React from "react";

const AuthPageSubHeading = ({ text, className = "" }) => {
  return (
    <p className={`text-black text-2xl mt-8 font-medium ${className}`}>
      {text}
    </p>
  );
};

export default AuthPageSubHeading;
