import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

import { API_BASE_URL } from "../config/api.js";
import authService from "./authService.js";
import { teamsApi } from "./teamsApi.js";

const resolveSocketUrl = () => {
  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    const parsed = new URL(API_BASE_URL);
    return `${parsed.origin}/ws-chat`;
  }

  return "/ws-chat";
};

const resolveAccessToken = () =>
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";

export const chatService = {
  async getHistory(teamId, limit = 50) {
    const response = await teamsApi.getTeamChatMessages(teamId, limit);
    return response?.data ?? response ?? [];
  },

  async sendFallback(teamId, payload) {
    const response = await teamsApi.sendTeamChatMessage(teamId, payload);
    return response?.data ?? response;
  },

  connect(teamId, { onMessage, onConnected, onError }) {
    const token = resolveAccessToken();

    const client = new Client({
      webSocketFactory: () => new SockJS(resolveSocketUrl()),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 2500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/teams/${teamId}/chat`, (frame) => {
          try {
            const body = JSON.parse(frame.body);
            onMessage?.(body);
          } catch (error) {
            onError?.(new Error("Failed to parse realtime chat message"));
          }
        });

        onConnected?.();
      },
      onStompError: (frame) => {
        onError?.(new Error(frame.headers?.message || "Realtime chat failed"));
      },
      onWebSocketError: () => {
        onError?.(new Error("WebSocket connection failed"));
      },
    });

    client.activate();

    return {
      sendMessage: (payload) => {
        if (!client.connected) {
          throw new Error("Chat socket is not connected yet");
        }

        client.publish({
          destination: `/app/teams/${teamId}/chat.send`,
          body: JSON.stringify(payload),
        });
      },
      /**
       * @param {string} kind  "DELIVERED" | "SEEN"
       * @returns {Promise<void>}
       */
      sendReceipt: async (messageId, kind) => {
        const body = { messageId, kind };
        if (!client.connected) {
          await teamsApi.postTeamChatReceipts(teamId, { items: [body] });
          return;
        }
        client.publish({
          destination: `/app/teams/${teamId}/chat.receipt`,
          body: JSON.stringify(body),
        });
      },
      disconnect: () => client.deactivate(),
      isConnected: () => client.connected,
    };
  },
};
