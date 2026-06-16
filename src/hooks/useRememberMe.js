import { useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';

export function useRememberMe() {
    const [isRestoringSession, setIsRestoringSession] = useState(false);
    const [rememberMeDaysLeft, setRememberMeDaysLeft] = useState(0);
    const [hasRememberMeSession, setHasRememberMeSession] = useState(false);

    // Restore session from server on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const sessionValid = await authService.bootstrapSession();
                if (sessionValid) {
                    const daysLeft = authService.getRememberMeDaysLeft(authService.getVerifiedRefreshTokenExpiry());
                    setRememberMeDaysLeft(daysLeft);
                    setHasRememberMeSession(true);
                } else {
                    setHasRememberMeSession(false);
                }
            } catch (error) {
                console.error('Failed to restore remember me session:', error);
                setHasRememberMeSession(false);
            } finally {
                setIsRestoringSession(false);
            }
        };

        restoreSession();
    }, []);

    // Handle "Remember Me" checkbox change
    const handleRememberMeChange = useCallback((rememberMe) => {
        if (!rememberMe) {
            authService.clearRememberMe();
            setRememberMeDaysLeft(0);
            setHasRememberMeSession(false);
        }
        return rememberMe; 
    }, []);

    const clearRememberMe = useCallback(() => {
        authService.clearRememberMe();
        setRememberMeDaysLeft(0);
        setHasRememberMeSession(false);
    }, []);

    const refreshDaysLeft = useCallback(async () => {
        try {
            const sessionValid = await authService.bootstrapSession();
            if (sessionValid) {
                const daysLeft = authService.getRememberMeDaysLeft(authService.getVerifiedRefreshTokenExpiry());
                setRememberMeDaysLeft(daysLeft);
                setHasRememberMeSession(true);
            } else {
                setRememberMeDaysLeft(0);
                setHasRememberMeSession(false);
            }
        } catch (error) {
            console.error('Failed to refresh days left:', error);
            setHasRememberMeSession(false);
        }
    }, []);

    return {
        isRestoringSession,
        rememberMeDaysLeft,
        hasRememberMeSession,
        handleRememberMeChange,
        clearRememberMe,
        refreshDaysLeft,
    };
}