import { request } from '../api/apiClient.js';
import { API_BASE_URL } from '../config/api.js';

const createNameAvatarDataUrl = (fullName = '') => {
    const letter = (fullName.trim()[0] || 'u').toUpperCase();
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#114692"/><stop offset="100%" stop-color="#05152C"/></linearGradient></defs><rect width="100%" height="100%" rx="60" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="48" font-weight="700">${letter}</text></svg>`;
    try {
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch {
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
};

const normalizeProfilePhotoUrl = (photoUrl = '') => {
    if (!photoUrl) return '';
    const value = String(photoUrl).trim();

    if (value.startsWith('http://') || value.startsWith('https://') ||
        value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    const cleaned = value.replace(/\\/g, '/');
    const base = (API_BASE_URL || '').trim().replace(/\/$/, '');

    if (/^https?:\/\//i.test(base)) {
        return `${base}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
    }

    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const authService = {
    REMEMBER_ME: 'rememberMeToken',
    REMEMBER_ME_EXPIRY: 'rememberMeExpiry',
    REMEMBER_ME_EMAIL: 'rememberMeEmail',
    REMEMBER_ME_ROLE: 'rememberMeRole',
    REMEMBER_ME_FULLNAME: 'rememberMeFullName',
    REMEMBER_ME_USER_ID: 'rememberMeUserId',
    
    AUTH_TOKEN: 'authToken',
    USER_ROLE: 'userRole',
    USER_EMAIL: 'userEmail',
    USER_FULLNAME: 'userFullName',
    USER_ID: 'userId',
    USER_PHOTO: 'userPhoto',
    
    VERIFICATION_EMAIL: 'verificationEmail',
    
    REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000,

    async signUp(userData) {
        return request('/auth/signUp', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async signIn(email, password, rememberMe = false) {
        const data = await request('/auth/signIn', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        this.saveAuth(data, rememberMe);
        return data;
    },

    async forgotPassword(email) {
        return request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async resetPassword(token, password, confirmPassword) {
        return request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword: password,
                confirmPassword: confirmPassword
            }),
        });
    },

    async changePassword(payload) {
        const { currentPassword, newPassword, confirmPassword } = payload;
        return request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
                confirmNewPassword: confirmPassword,
            }),
        });
    },

    async updateProfile(formData) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.signOut();
                window.location.href = '/signin';
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const data = await response.json();
        this.saveProfileUpdate(data);
        return data;
    },

    saveProfileUpdate(updatedUser) {
        if (!updatedUser) return;

        const fullName = updatedUser.full_name || updatedUser.fullName || '';
        const rawPhoto = updatedUser.profile_picture_url || 
                        updatedUser.profilePictureUrl || 
                        updatedUser.profile_picture ||
                        updatedUser.profilePicture ||
                        updatedUser.photo || 
                        updatedUser.avatarUrl || '';

        const normalizedPhoto = normalizeProfilePhotoUrl(rawPhoto);

        // Only use avatar if truly no photo available
        const photoToStore = normalizedPhoto || createNameAvatarDataUrl(fullName);

        // Update Remember Me storage if active
        sessionStorage.setItem('profilePictureUrl', photoToStore);
        localStorage.setItem('profilePictureUrl', photoToStore);

        if (fullName) {
            sessionStorage.setItem(this.USER_FULLNAME, fullName);
        }
    },

    getProfilePicture() {
        const photo = sessionStorage.getItem('profilePictureUrl') ||
                     localStorage.getItem('profilePictureUrl') || '';

        const normalized = normalizeProfilePhotoUrl(photo);

        if (!normalized) {
            const fullName = sessionStorage.getItem(this.USER_FULLNAME) || 
                           localStorage.getItem(this.REMEMBER_ME_FULLNAME) || '';
            return createNameAvatarDataUrl(fullName);
        }

        return normalized;
    },

    getUserFullName() {
        return sessionStorage.getItem(this.USER_FULLNAME) ||
               localStorage.getItem(this.REMEMBER_ME_FULLNAME) ||
               '';
    },

    saveAuth(data, rememberMe = false) {
        if (!data?.token) return;

        this.signOut();

        const fullName = data.full_name || data.fullName || '';
        const rawPhoto = data.profile_picture_url || 
                        data.profilePictureUrl || 
                        data.photo || 
                        data.avatarUrl || '';

        const normalizedPhoto = normalizeProfilePhotoUrl(rawPhoto) || 
                               createNameAvatarDataUrl(fullName);

        if (rememberMe) {
            const expiryTime = Date.now() + this.REMEMBER_ME_DURATION;

            localStorage.setItem(this.REMEMBER_ME, data.token);
            localStorage.setItem(this.REMEMBER_ME_EXPIRY, expiryTime.toString());
            localStorage.setItem(this.REMEMBER_ME_EMAIL, data.email || '');
            localStorage.setItem(this.REMEMBER_ME_ROLE, data.role || '');
            localStorage.setItem(this.REMEMBER_ME_FULLNAME, fullName);
            localStorage.setItem(this.REMEMBER_ME_USER_ID, data.userId || '');
            localStorage.setItem(this.USER_PHOTO, normalizedPhoto);
        } else {
            sessionStorage.setItem(this.AUTH_TOKEN, data.token);
            if (data.role) sessionStorage.setItem(this.USER_ROLE, data.role);
            if (data.email) sessionStorage.setItem(this.USER_EMAIL, data.email);
            if (fullName) sessionStorage.setItem(this.USER_FULLNAME, fullName);
            if (data.userId) sessionStorage.setItem(this.USER_ID, data.userId);
            sessionStorage.setItem(this.USER_PHOTO, normalizedPhoto);
        }
        localStorage.setItem('profilePictureUrl', normalizedPhoto);
        sessionStorage.setItem('profilePictureUrl', normalizedPhoto);
    },

    getToken() {
        if (this.isRememberMeValid()) {
            return localStorage.getItem(this.REMEMBER_ME);
        }
        return sessionStorage.getItem(this.AUTH_TOKEN);
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    isRememberMeValid() {
        const token = localStorage.getItem(this.REMEMBER_ME);
        const expiry = localStorage.getItem(this.REMEMBER_ME_EXPIRY);

        if (!token || !expiry) return false;

        if (Date.now() > parseInt(expiry)) {
            this.clearRememberMe();
            return false;
        }
        return true;
    },

    restoreFromRememberMe() {
        if (this.isRememberMeValid()) {
            const token = localStorage.getItem(this.REMEMBER_ME);
            const email = localStorage.getItem(this.REMEMBER_ME_EMAIL);
            const role = localStorage.getItem(this.REMEMBER_ME_ROLE);
            const fullName = localStorage.getItem(this.REMEMBER_ME_FULLNAME);
            const userId = localStorage.getItem(this.REMEMBER_ME_USER_ID);

            sessionStorage.setItem(this.AUTH_TOKEN, token);
            if (email) sessionStorage.setItem(this.USER_EMAIL, email);
            if (role) sessionStorage.setItem(this.USER_ROLE, role);
            if (fullName) sessionStorage.setItem(this.USER_FULLNAME, fullName);
            if (userId) sessionStorage.setItem(this.USER_ID, userId);

            return true;
        }
        return false;
    },

    clearRememberMe() {
        localStorage.removeItem(this.REMEMBER_ME);
        localStorage.removeItem(this.REMEMBER_ME_EXPIRY);
        localStorage.removeItem(this.REMEMBER_ME_EMAIL);
        localStorage.removeItem(this.REMEMBER_ME_ROLE);
        localStorage.removeItem(this.REMEMBER_ME_FULLNAME);
        localStorage.removeItem(this.REMEMBER_ME_USER_ID);
    },

    signOut() {
        sessionStorage.clear();
        localStorage.removeItem('profilePictureUrl');
        this.clearRememberMe();

        this.clearRememberMe();
    },

    // ... keep your other methods (getRememberMeDaysLeft, getUserId, etc.)
};

export default authService;