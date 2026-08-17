import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { request } from '../api/apiClient.js';
import authService from '../services/authService.js';

const DEFAULT_IDLE = 5 * 60 * 1000; // 5 minutes
const DEFAULT_WARNING = 2 * 60 * 1000; // 2 minutes before

export default function useIdleTimeout({ idleTimeout = DEFAULT_IDLE, warningBefore = DEFAULT_WARNING } = {}) {
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(warningBefore);

  const idleRef = useRef(null);
  const warnRef = useRef(null);
  const lastResetRef = useRef(Date.now());

  const clearTimers = useCallback(() => {
    if (idleRef.current) {
      clearTimeout(idleRef.current);
      idleRef.current = null;
    }
    if (warnRef.current) {
      clearTimeout(warnRef.current);
      warnRef.current = null;
    }
  }, []);

  const doLogout = useCallback(async (isManual = false) => {
    clearTimers();
    try {
      await authService.signOut();
    } catch (e) {
      console.error('signOut failed', e);
    }

    if (isManual === true) {
      toast.success('Signed out successfully.', {
        position: 'top-center',
        autoClose: 3000,
      });
      setTimeout(() => {
        window.location.href = '/signin';
      }, 800);
    } else {
      setTimeout(() => {
        window.location.href = '/signin?sessionExpired=true';
      }, 300);
    }
  }, [clearTimers]);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    lastResetRef.current = Date.now();

    // warning timer
    warnRef.current = setTimeout(() => {
      setShowWarning(true);
      // start remaining countdown
      const start = Date.now();
      const interval = setInterval(() => {
        const passed = Date.now() - start;
        setRemaining(Math.max(0, warningBefore - passed));
        if (passed >= warningBefore) {
          clearInterval(interval);
        }
      }, 1000);
    }, Math.max(0, idleTimeout - warningBefore));

    // final logout timer
    idleRef.current = setTimeout(() => {
      doLogout(false);
    }, idleTimeout);
  }, [clearTimers, idleTimeout, warningBefore, doLogout]);

  const stayLoggedIn = useCallback(async () => {
    try {
      // call refresh endpoint
      await request('/auth/refresh', { method: 'POST' });
      // re-bootstrap session info
      try {
        await authService.bootstrapSession();
      } catch (e) {
        // ignore
      }
      resetTimers();
    } catch (err) {
      console.error('refresh failed', err);
      // fallback to logout
      await doLogout(false);
    }
  }, [resetTimers, doLogout]);

  useEffect(() => {
    const events = ['load', 'mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart'];

    const handle = () => resetTimers();

    for (const ev of events) {
      window.addEventListener(ev, handle);
    }

    // start timers
    resetTimers();

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, handle);
      }
      clearTimers();
    };
  }, [resetTimers, clearTimers]);

  useEffect(() => {
    let cancelled = false;

    const checkSessionOnReturn = async () => {
      if (!authService.isAuthenticated()) {
        return;
      }

      try {
        const session = await authService.validateSession();

        if (cancelled) {
          return;
        }

        if (!session) {
          try {
            await authService.signOut();
          } catch (signOutError) {
            console.error('signOut after session check failed', signOutError);
          }

          window.location.href = '/signin?sessionExpired=true';
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        try {
          await authService.signOut();
        } catch (signOutError) {
          console.error('signOut after session check failed', signOutError);
        }

        window.location.href = '/signin?sessionExpired=true';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSessionOnReturn();
      }
    };

    const handleFocus = () => {
      checkSessionOnReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { showWarning, remaining, stayLoggedIn, logout: doLogout, resetTimers };
}
