const AuthLink = ({
  text,
  onClick,
  underline = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-medium text-lg sm:text-xl text-[#05152C] hover:text-blue-600 transition-all duration-300 ${
        underline ? "underline" : ""
      } ${className}`}
    >
      {text}
    </button>
  );
};

export default AuthLink;
