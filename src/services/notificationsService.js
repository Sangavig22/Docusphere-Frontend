import { request } from '../api/apiClient';

/**
 * Notifications API Service
 * Handles all REST API calls for notifications
 * Supports both USER and ADMIN contexts
 */

/**
 * Determine notification context based on current URL
 * @returns {string} - 'admin' or 'user'
 */
const getNotificationContext = () => {
  return window.location.pathname.startsWith('/admin') ? 'admin' : 'user';
};

/**
 * Get the appropriate endpoint prefix based on context
 * @returns {string} - '/admin/notifications' or '/notifications'
 */
const getEndpointPrefix = (context = null) => {
  const ctx = context || getNotificationContext();
  return ctx === 'admin' ? '/admin/notifications' : '/notifications';
};

/**
 * Get the appropriate WebSocket queue based on context
 * @returns {string} - '/queue/notifications-admin' or '/queue/notifications-user'
 */
export const getNotificationQueue = (context = null) => {
  const ctx = context || getNotificationContext();
  return ctx === 'admin' ? '/queue/notifications-admin' : '/queue/notifications-user';
};

/**
 * Fetch paginated notifications
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of notifications per page
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<{notifications: Array, total: number, unreadCount: number}>}
 */
export const fetchNotifications = async (page = 1, limit = 20, context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    // Spring Boot expects page (0-indexed) and pageSize
    const response = await request(`${prefix}?page=${page - 1}&pageSize=${limit}`);
    
    // Fetch unread count concurrently since the paginated response doesn't contain it
    const unreadCount = await getUnreadCount(context);
    
    const mappedNotifications = (response?.content || []).map(notif => ({
      ...notif,
      read: notif.status === 'READ',
      timestamp: notif.createdAt,
    }));
    
    return {
      notifications: mappedNotifications,
      total: response?.totalElements || 0,
      unreadCount: unreadCount,
      hasMore: response?.hasNext || false,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<Object>}
 */
export const markNotificationAsRead = async (notificationId, context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/${notificationId}/read`, { method: 'PUT' });
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark notification as unread
 * @param {string} notificationId - Notification ID
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<Object>}
 */
export const markNotificationAsUnread = async (notificationId, context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/${notificationId}/unread`, { method: 'PUT' });
    return response;
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<Object>}
 */
export const deleteNotification = async (notificationId, context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/${notificationId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<Object>}
 */
export const markAllNotificationsAsRead = async (context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/mark-all-read`, { method: 'PUT' });
    return response;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<number>}
 */
export const getUnreadCount = async (context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/unread-count`);
    // Backend returns a plain number (ResponseEntity<Long>)
    return typeof response === 'number' ? response : (response?.unreadCount || 0);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Delete multiple notifications
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @param {string} context - 'admin' or 'user' (auto-detected if not provided)
 * @returns {Promise<Object>}
 */
export const deleteMultipleNotifications = async (notificationIds, context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    const response = await request(`${prefix}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds }),
    });
    return response;
  } catch (error) {
    console.error('Error deleting multiple notifications:', error);
    throw error;
  }
};

/**
 * Clear ALL notifications for the current user (by audience)
 * @param {string} context - 'admin' or 'user'
 * @returns {Promise<void>}
 */
export const clearAllNotifications = async (context = null) => {
  try {
    const prefix = getEndpointPrefix(context);
    await request(`${prefix}/clear-all`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};
