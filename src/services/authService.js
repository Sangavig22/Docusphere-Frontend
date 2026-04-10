const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const authService = {
  // Sign up
  async signUp(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign in failed');
      }

      const data = await response.json();
      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email with token
  async verifyEmail(token) {
    try {
      const url = `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email verification failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const url = `${API_BASE_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Resend error:', error);
      throw error;
    }
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
