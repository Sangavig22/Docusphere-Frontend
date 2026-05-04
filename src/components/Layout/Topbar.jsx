import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { LAYOUT_COLORS } from "../../config/layoutConfig";
import { TOPBAR_CONFIG } from "../../config/topbarConfig";
import { AUTH_CONFIG } from "../../config/authConfig";
import { useUser } from "../../context/UserContext";

function Topbar({
  user: propUser,
  title,
  subtitle,
  type = "dashboard",
  notificationCount = 0,
  role = "user", 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Use context for user data
  const { user: contextUser } = useUser();

  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    const photo = contextUser.photo || authService.getProfilePicture();
    if (!photo) {
      setProfilePhoto("");
      return;
    }
    setProfilePhoto(`${photo}?t=${Date.now()}`);
  }, [contextUser.photo]);

  const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("rememberMeRole");
  const isAdmin = role === "admin" || userRole?.toUpperCase() === "ADMIN";


  const fullName = contextUser.name || propUser?.name ||
    sessionStorage.getItem("userFullName") ||
    localStorage.getItem("rememberMeFullName") || "";

  const userEmail = contextUser.email || propUser?.email ||
    sessionStorage.getItem("userEmail") ||
    localStorage.getItem("rememberMeEmail") || "";

  const topbarConfig =
    TOPBAR_CONFIG[type] ?? {
      defaultTitle: "Dashboard",
      defaultSubtitle: "",
      avatarFallback: "U",
    };

  const initial = fullName?.trim()?.charAt(0)?.toUpperCase() ||
                 userEmail?.trim()?.charAt(0)?.toUpperCase() ||
                 topbarConfig.avatarFallback;

  const displayTitle = title ?? topbarConfig.defaultTitle;
  const description = subtitle ?? topbarConfig.defaultSubtitle;

  const handleSignOut = () => {
    authService.signOut();
    navigate(AUTH_CONFIG.loginRoute);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const newPhoto = authService.getProfilePicture();
      if (!newPhoto) {
        setProfilePhoto("");
        return;
      }
      const separator = newPhoto.includes('?') ? '&' : '?';
      setProfilePhoto(`${newPhoto}${separator}t=${Date.now()}`);
    };

    window.addEventListener("user-profile-updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("user-profile-updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleImageError = () => {
    setProfilePhoto(""); 
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4.5 shadow-sm">
      {/* Left Section */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          {displayTitle}
        </h1>
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
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden border border-gray-300"
            style={{ background: 'linear-gradient(90deg, #114692 0%, #05152C 100%)' }}
          >
            {profilePhoto && (profilePhoto.startsWith('http') || profilePhoto.startsWith('data:')) ? (
              <img
                src={profilePhoto}
                alt="Profile"
                onError={handleImageError}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span className="text-lg font-bold">{initial}</span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {fullName || "User"}
                  {isAdmin && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;