// Authentication configuration
const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = envBackendUrl?.trim() || "http://localhost:8080/api";

export const AUTH_CONFIG = {
  loginRoute: "/signin",
  logoutText: "Sign Out",
  fallbackUserName: "User",
};
