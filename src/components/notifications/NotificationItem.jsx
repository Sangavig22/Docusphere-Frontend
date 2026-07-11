import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Clock,
  Check,
  Circle
} from 'lucide-react';
import { toast } from 'react-toastify';
import './NotificationItem.css';
import { teamsApi } from '../../services/teamsApi.js';

/**
 * Individual notification item component
 */
const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onNavigate,
}) => {
  if (!notification) return null;

  const {
    id,
    type = 'info',
    title = 'Notification',
    message = '',
    timestamp,
    read = false,
    metadata,
    actionUrl,
  } = notification;

  const getInitialInvitationStatus = () => {
    try {
      if (metadata) {
        const parsed = JSON.parse(metadata);
        return parsed.status || null;
      }
    } catch (e) {
      console.error('Error parsing notification metadata:', e);
    }
    return null;
  };

  const [invitationStatus, setInvitationStatus] = useState(getInitialInvitationStatus());
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  /**
   * Get icon based on notification type
   */
  const getIconComponent = () => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="notification-icon success" />;
      case 'error':
      case 'warning':
        return <AlertCircle className="notification-icon error" />;
      case 'info':
      default:
        return <Info className="notification-icon info" />;
    }
  };

  /**
   * Format relative timestamp
   */
  const getRelativeTime = () => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notifTime.toLocaleDateString();
  };

  /**
   * Handle read/unread toggle or navigation
   */
  const handleItemClick = () => {
    if (onRead && !read) {
      onRead(id, true);
    }
    
    // Prevent navigation to specific team for pending team invitations, direct to all teams page instead
    const isTeamInvitation = type === 'TEAM_INVITATION';
    const isPendingInvitation = isTeamInvitation && !invitationStatus;

    if (isPendingInvitation) {
      onNavigate?.();
      navigate('/team');
    } else if (actionUrl) {
      onNavigate?.();
      // Ensure we navigate to /team/:teamId instead of /teams/:teamId to match frontend routing
      const correctedUrl = actionUrl.startsWith('/teams/') 
        ? actionUrl.replace('/teams/', '/team/') 
        : actionUrl === '/teams' 
          ? '/team' 
          : actionUrl;
      navigate(correctedUrl);
    } else {
      // If there's no URL, just toggle read status (if it was already read)
      if (onRead && read) {
        onRead(id, false);
      }
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (!metadata) return;
    try {
      setIsProcessing(true);
      const parsedMetadata = JSON.parse(metadata);
      if (parsedMetadata.invitationId) {
        await teamsApi.acceptInvitation(parsedMetadata.invitationId);
        setInvitationStatus('joined');
        toast.success('Successfully joined the team!');
        window.dispatchEvent(new Event("teamsUpdated"));
        if (onRead && !read) onRead(id, true);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setInvitationStatus('joined');
        toast.info('You have already joined this team.');
        window.dispatchEvent(new Event("teamsUpdated"));
        if (onRead && !read) onRead(id, true);
      } else {
        console.error('Failed to join team:', error);
        toast.error('Failed to join team.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (e) => {
    e.stopPropagation();
    if (!metadata) return;
    try {
      setIsProcessing(true);
      const parsedMetadata = JSON.parse(metadata);
      if (parsedMetadata.invitationId) {
        await teamsApi.declineInvitation(parsedMetadata.invitationId);
        setInvitationStatus('declined');
        toast.success('Invitation declined.');
        window.dispatchEvent(new Event("teamsUpdated"));
        if (onRead && !read) onRead(id, true);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setInvitationStatus('declined');
        toast.info('Invitation is no longer pending.');
        window.dispatchEvent(new Event("teamsUpdated"));
        if (onRead && !read) onRead(id, true);
      } else {
        console.error('Failed to decline invitation:', error);
        toast.error('Failed to decline invitation.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isTeamInvitation = type === 'TEAM_INVITATION';
  const isPendingInvitation = isTeamInvitation && !invitationStatus;

  return (
    <div
      className={`notification-item ${!read ? 'unread' : 'read'} ${actionUrl || isPendingInvitation ? 'clickable' : ''}`}
      onClick={handleItemClick}
    >
      <div className="notification-content">
        <div className="notification-icon-wrapper">
          {getIconComponent()}
        </div>
        
        <div className="notification-text">
          <div className="notification-title">{title}</div>
          {message && (
            <div className="notification-message">{message}</div>
          )}
          
          {isTeamInvitation && !invitationStatus && (
            <div className="notification-actions">
              <button 
                className="notification-action-btn primary"
                onClick={handleJoin}
                disabled={isProcessing}
              >
                Join Team
              </button>
              <button 
                className="notification-action-btn secondary"
                onClick={handleDecline}
                disabled={isProcessing}
              >
                Decline
              </button>
            </div>
          )}
          {isTeamInvitation && invitationStatus === 'joined' && (
            <div className="notification-status success-text">Joined!</div>
          )}
          {isTeamInvitation && invitationStatus === 'declined' && (
            <div className="notification-status error-text">Declined</div>
          )}

          <div className="notification-timestamp">
            <Clock size={12} />
            <span>{getRelativeTime()}</span>
          </div>
        </div>

        {!read && <div className="notification-unread-badge" />}
      </div>

      <div className="notification-side-actions">
        <button
          className="notification-icon-btn toggle-read-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onRead) onRead(id, !read);
          }}
          title={read ? "Mark as unread" : "Mark as read"}
          aria-label={read ? "Mark as unread" : "Mark as read"}
        >
          {read ? <Circle size={16} /> : <Check size={16} />}
        </button>
        <button
          className="notification-icon-btn delete-btn"
          onClick={handleDelete}
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
