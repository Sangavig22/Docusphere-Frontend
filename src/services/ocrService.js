import { API_BASE_URL } from '../config/api';

export const ocrService = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
      method: 'POST',
      credentials: 'include',
      // No Content-Type header — fetch sets it automatically with multipart boundary
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'OCR processing failed');
    }

    return response.json();
  },

  checkStatus: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/ocr/status/${jobId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Could not check processing status');
    }

    return response.json();
  }
};
