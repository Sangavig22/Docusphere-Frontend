import React from "react";
import {
  User,
  FileText,
  Activity,
  UsersIcon,
} from "lucide-react";

// Icon mapping for string-based icons
const iconMap = {
  users: User,
  documents: FileText,
  sessions: Activity,
  teams: UsersIcon,
};

// Admin variant styles (colorful)
const variantStyles = {
  users: "bg-[#eef2ff] text-[#000f97] border-[#e0e7ff]",
  documents: "bg-[#ecfdf5] text-[#047857] border-[#d1fae5]",
  sessions: "bg-[#fef2f2] text-[#7c0a0a] border-[#fee2e2]",
  teams: "bg-[#fefce8] text-[#a16207] border-[#fef9c3]",
};

// Icon background colors for admin variant
const iconBgStyles = {
  users: "bg-[#f8faff]",      // softer indigo white-tint
  documents: "bg-[#f7fdfa]",  // softer green white-tint
  sessions: "bg-[#fff7f7]",  // softer red white-tint
  teams: "bg-[#fffdf5]",     // softer yellow white-tint
};

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  variant = "dashboard",
  type = "users",
  growth = null,
}) {
  // Determine if icon is a React component or string
  const isIconString = typeof icon === "string";
  // For admin variant, use type to get icon; for dashboard variant, use icon prop
  const IconComponent = variant === "admin" 
    ? iconMap[type] || Activity 
    : (isIconString ? iconMap[icon] || Activity : null);

  // Base container styles - compact and consistent for both variants
  const baseStyles = "border rounded-xl p-4 shadow-sm w-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer";

  // Admin variant (colorful cards) - compact size
  if (variant === "admin") {
    return (
      <div className={`${baseStyles} ${variantStyles[type]} flex justify-between items-start`}>
        <div className="flex flex-col flex-1">
          <p className="text-[12px] font-bold opacity-80 uppercase tracking-tight">
            {title}
          </p>
          <h2 className="text-2xl font-extrabold mt-1">
            {value}
          </h2>
          <p className="text-[11px] font-semibold mt-1 opacity-70">
            {subtitle}
          </p>
        </div>
        {IconComponent && (
          <div className={`flex-shrink-0 ml-3 p-2 rounded-lg ${iconBgStyles[type]}`}>
            <IconComponent size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>
    );
  }

  // Dashboard variant (simple cards) - same compact size
  return (
    <div className={`${baseStyles} bg-card border-border flex items-center gap-4`}>
      {icon && (
        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          {isIconString ? (
            <IconComponent size={24} />
          ) : (
            icon
          )}
        </div>
      )}
      <div className="flex-1">
        <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">
          {title}
        </h4>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard;
