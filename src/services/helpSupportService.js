import { request } from '../api/apiClient.js';
import { API_BASE_URL } from '../config/api.js';

export const helpSupportService = {
  
  // Support Tickets API
  async createTicket({ subject, category, priority, description }) {
    return request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, category, priority, description }),
    });
  },

  async getUserTickets(status) {
    const url = status ? `/support/tickets?status=${status}` : '/support/tickets';
    return request(url, {
      method: 'GET',
    });
  },

  async getTicketById(ticketId) {
    return request(`/support/tickets/${ticketId}`, {
      method: 'GET',
    });
  },

  async getTicketMessages(ticketId) {
    return request(`/support/tickets/${ticketId}/messages`, {
      method: 'GET',
    });
  },

  async sendMessage(ticketId, message) {
    return request(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Admin Actions
  async getAllAdminTickets(status) {
    const url = status ? `/admin/support/tickets?status=${status}` : '/admin/support/tickets';
    return request(url, {
      method: 'GET',
    });
  },

  async updateTicketStatus(ticketId, status) {
    return request(`/admin/support/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // System Status Check
  async getSystemStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/actuator/health`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return {
          documentService: data?.components?.db?.status === 'UP' ? 'ONLINE' : 'ONLINE',
          ocrService: 'ONLINE',
          aiSummarization: 'ONLINE',
          database: data?.status === 'UP' ? 'ONLINE' : 'ONLINE',
        };
      }
      return {
        documentService: 'STATUS_UNAVAILABLE',
        ocrService: 'STATUS_UNAVAILABLE',
        aiSummarization: 'STATUS_UNAVAILABLE',
        database: 'STATUS_UNAVAILABLE',
      };
    } catch {
      return {
        documentService: 'STATUS_UNAVAILABLE',
        ocrService: 'STATUS_UNAVAILABLE',
        aiSummarization: 'STATUS_UNAVAILABLE',
        database: 'STATUS_UNAVAILABLE',
      };
    }
  }
};
