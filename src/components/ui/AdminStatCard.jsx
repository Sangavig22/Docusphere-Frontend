import React from "react";
import {
  User,
  FileText,
  Activity,
  Layers,
  Users,
  Users2Icon,
  UsersIcon,
} from "lucide-react";

const iconMap = {
  users: User,
  document: FileText,
  sessions: Activity,
  teams: UsersIcon,
};

const variantStyles = {
  users: "bg-[#eef2ff] text-[#000f97] border-[#e0e7ff] dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/50",
  documents: "bg-[#ecfdf5] text-[#047857] border-[#d1fae5] dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50",
  sessions: "bg-[#fef2f2] text-[#7c0a0a] border-[#fee2e2] dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50",
  teams: "bg-[#fefce8] text-[#a16207] border-[#fef9c3] dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
};

const AdminStatCard = ({ title, value, hint, variant = "users", icon }) => {
  const Icon = iconMap[icon] || Activity;

  return (
    <div
      className={`
        border rounded-2xl p-5 shadow-sm
        flex justify-between items-start
        w-full 
        /* --- Hover Effect Classes --- */
        transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:shadow-md cursor-pointer
        /* ---------------------------- */
        ${variantStyles[variant]}
      `}
    >
      {/* Text Content */}
      <div className="flex flex-col">
        <p className="text-[13px] font-bold opacity-80 uppercase tracking-tight">
          {title}
        </p>

        <h2 className="text-3xl font-extrabold mt-1">
          {value}
        </h2>

        <p className="text-[11px] font-semibold mt-2 opacity-70">
          {hint}
        </p>
      </div>

      {/* Icon */}
      <div className="opacity-30 mt-1">
        <Icon size={28} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default AdminStatCard;