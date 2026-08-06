import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import NotificationCenter from './NotificationCenter';

/**
 * Main notifications bell component.
 * Integrates hook logic with UI components.
 *
 * @param {string} [context='user'] - 'admin' or 'user'.
 *   Pass 'admin' when rendered inside the admin layout so only admin
 *   notifications are fetched and displayed. Defaults to 'user'.
 */
const NotificationsBell = ({ context = 'user' }) => {
  const notifications = useNotifications(context);
  const sound = useNotificationSound();

  const {
    notifications: notificationsList,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAsUnread,
    deleteNotification,
    loadMore,
    markAllAsRead,
  } = notifications;

  /**
   * Play sound when a new unread notification arrives
   */
  useEffect(() => {
    if (notificationsList.length > 0 && !notificationsList[0]?.read) {
      sound.playSoundWithDelay(300);
    }
  }, [notificationsList.length, notificationsList[0]?.read, sound]);

  /**
   * Toggle read/unread status of a notification
   */
  const handleToggleRead = (id) => {
    const notification = notificationsList.find((n) => n.id === id);
    if (notification?.read) {
      markAsUnread(id);
    } else {
      markAsRead(id);
    }
  };

  return (
    <NotificationCenter
      notifications={notificationsList}
      unreadCount={unreadCount}
      isLoading={isLoading}
      hasMore={hasMore}
      onRead={handleToggleRead}
      onDelete={deleteNotification}
      onLoadMore={loadMore}
      onMarkAllRead={markAllAsRead}
      context={context}
    />
  );
};

export default NotificationsBell;
