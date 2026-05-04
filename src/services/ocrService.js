import { API_BASE_URL } from '../config/api';
import authService from '../services/authService';

export const ocrService = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
      // No Content-Type header needed for FormData, fetch will set it automatically with the boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'OCR processing failed');
    }

    return response.json();
  },

  checkStatus: async (jobId) => {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ocr/status/${jobId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Could not check processing status');
    }

    return response.json();
  }
};
