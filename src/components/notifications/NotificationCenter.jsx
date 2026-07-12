import React, { useEffect, useRef, useState } from 'react';
import { Bell, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import './NotificationCenter.css';

/**
 * Notification center dropdown component
 * Shows paginated list of notifications
 */
const NotificationCenter = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  hasMore = false,
  onRead,
  onDelete,
  onLoadMore,
  onMarkAllRead,
  context = 'user',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  /**
   * Handle scroll for infinite load more
   */
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (nearBottom && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    };

    const content = contentRef.current;
    if (content && isOpen) {
      content.addEventListener('scroll', handleScroll);
      return () => {
        content.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, hasMore, isLoading, onLoadMore]);

  /**
   * Filter notifications based on current filter
   */
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  /**
   * Handle read/unread toggle
   */
  const handleToggleRead = (id, shouldMarkAsRead) => {
    if (shouldMarkAsRead && onRead) {
      onRead(id); // Mark as read
    } else if (!shouldMarkAsRead && onRead) {
      // For unread toggle - if there's a separate handler needed
      onRead(id);
    }
  };

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-center-wrapper" ref={dropdownRef}>
      {/* Header - Bell Button */}
      <button
        className={`notification-center-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        title={`${unreadCount} unread notifications`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-dropdown-header">
            <h3 className="notification-dropdown-title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="notification-mark-all-read-btn"
                onClick={() => onMarkAllRead?.()}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="notification-filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="notification-dropdown-content" ref={contentRef}>
            {filteredNotifications.length === 0 ? (
              <div className="notification-empty-state">
                <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => handleToggleRead(notification.id, true)}
                    onDelete={() => onDelete?.(notification.id)}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="notification-load-more-wrapper">
                    <button
                      className="notification-load-more-btn"
                      onClick={() => onLoadMore?.()}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader size={16} className="spinner" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {/* Loading Indicator at bottom */}
                {isLoading && !hasMore && (
                  <div className="notification-loading-state">
                    <Loader size={16} className="spinner" />
                    <span>Loading...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="notification-dropdown-footer">
            <Link
              to="/notifications"
              className="view-all-link"
              onClick={() => setIsOpen(false)}
            >
              View Full Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
