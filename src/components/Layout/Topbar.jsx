import { Bell } from "lucide-react";

function Topbar({ user, title = "Dashboard", subtitle }) {
  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ??
    user?.email?.trim()?.charAt(0)?.toUpperCase() ??
    "U";

  const description =
    subtitle ?? "Welcome back! Here's an overview of your documents.";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      {/* Left Section */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold">
          {initial}
        </div>
      </div>
    </div>
  );
}

export default Topbar;