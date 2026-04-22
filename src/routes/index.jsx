import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import authService from "../services/authService";
import { routes } from "./routes";

function AuthGuard() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const initializeAuth = () => {
            // Restore Remember Me session
            authService.restoreFromRememberMe();

            const token = authService.getToken();
            const role = sessionStorage.getItem(authService.USER_ROLE) || localStorage.getItem(authService.REMEMBER_ME_ROLE);

            setIsAuthenticated(!!token);
            setUserRole(role);
            setIsLoading(false);
        };

        initializeAuth();
    }, []);
    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#05152C]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-400" />
            </div>
        );
    }
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/signIn')) {
        const targetPath = userRole?.toUpperCase() === 'ADMIN' 
            ? '/dashboard-selector' 
            : '/dashboard';

        return <Navigate to={targetPath} replace />;
    }

    return (
        <Routes>
            {routes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                />
            ))}
            <Route path="*" element={<div className="p-6 text-center">404 Not Found</div>} />
        </Routes>
    );
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthGuard />
        </BrowserRouter>
    );
}
