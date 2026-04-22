import { API_BASE_URL } from '../config';

export const ocrService = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
      method: 'POST',
      body: formData,
      // No headers needed for FormData, fetch will set them automatically
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'OCR processing failed');
    }

    return response.json();
  }
};
