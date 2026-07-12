import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeSocket } from '../config/socketConfig';
import {
  fetchNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  markAllNotificationsAsRead,
  getNotificationQueue,
} from '../services/notificationsService';
import authService from '../services/authService';

/**
 * Determine notification context based on current URL pathname
 * @param {string} [pathname] - URL pathname (defaults to window.location.pathname)
 * @returns {string} - 'admin' or 'user'
 */
const getContextFromPathname = (pathname = window.location.pathname) => {
  return pathname.startsWith('/admin') ? 'admin' : 'user';
};

/**
 * Main hook for managing notifications.
 * Establishes a STOMP/WebSocket connection and manages notification state.
 *
 * AUDIENCE SEPARATION GUARANTEE:
 * - Admin pages pass explicitContext='admin' → calls /api/admin/notifications, subscribes to /queue/notifications-admin
 * - User pages pass explicitContext='user' (or nothing) → calls /api/notifications, subscribes to /queue/notifications-user
 * - Admin notifications NEVER appear in the user bell and vice versa.
 *
 * @param {string} [explicitContext] - 'admin' or 'user'. Pass this explicitly from the component
 *   that knows its context (e.g. NotificationsBell receives it from Topbar's `type` prop).
 *   If omitted, context is derived from window.location.pathname (safe for page-level components).
 */
export const useNotifications = (explicitContext) => {
  const socketRef = useRef(null);
  const subscriptionRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Resolve context: explicit prop wins, then URL-based detection
  const context = explicitContext || getContextFromPathname();

  /**
   * Initialize STOMP WebSocket connection and subscribe to the
   * correct audience-specific notification queue.
   */
  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      const token = authService.getToken();
      if (!token) {
        console.warn('No auth token available for socket connection');
        return;
      }

      const stompClient = initializeSocket(token);
      const headers = { Authorization: `Bearer ${token}` };

      stompClient.connect(
        headers,
        () => {
          console.log(`✓ STOMP Connected [context: ${context}]`);
          setIsConnected(true);

          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
          }

          // Subscribe to the correct audience queue (user or admin)
          const queue = getNotificationQueue(context);
          console.log(`📡 Subscribing to notification queue: ${queue}`);

          const sub = stompClient.subscribe(queue, (message) => {
            try {
              const wsNotification = JSON.parse(message.body);
              console.log(`New ${context} notification received via WS:`, wsNotification);

              const notification = {
                ...wsNotification,
                read: !wsNotification.unread,
                timestamp: wsNotification.createdAt,
              };

              setNotifications((prev) => {
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
              });
              setUnreadCount((prev) => prev + 1);
            } catch (err) {
              console.error('Error parsing WS message:', err);
            }
          });

          subscriptionRef.current = sub;
        },
        (err) => {
          console.error('✗ STOMP connection error:', err);
          setIsConnected(false);
        }
      );

      socketRef.current = stompClient;
    } catch (err) {
      console.error('Failed to initialize STOMP socket:', err);
      setError('Failed to connect to notifications');
    }
  }, [context]);

  /**
   * Fetch paginated notifications from the correct audience endpoint.
   */
  const loadNotifications = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(pageNum, 20, context);
      if (pageNum === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error(`Error loading ${context} notifications:`, err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  /**
   * Mark a single notification as read.
   */
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, context);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification');
    }
  }, [context]);

  /**
   * Mark a single notification as unread.
   */
  const handleMarkAsUnread = useCallback(async (notificationId) => {
    try {
      await markNotificationAsUnread(notificationId, context);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      setError('Failed to update notification');
    }
  }, [context]);

  /**
   * Delete a notification.
   */
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId, context);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  }, [context]);

  /**
   * Load the next page of notifications.
   */
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadNotifications(page + 1);
  }, [page, hasMore, isLoading, loadNotifications]);

  /**
   * Mark all notifications as read for the current audience.
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead(context);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  }, [context]);

  /**
   * Main effect: runs on mount and whenever context changes.
   * Resets state, disconnects old socket, and connects to the correct queue.
   */
  useEffect(() => {
    // Reset all state for clean context switch
    setNotifications([]);
    setUnreadCount(0);
    setPage(1);
    setHasMore(false);

    // Tear down any existing socket/subscription before reconnecting
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    initSocket();
    loadNotifications(1);

    // Poll every 30 s so notifications appear even when WebSocket push is missed
    const pollInterval = setInterval(() => {
      loadNotifications(1);
    }, 30000);

    const handleNotificationsUpdated = () => loadNotifications(1);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initSocket, loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isConnected,
    context,
    markAsRead: handleMarkAsRead,
    markAsUnread: handleMarkAsUnread,
    deleteNotification: handleDeleteNotification,
    loadMore: handleLoadMore,
    markAllAsRead: handleMarkAllAsRead,
    refetch: () => loadNotifications(1),
  };
};
