import { API_BASE_URL } from '../config/api.js';
import authService from '../services/authService.js';

const NON_REFRESH_AUTH_ENDPOINTS = /\/auth\/(signIn|signUp|refresh|logout|forgot-password|reset-password|verify-reset-token|resend-verification-email|me)/i;

async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

export async function request(endpoint, options = {}) {
  const { headers: customHeaders, skipAuthRefresh = false, skipAuthRedirect = false, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  });
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

 if (!response.ok) {
  const isAuthEndpoint = NON_REFRESH_AUTH_ENDPOINTS.test(endpoint);

  if (response.status === 401 && !isAuthEndpoint && !skipAuthRedirect) {
    if (!skipAuthRefresh) {
      const refreshed = await refreshSession();
      if (refreshed) {
        return request(endpoint, {
          ...restOptions,
          headers: customHeaders,
          skipAuthRefresh: true,
          skipAuthRedirect,
        });
      }
    }

    authService.signOut().catch(console.error);
    window.location.href = '/signin';
  }

  const errorMessage =
    (typeof data === 'string' && data) ||
    data?.message ||
    data?.detail ||
    data?.error_description ||
    data?.error ||
    response.statusText ||
    `Request failed (${response.status})`;
  const error = new Error(errorMessage);
  error.status = response.status;
  error.data = data;

  throw error;
}

  return data;
}
