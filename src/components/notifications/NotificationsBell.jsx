import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';


const NotificationsBell = ({ context }) => {
  const notifications = useNotifications(context);

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
