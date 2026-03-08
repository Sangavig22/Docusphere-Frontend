import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex items-center mt-3 w-full max-w-md bg-white/30 backdrop-blur-xl border border-gray-200/30 hover:border-blue-400/50 h-14 rounded-2xl overflow-hidden pl-4 sm:pl-6 gap-3 shadow-2xl hover:bg-white/40 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${className}`}>
      {Icon && <Icon size={20} />}
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full 
          focus:outline-none 
          focus:border-transparent 
          bg-transparent 
          placeholder-black 
          text-black 
          font-medium 
          text-lg
          "
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

export default InputField;
