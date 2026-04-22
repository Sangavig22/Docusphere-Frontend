import { useState, useRef, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { LAYOUT_COLORS } from "../../config/layoutConfig";
import { TOPBAR_CONFIG } from "../../config/topbarConfig";
import { AUTH_CONFIG } from "../../config/authConfig";

function Topbar({ user, title, subtitle, type = "dashboard", notificationCount = 0 }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from storage or prop
  const token = authService.getToken();
  const fullName = sessionStorage.getItem('userFullName') ||
                   localStorage.getItem('rememberMeFullName') ||
                   user?.name;
  const userEmail = sessionStorage.getItem('userEmail') ||
                    localStorage.getItem('rememberMeEmail') ||
                    user?.email;

  // Get avatar color and config from config
  const avatarColor = LAYOUT_COLORS[type]?.avatarBg ?? "bg-blue-600";
  const topbarConfig = TOPBAR_CONFIG[type] ?? { defaultTitle: "Dashboard", defaultSubtitle: "", avatarFallback: "U" };
  const displayTitle = title ?? topbarConfig.defaultTitle;
  
  // Get first letter of user name or email
  const initial =
    fullName?.trim()?.charAt(0)?.toUpperCase() ??
    userEmail?.trim()?.charAt(0)?.toUpperCase() ??
    topbarConfig.avatarFallback;

  const description = subtitle ?? topbarConfig.defaultSubtitle;

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem('authUser');
    localStorage.removeItem('rememberMeFullName');
    localStorage.removeItem('rememberMeEmail');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('userEmail');
    navigate(AUTH_CONFIG.loginRoute);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4.5 shadow-sm">
      {/* Left Section */}
      <div>
        <h1 className="text-xl font-semibold">{displayTitle}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* User Avatar with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold transition-colors`}
          >
            {initial}
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{fullName || AUTH_CONFIG.fallbackUserName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
              >
                <LogOut size={16} />
                {AUTH_CONFIG.logoutText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;