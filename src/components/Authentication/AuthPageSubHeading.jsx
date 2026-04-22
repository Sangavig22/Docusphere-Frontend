import React from "react";

const AuthPageSubHeading = ({ text, className = "" }) => {
  return (
    <p className={`text-black text-2xl mt-2 font-medium ${className}`}>
      {text}
    </p>
  );
};

export default AuthPageSubHeading;
