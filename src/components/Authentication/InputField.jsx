import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  icon: Icon,
  required = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex items-center mt-3 w-full max-w-md bg-card/30 backdrop-blur-xl border border-border hover:border-blue-400/50 h-14 rounded-2xl overflow-hidden pl-4 sm:pl-6 gap-3 shadow-2xl hover:bg-card/40 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${className}`}>
      {Icon && <Icon size={20} />}
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        className="w-full 
          focus:outline-none 
          focus:border-transparent 
          bg-transparent 
          placeholder:text-muted 
          text-text 
          font-medium 
          text-lg
          "
        style={{
          // Chrome adds blue background on autofill - this overrides it to transparent
          WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
          // Keep text color aligned with the active theme when autofilled
          WebkitTextFillColor: 'var(--text) !important',
          transition: 'background-color 5000s ease-in-out 0s',
          backgroundColor: 'transparent !important'
        }}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text hover:text-muted transition-colors"
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      )}
    </div>
  );
};

export default InputField;
