import { useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';

export function useRememberMe() {
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const [rememberMeDaysLeft, setRememberMeDaysLeft] = useState(0);
    const [hasRememberMeToken, setHasRememberMeToken] = useState(false);

    // Restore session on mount
    useEffect(() => {
        try {
            const restored = authService.restoreFromRememberMe();
            
            if (restored) {
                const daysLeft = authService.getRememberMeDaysLeft();
                setRememberMeDaysLeft(daysLeft);
                setHasRememberMeToken(true);
            } else {
                setRememberMeDaysLeft(0);
                setHasRememberMeToken(false);
            }
        } catch (error) {
            console.error('Failed to restore remember me session:', error);
        } finally {
            setIsRestoringSession(false);
        }
    }, []);

    // Handle "Remember Me" checkbox change
    const handleRememberMeChange = useCallback((rememberMe) => {
        if (!rememberMe) {
            authService.clearRememberMe();
            setRememberMeDaysLeft(0);
            setHasRememberMeToken(false);
        }
        return rememberMe; 
    }, []);

    const clearRememberMe = useCallback(() => {
        authService.clearRememberMe();
        setRememberMeDaysLeft(0);
        setHasRememberMeToken(false);
    }, []);

    const refreshDaysLeft = useCallback(() => {
        const days = authService.getRememberMeDaysLeft();
        setRememberMeDaysLeft(days);
        setHasRememberMeToken(authService.isRememberMeValid());
    }, []);

    return {
        isRestoringSession,
        rememberMeDaysLeft,
        hasRememberMeToken,
        handleRememberMeChange,
        clearRememberMe,
        refreshDaysLeft,
    };
}