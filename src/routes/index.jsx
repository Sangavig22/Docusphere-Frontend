import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import authService from "../services/authService";
import { routes } from "./routes";
import { useTheme } from "../context/ThemeContext";

const LIGHT_ONLY_ROUTES = [
    "/",
    "/signin",
    "/signup",
    "/dashboard-selector",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
];

function RouteThemeController() {
    const { theme } = useTheme();
    const location = useLocation();

    useLayoutEffect(() => {
        const root = document.documentElement;
        const forceLight = LIGHT_ONLY_ROUTES.includes(location.pathname);
        const finalTheme = forceLight ? "light" : theme;

        if (finalTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        root.style.colorScheme = finalTheme;
        document.body.style.colorScheme = finalTheme;
    }, [location.pathname, theme]);

    return null;
}

function AuthGuard() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const location = useLocation();

    const initializeAuth = useCallback(async () => {
        try {
            const sessionValid = await authService.bootstrapSession();

            setIsAuthenticated(Boolean(sessionValid));
            setUserRole(sessionValid?.role || null);
        } catch (error) {
            console.error('Auth bootstrap failed:', error);

            setIsAuthenticated(false);
            setUserRole(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();

        const handleAuthChange = () => {
            setLoading(true);
            initializeAuth();
        };

        window.addEventListener('user-profile-updated', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);

        return () => {
            window.removeEventListener('user-profile-updated', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, [initializeAuth]);

    // WAIT until auth finishes
    if (loading) {
        return (
            <div className="p-6 text-center">
                Loading...
            </div>
        );
    }
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/signin')) {
        const targetPath = userRole?.toUpperCase() === 'ADMIN' 
            ? '/dashboard-selector' 
            : '/dashboard';

        return <Navigate to={targetPath} replace />;
    }

    return (
        <>
            <RouteThemeController />
            <Routes>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            route.protected ? (
                                <RequireAuth>
                                    {route.element}
                                </RequireAuth>
                            ) : (
                                route.element
                            )
                        }
                    />
                ))}
                <Route path="*" element={<div className="p-6 text-center">404 Not Found</div>} />
            </Routes>
        </>
    );
}

function RequireAuth({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const session = await authService.bootstrapSession();
                if (!mounted) return;
                setIsAuthenticated(Boolean(session));
            } catch (e) {
                if (!mounted) return;
                setIsAuthenticated(false);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!isAuthenticated) {
        const redirect = `${window.location.pathname}${window.location.search}`;
        return <Navigate to={`/signin?redirect=${encodeURIComponent(redirect)}`} replace />;
    }
    return children;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthGuard />
        </BrowserRouter>
    );
}
