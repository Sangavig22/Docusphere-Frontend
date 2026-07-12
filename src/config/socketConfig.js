import * as StompPkg from 'stompjs';
const Stomp = StompPkg.Stomp || StompPkg.default?.Stomp || StompPkg.default || StompPkg;
import SockJS from 'sockjs-client';

// Get WebSocket server URL from environment or default to current origin (uses Vite proxy in dev)
const WS_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const WS_URL = `${WS_BASE_URL}/ws/notifications`;

/**
 * Create and configure STOMP client for Spring WebSocket
 * @param {string} token - JWT authentication token
 * @returns {Object} STOMP client instance
 */
export const initializeSocket = (token) => {
  const wsUrlWithToken = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
  const socketFactory = () => new SockJS(wsUrlWithToken);
  const stompClient = Stomp.over(socketFactory);
  
  // Disable debug logging in production
  stompClient.debug = (str) => {
    // Only log errors and connection events
    if (str.includes('SEND') || str.includes('DISCONNECT') || str.includes('ERROR')) {
      console.log('[STOMP]', str);
    }
  };

  return stompClient;
};

/**
 * Connect STOMP client with JWT authentication
 * @param {Object} stompClient - STOMP client instance
 * @param {string} token - JWT authentication token
 * @param {Object} callbacks - Connection callbacks { onConnect, onError }
 */
export const connectSocket = (stompClient, token, callbacks = {}) => {
  const { onConnect, onError } = callbacks;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const connectFrameReceived = () => {
    console.log('✓ STOMP Connected');
    onConnect?.();
  };

  const errorCallback = (error) => {
    console.error('✗ STOMP connection error:', error);
    onError?.(error);
  };

  stompClient.connect(headers, connectFrameReceived, errorCallback);
};

/**
 * Get the WebSocket URL (useful for debugging)
 */
export const getSocketURL = () => WS_URL;

/**
 * STOMP subscription destinations for notifications
 */
export const SOCKET_EVENTS = {
  // Subscription destinations (Server -> Client)
  NEW_NOTIFICATION: '/topic/notifications/new',
  NOTIFICATION_READ: '/topic/notifications/marked-read',
  NOTIFICATION_DELETED: '/topic/notifications/deleted',
  NOTIFICATION_BATCH_READ: '/topic/notifications/batch-read',
  
  // Publish destinations (Client -> Server)
  SEND_READ: '/app/notifications/read',
  SEND_DELETE: '/app/notifications/delete',
  SEND_CONNECT: '/app/notifications/user-connected',
  
  // Connection status
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};
