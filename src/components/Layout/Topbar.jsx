import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Shield, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { LAYOUT_COLORS } from "../../config/layoutConfig";
import { TOPBAR_CONFIG } from "../../config/topbarConfig";
import { AUTH_CONFIG } from "../../config/authConfig";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";

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

  const { theme, toggleTheme } = useTheme();

  // Use context for user data
  const { user: contextUser } = useUser();

  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
  const photo =
    contextUser?.profilePictureUrl ||
    contextUser?.photo ||
    contextUser?.picture ||
    authService.getProfilePicture();

  if (!photo) {
    setProfilePhoto("");
    return;
  }

  setProfilePhoto(photo);
}, [
  contextUser?.profilePictureUrl,
  contextUser?.photo,
  contextUser?.picture,
]);

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

  const handleSignOut = async () => {
    await authService.signOut();
    navigate(AUTH_CONFIG.loginRoute);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const newPhoto = authService.getProfilePicture();
      if (!newPhoto) {
        setProfilePhoto("");
        return;
      }
      if (newPhoto.startsWith('http://') || newPhoto.startsWith('https://')) {
        const separator = newPhoto.includes('?') ? '&' : '?';
        setProfilePhoto(`${newPhoto}${separator}t=${Date.now()}`);
        return;
      }

      setProfilePhoto(newPhoto);
    };

    window.addEventListener("user-profile-updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("user-profile-updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleImageError = () => {
    setProfilePhoto(""); 
  };

  return (
    <div className="flex items-center justify-between bg-card px-6 py-4.5 shadow-sm">
      {/* Left Section */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          {displayTitle}
        </h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-[var(--bg)] text-[var(--muted)]"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
            onClick={() => setShowMenu((current) => !current)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden border border-gray-200"
            style={{ background: 'linear-gradient(90deg, #114692 0%, #05152C 100%)' }}
          >
            {profilePhoto ? (
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
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
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
                className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2 font-semibold transition-colors"
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