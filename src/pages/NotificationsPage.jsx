import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  CheckCircle,
  Bell,
  Shield,
  User,
  ChevronDown,
  AlertTriangle,
  Loader,
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import NotificationItem from '../components/notifications/NotificationItem';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
} from '../services/notificationsService';
import './NotificationsPage.css';

/**
 * Detect if the current user is an admin.
 */
const getIsAdmin = () => {
  const role =
    sessionStorage.getItem('userRole') ||
    localStorage.getItem('rememberMeRole') ||
    '';
  return role.toUpperCase() === 'ADMIN';
};

/**
 * Full-page notifications view.
 *
 * - Regular users  → only their USER notifications, no audience switcher
 * - Admin users    → dropdown to choose between "User Notifications" and
 *                    "Admin Notifications"; each fetches from the correct endpoint
 */
const NotificationsPage = () => {
  const navigate = useNavigate();
  const isAdmin = getIsAdmin();

  // 'user' | 'admin'  — which audience is currently displayed
  const [audienceTab, setAudienceTab] = useState('user');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'
  const [selectedIds, setSelectedIds] = useState([]);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [justMarkedReadIds, setJustMarkedReadIds] = useState([]);

  // Reset session marked-read IDs when filter tab changes
  useEffect(() => {
    setJustMarkedReadIds([]);
  }, [filterType]);

  // ─── Data Loading ────────────────────────────────────────────────────────────

  const loadNotifications = useCallback(
    async (pageNum = 1, context = audienceTab) => {
      setIsLoading(true);
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
        console.error('Error loading notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [audienceTab]
  );

  // Reload whenever the selected audience changes
  useEffect(() => {
    setNotifications([]);
    setPage(1);
    setHasMore(false);
    setSelectedIds([]);
    setFilterType('all');
    loadNotifications(1, audienceTab);
  }, [audienceTab]); // eslint-disable-line

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleToggleRead = async (id, shouldMarkAsRead) => {
    try {
      if (shouldMarkAsRead) {
        await markNotificationAsRead(id, audienceTab);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setJustMarkedReadIds((prev) => [...prev, id]);
      } else {
        await markNotificationAsUnread(id, audienceTab);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
        setUnreadCount((prev) => prev + 1);
        setJustMarkedReadIds((prev) => prev.filter((x) => x !== id));
      }
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(audienceTab);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id, audienceTab);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedIds) {
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.read) await handleToggleRead(id, true);
    }
    setSelectedIds([]);
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications(audienceTab);
      setNotifications([]);
      setUnreadCount(0);
      setSelectedIds([]);
      setClearConfirm(false);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    await loadNotifications(page + 1, audienceTab);
  };

  // ─── Filtering ────────────────────────────────────────────────────────────────

  const filteredNotifications =
    filterType === 'unread'
      ? notifications.filter((n) => !n.read || justMarkedReadIds.includes(n.id))
      : notifications;

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ─── Audience Switcher Labels ─────────────────────────────────────────────────

  const audienceLabel =
    audienceTab === 'admin' ? 'Admin Notifications' : 'User Notifications';

  const audienceIcon =
    audienceTab === 'admin' ? (
      <Shield size={15} className="np-audience-icon admin" />
    ) : (
      <User size={15} className="np-audience-icon user" />
    );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Layout pageTitle="Notifications" pageSubtitle="View and manage all your notifications">
      <div className="np-container">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="np-header">
          <div className="np-header-left">
            <button className="np-back-btn" onClick={() => navigate(-1)} title="Go back">
              <ArrowLeft size={18} />
            </button>
            <div className="np-header-title">
              <Bell size={20} />
              <h2>Notifications</h2>
            </div>
          </div>

          <div className="np-header-right">
            {/* ── Audience Switcher (admin only) ─── */}
            {isAdmin && (
              <div className="np-audience-wrapper">
                <button
                  className="np-audience-trigger"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  {audienceIcon}
                  <span>{audienceLabel}</span>
                  <ChevronDown
                    size={14}
                    className={`np-chevron ${dropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="np-audience-dropdown" role="listbox">
                    <button
                      role="option"
                      aria-selected={audienceTab === 'user'}
                      className={`np-audience-option ${audienceTab === 'user' ? 'active' : ''}`}
                      onClick={() => {
                        setAudienceTab('user');
                        setDropdownOpen(false);
                      }}
                    >
                      <User size={14} />
                      User Notifications
                      {audienceTab === 'user' && (
                        <span className="np-option-check">✓</span>
                      )}
                    </button>
                    <button
                      role="option"
                      aria-selected={audienceTab === 'admin'}
                      className={`np-audience-option ${audienceTab === 'admin' ? 'active' : ''}`}
                      onClick={() => {
                        setAudienceTab('admin');
                        setDropdownOpen(false);
                      }}
                    >
                      <Shield size={14} />
                      Admin Notifications
                      {audienceTab === 'admin' && (
                        <span className="np-option-check">✓</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Mark All Read ─── */}
            {unreadCount > 0 && (
              <button className="np-mark-all-btn" onClick={handleMarkAllAsRead}>
                <CheckCircle size={15} />
                Mark all read
              </button>
            )}

            {/* ── Clear All (with confirmation) ─── */}
            {notifications.length > 0 && !clearConfirm && (
              <button
                className="np-clear-btn"
                onClick={() => setClearConfirm(true)}
                title={`Clear all ${audienceLabel.toLowerCase()}`}
              >
                <Trash2 size={15} />
                Clear All
              </button>
            )}
            {clearConfirm && (
              <div className="np-confirm-bar">
                <AlertTriangle size={15} className="np-warn-icon" />
                <span>Delete all {audienceLabel.toLowerCase()}?</span>
                <button className="np-confirm-yes" onClick={handleClearAll}>
                  Yes, clear
                </button>
                <button
                  className="np-confirm-no"
                  onClick={() => setClearConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────────────── */}
        <div className="np-stats-bar">
          <span className="np-stat">
            Total: <strong>{notifications.length}</strong>
          </span>
          <span className="np-stat">
            Unread: <strong>{unreadCount}</strong>
          </span>
          {isAdmin && (
            <span className={`np-audience-badge ${audienceTab}`}>
              {audienceTab === 'admin' ? (
                <>
                  <Shield size={12} /> Admin view
                </>
              ) : (
                <>
                  <User size={12} /> User view
                </>
              )}
            </span>
          )}
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────── */}
        <div className="np-filter-tabs">
          <button
            className={`np-filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`np-filter-tab ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* ── Bulk Actions ────────────────────────────────────────────── */}
        {selectedIds.length > 0 && (
          <div className="np-bulk-actions">
            <span className="np-selected-count">{selectedIds.length} selected</span>
            <button className="np-action-btn read" onClick={handleMarkSelectedAsRead}>
              <CheckCircle size={14} /> Mark as read
            </button>
            <button className="np-action-btn delete" onClick={handleDeleteSelected}>
              <Trash2 size={14} /> Delete
            </button>
            <button
              className="np-action-btn cancel"
              onClick={() => setSelectedIds([])}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Notifications List ───────────────────────────────────────── */}
        <div className="np-list-card">
          {isLoading && notifications.length === 0 ? (
            <div className="np-loading">
              <Loader size={24} className="np-spinner" />
              <p>Loading notifications…</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="np-empty">
              <Bell size={40} className="np-empty-icon" />
              <p>
                {filterType === 'unread'
                  ? 'No unread notifications'
                  : `No ${audienceLabel.toLowerCase()} yet`}
              </p>
            </div>
          ) : (
            <>
              {/* Select All row */}
              <div className="np-select-all-row">
                <input
                  type="checkbox"
                  id="np-select-all"
                  checked={
                    selectedIds.length === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <label htmlFor="np-select-all">Select All</label>
              </div>

              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="np-row">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => handleToggleSelect(notification.id)}
                  />
                  <div className="np-item-wrapper">
                    <NotificationItem
                      notification={notification}
                      onRead={(id, shouldMarkAsRead) => handleToggleRead(id, shouldMarkAsRead)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  </div>
                </div>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="np-load-more">
                  <button
                    className="np-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={14} className="np-spinner-sm" /> Loading…
                      </>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
