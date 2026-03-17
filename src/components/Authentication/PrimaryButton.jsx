
const PrimaryButton = ({ type = "button", children, className = "", ...props }) => {
  const base =
    "mt-6 w-full max-w-md h-14 rounded-2xl text-white font-semibold text-2xl bg-gradient-to-r from-[#114692] to-[#05152C] hover:from-[#175BBF] hover:to-[#0A264F] hover:shadow-lg hover:shadow-[#114692]/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1";

  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}; 

export default PrimaryButton;
