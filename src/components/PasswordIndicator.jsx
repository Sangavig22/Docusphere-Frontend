import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

const PasswordIndicator = ({ password = "", isFocused = false }) => {
  const requirements = useMemo(() => {
    return {
      minLength: {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      hasNumber: {
        label: "At least 1 number",
        met: /\d/.test(password),
      },
      hasLowerCase: {
        label: "At least 1 lowercase letter",
        met: /[a-z]/.test(password),
      },
      hasUpperCase: {
        label: "At least 1 uppercase letter",
        met: /[A-Z]/.test(password),
      },
      hasSpecialChar: {
        label: "At least 1 special character",
        met: /[@#$%!]/.test(password),
      },
    };
  }, [password]);

  const metCount = Object.values(requirements).filter((req) => req.met).length;
  const totalRequirements = Object.keys(requirements).length;
  const allRequirementsMet = metCount === totalRequirements;

  const getStrength = () => {
    const percentage = (metCount / totalRequirements) * 100;
    if (metCount === 0) return { level: "none", label: "", color: "#e5e7eb", percentage: 0 };
    if (percentage <= 40) return { level: "weak", label: "Weak", color: "#ef4444", percentage };
    if (percentage <= 80) return { level: "medium", label: "Medium", color: "#eab308", percentage };
    return { level: "strong", label: "Strong", color: "#22c55e", percentage };
  };

  const strength = getStrength();

  if (!isFocused && password.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mt-4">
      {/* Strength Bar */}
      {password.length > 0 && (
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${strength.percentage}%`,
                backgroundColor: allRequirementsMet ? "#22c55e" : strength.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Heading with Strength */}
      {password.length > 0 && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {allRequirementsMet ? (
            <span style={{ color: "#22c55e" }}>Strong password</span>
          ) : (
            <span style={{ color: strength.color }}>{strength.label} password</span>
          )}
          . Must contain:
        </h3>
      )}

      {/* Requirements List */}
      <div className="space-y-2">
        {Object.entries(requirements).map(([key, requirement]) => (
          <div
            key={key}
            className={`flex items-center gap-3 text-base transition-all duration-300 ${
              requirement.met ? "opacity-100" : "opacity-60"
            }`}
          >
            {/* Icon */}
            {requirement.met ? (
              <Check size={20} className="text-green-500 flex-shrink-0" strokeWidth={3} />
            ) : (
              <X size={20} className="text-gray-400 flex-shrink-0" strokeWidth={3} />
            )}

            {/* Label */}
            <span
              className={`font-medium transition-colors ${
                requirement.met ? "text-green-600" : "text-gray-600"
              }`}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordIndicator;
