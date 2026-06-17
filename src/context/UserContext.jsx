import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const UserContext = createContext();

//store user data globally and provide functions to update it
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    photo: "",
  });

  const refreshUser = useCallback(() => {
    const name = authService.getUserFullName();
    const email = sessionStorage.getItem(authService.USER_EMAIL) || "";
    const photo = authService.getProfilePicture() || "";
    setUser({ name, email, photo });
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen for profile updates from other tabs or events
    const handleProfileUpdate = () => {
      refreshUser();
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
    };
  }, [refreshUser]);

  const updateUser = useCallback((updates = {}) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearUser = useCallback(() => {
    setUser({ name: "", email: "", photo: "" });
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
