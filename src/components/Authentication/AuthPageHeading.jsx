import React from "react";

const AuthPageHeading = ({ text }) => {
  return (
    <h1 className="text-3xl md:text-5xl font-bold mb-4 py-1 text-black whitespace-nowrap">
      {text}
    </h1>
  );
};

export default AuthPageHeading;
