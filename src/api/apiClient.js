import { API_BASE_URL } from '../config/api.js';
import authService from '../services/authService.js';

export async function request(endpoint, options = {}) {
  const token = authService.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

 if (!response.ok) {
  const isAuthEndpoint = endpoint.includes('/auth/signIn') || endpoint.includes('/auth/signUp');
  
  if (response.status === 401 && !isAuthEndpoint) {
    authService.signOut();
    window.location.href = '/signin';
  }

  throw new Error(
    data?.message || data?.error || `Request failed (${response.status})`
  );
}

  return data;
}
