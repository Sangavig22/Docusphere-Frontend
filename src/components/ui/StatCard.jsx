import React from "react";
import {
  User,
  FileText,
  Activity,
  UsersIcon,
  Clock,
  Star,
  UploadCloud,
} from "lucide-react";

const iconMap = {
  users: User,
  documents: FileText,
  sessions: Activity,
  teams: UsersIcon,
  clock: Clock,
  starred: Star,
  upload: UploadCloud,
};

const variantStyles = {
  users:
    "bg-[#eef2ff] text-[#000f97] border-[#e0e7ff] dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/25",
  documents:
    "bg-[#ecfdf5] text-[#047857] border-[#d1fae5] dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/25",
  sessions:
    "bg-[#fef2f2] text-[#7c0a0a] border-[#fee2e2] dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/25",
  teams:
    "bg-[#fefce8] text-[#a16207] border-[#fef9c3] dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/25",
};

const iconBgStyles = {
  users: "bg-[#f8faff] dark:bg-indigo-500/15",
  documents: "bg-[#f7fdfa] dark:bg-emerald-500/15",
  sessions: "bg-[#fff7f7] dark:bg-rose-500/15",
  teams: "bg-[#fffdf5] dark:bg-amber-500/15",
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
  const isIconString = typeof icon === "string";
  const iconKey = isIconString ? icon : type;
  const IconComponent =
    variant === "admin"
      ? iconMap[type] || Activity
      : iconMap[iconKey] || (isIconString ? iconMap[icon] : null) || Activity;

  const baseStyles =
    "border rounded-xl p-4 shadow-sm w-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer";

  if (variant === "admin") {
    return (
      <div className={`${baseStyles} ${variantStyles[type]} flex items-start justify-between`}>
        <div className="flex flex-1 flex-col">
          <p className="text-[12px] font-bold uppercase tracking-tight opacity-80">{title}</p>
          <h2 className="mt-1 text-2xl font-extrabold">{value}</h2>
          <p className="mt-1 text-[11px] font-semibold opacity-70">{subtitle}</p>
        </div>
        {IconComponent && (
          <div className={`ml-3 flex-shrink-0 rounded-lg p-2 ${iconBgStyles[type]}`}>
            <IconComponent size={24} strokeWidth={2.5} className="inherit" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${baseStyles} flex items-center gap-4 border-border bg-card`}>
      {icon && (
        <div
          className={`icon-badge flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg`}
        >
          {isIconString || IconComponent ? (
            <IconComponent size={24} />
          ) : (
            icon
          )}
        </div>
      )}
      <div className="flex-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
        <p className="mt-1 text-2xl font-bold text-text">{value}</p>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard;
