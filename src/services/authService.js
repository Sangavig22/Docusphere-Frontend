import { request } from '../api/apiClient.js';
import { API_BASE_URL } from '../config/api.js';
import { BACKEND_URL } from '../config/authConfig.js';
import { getProfilePhotoFromToken } from '../utils/authToken.js';

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
        return `${base}/${cleaned.replace(/^\/+/, '')}`;
    }

    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const resolveProfilePhoto = (photo, fullName) => {
    return normalizeProfilePhotoUrl(photo) || createNameAvatarDataUrl(fullName);
};

const getTokenProfilePhoto = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    return normalizeProfilePhotoUrl(getProfilePhotoFromToken(token));
};

const readStoredUserSnapshot = () => {
    const raw = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || '';

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const unwrapApiPayload = (payload) => payload?.data ?? payload;

const extractFirstDefined = (source, keys) => {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            return value;
        }
    }
    return '';
};

const extractFromCommonWrappers = (source, keys) => {
    const candidates = [
        source,
        source?.user,
        source?.profile,
        source?.account,
        source?.principal,
        source?.attributes,
        source?.data,
    ].filter(Boolean);

    for (const candidate of candidates) {
        const value = extractFirstDefined(candidate, keys);
        if (value) {
            return value;
        }
    }

    return '';
};

const findDeepValue = (source, keys, visited = new Set()) => {
    if (!source || typeof source !== 'object' || visited.has(source)) {
        return '';
    }

    visited.add(source);

    const directValue = extractFirstDefined(source, keys);
    if (directValue) {
        return directValue;
    }

    for (const value of Object.values(source)) {
        if (!value || typeof value !== 'object') {
            continue;
        }

        const nestedValue = findDeepValue(value, keys, visited);
        if (nestedValue) {
            return nestedValue;
        }
    }

    return '';
};

const readFirstValue = (keys) => {
    for (const key of keys) {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue && sessionValue.trim()) return sessionValue.trim();

        const localValue = localStorage.getItem(key);
        if (localValue && localValue.trim()) return localValue.trim();
    }
    return '';
};

const setStorageValue = (key, value, persistToLocal = false) => {
    const normalized = value == null ? '' : String(value);

    if (normalized) {
        sessionStorage.setItem(key, normalized);
        if (persistToLocal) {
            localStorage.setItem(key, normalized);
        }
        return;
    }

    sessionStorage.removeItem(key);
    if (persistToLocal) {
        localStorage.removeItem(key);
    }
};

const normalizeSessionData = (data = {}) => {
    const source = unwrapApiPayload(data) || {};

    const givenName = extractFromCommonWrappers(source, ['given_name', 'givenName']) || findDeepValue(source, ['given_name', 'givenName']);
    const familyName = extractFromCommonWrappers(source, ['family_name', 'familyName']) || findDeepValue(source, ['family_name', 'familyName']);
    const displayName = extractFromCommonWrappers(source, ['fullName', 'full_name', 'name', 'displayName']) || findDeepValue(source, ['fullName', 'full_name', 'name', 'displayName']);
    const profilePictureUrl = extractFromCommonWrappers(source, [
        'profilePictureUrl',
        'profileUrl',
        'profile_picture_url',
        'profile_picture',
        'profileImage',
        'profileImageUrl',
        'profilePhotoUrl',
        'photoUrl',
        'photo',
        'picture',
        'image',
        'imageUrl',
        'avatar',
        'avatarUrl',
    ]) || findDeepValue(source, [
        'profilePictureUrl',
        'profileUrl',
        'profile_picture_url',
        'profile_picture',
        'profileImage',
        'profileImageUrl',
        'profilePhotoUrl',
        'photoUrl',
        'photo',
        'picture',
        'image',
        'imageUrl',
        'avatar',
        'avatarUrl',
    ]);

    const combinedName = [givenName, familyName].filter(Boolean).join(' ').trim();

    return {
        fullName: displayName || combinedName || '',
        email: extractFromCommonWrappers(source, ['email', 'userEmail', 'preferred_username']),
        role: extractFromCommonWrappers(source, ['role', 'userRole']),
        userId: extractFromCommonWrappers(source, ['userId', 'id', 'sub', 'uid']),
        profilePictureUrl,
        refreshTokenExpiry:
            extractFromCommonWrappers(source, [
                'refreshTokenExpiry',
                'refresh_token_expiry',
                'refreshTokenExpiresAt',
                'refreshTokenExpires',
            ]) ||
            '',
    };
};

let sessionBootstrapPromise = null;
let manualLogoutPending = false;
let authSessionVersion = 0;
const SESSION_CACHE_TIME = 5 * 60 * 1000;
let verifiedSession = {
    authenticated: false,
    user: null,
    checkedAt: 0,
    refreshTokenExpiry: '',
};

const setVerifiedSession = (data) => {
    const user = normalizeSessionData(data);
    verifiedSession = {
        authenticated: true,
        user,
        checkedAt: Date.now(),
        refreshTokenExpiry: user.refreshTokenExpiry,
    };
    return user;
};

const clearVerifiedSession = () => {
    verifiedSession = {
        authenticated: false,
        user: null,
        checkedAt: Date.now(),
        refreshTokenExpiry: '',
    };
};

const clearAuthStorage = () => {
    sessionStorage.removeItem('profilePictureUrl');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userPhoto');
    sessionStorage.removeItem('refreshTokenExpiry');
    sessionStorage.removeItem('emailVerificationAttempted');
    localStorage.removeItem('profilePictureUrl');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPhoto');
    localStorage.removeItem('currentUser');
};

const clearRememberMeStorage = () => {
    localStorage.removeItem('rememberMeEnabled');
    localStorage.removeItem('rememberMeEmail');
    localStorage.removeItem('rememberMeRole');
    localStorage.removeItem('rememberMeFullName');
    localStorage.removeItem('rememberMeUserId');
    localStorage.removeItem('refreshTokenExpiry');
};

const clearManualLogoutFlag = () => {
    sessionStorage.removeItem('manualLogoutPending');
};

const emitUserProfileUpdated = () => {
    window.dispatchEvent(new Event('user-profile-updated'));
};

const authService = {
    REMEMBER_ME_ENABLED: 'rememberMeEnabled',
    REMEMBER_ME_EMAIL: 'rememberMeEmail',
    REMEMBER_ME_ROLE: 'rememberMeRole',
    REMEMBER_ME_FULLNAME: 'rememberMeFullName',
    REMEMBER_ME_USER_ID: 'rememberMeUserId',

    USER_ROLE: 'userRole',
    USER_EMAIL: 'userEmail',
    USER_FULLNAME: 'userFullName',
    USER_ID: 'userId',
    USER_PHOTO: 'userPhoto',

    VERIFICATION_EMAIL: 'verificationEmail',

    async signUp(userData) {
        return request('/auth/signUp', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    saveVerificationEmail(email) {
        if (!email) return;

        localStorage.setItem(this.VERIFICATION_EMAIL, email);
        sessionStorage.removeItem('emailVerificationAttempted');
    },

    async verifyEmail(token) {
        return request(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
            method: 'GET',
        });
    },

    async resendVerificationEmail(email) {
        return request('/auth/resend-verification-email', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async signIn(email, password, rememberMe = false) {
        const data = unwrapApiPayload(await request('/auth/signIn', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe }),
        }));

        this.saveAuth(data, rememberMe);
        return data;
    },

    // Resolve API base URL from environment or current origin (handles '/api' fallback).
    _resolveApiBase() {
        try {
            const envBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
            if (envBase) {
                if (envBase.startsWith('/')) {
                    return `${window.location.origin.replace(/\/$/, '')}${envBase.replace(/\/$/, '')}`;
                }
                return envBase.replace(/\/$/, '');
            }
        } catch {
            // Fall back to default api path if resolution fails.
        }

        return `${window.location.origin.replace(/\/$/, '')}/api`;
    },

    startGoogleAuth() {
        manualLogoutPending = false;
        clearManualLogoutFlag();
        window.location.href = `${BACKEND_URL}/auth/google`;
    },

    startGitHubAuth() {
        manualLogoutPending = false;
        clearManualLogoutFlag();
        // Always use backend-initiated authorization start to preserve previous behavior.
        window.location.href = `${BACKEND_URL}/auth/github`;
    },

    async forgotPassword(email) {
        return request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async requestPasswordReset(email) {
        return this.forgotPassword(email);
    },

    async verifyPasswordResetToken(token) {
        return request(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
    },

    async resetPassword(token, password, confirmPassword) {
        return request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword: password,
                confirmPassword: confirmPassword,
            }),
        });
    },

    async completeOauthSignup(oauthPayload) {
        if (!oauthPayload) return null;

        const candidates = [
            '/auth/complete-oauth-signup',
            '/auth/link-oauth',
            '/auth/link-account',
        ];

        for (const endpoint of candidates) {
            try {
                const resp = await request(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ oauthPayload }),
                });

                // If server returned a session/user object, return it
                if (resp) return resp;
            } catch {
                // try next endpoint
                continue;
            }
        }

        return null;
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
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            if (response.status === 401) {
                await this.signOut();
                throw new Error('Unauthorized');
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

        const normalizedUser = normalizeSessionData(updatedUser);
        const fullName = normalizedUser.fullName || this.getUserFullName();
        const email = normalizedUser.email || this.getUserEmail();
        const role = normalizedUser.role || this.getUserRole();
        const userId = normalizedUser.userId || this.getUserId();
        const rawPhoto = normalizedUser.profilePictureUrl;

        const photoToStore = resolveProfilePhoto(rawPhoto, fullName);
        const persistToLocal = this.isRememberMeValid();

        setStorageValue(this.USER_FULLNAME, fullName, persistToLocal);
        setStorageValue(this.USER_EMAIL, email, persistToLocal);
        setStorageValue(this.USER_ROLE, role, persistToLocal);
        setStorageValue(this.USER_ID, userId, persistToLocal);
        setStorageValue(this.USER_PHOTO, photoToStore, persistToLocal);

        const currentUserSnapshot = JSON.stringify({
            ...normalizedUser,
            fullName,
            email,
            role,
            userId,
            profilePictureUrl: photoToStore,
        });

        sessionStorage.setItem('currentUser', currentUserSnapshot);
        if (persistToLocal) {
            localStorage.setItem('currentUser', currentUserSnapshot);
        }

        sessionStorage.setItem('profilePictureUrl', photoToStore);
        if (persistToLocal) {
            localStorage.setItem('profilePictureUrl', photoToStore);
        }

        emitUserProfileUpdated();
    },

    getProfilePicture() {
        const photo = sessionStorage.getItem('profilePictureUrl') ||
            localStorage.getItem('profilePictureUrl') ||
            sessionStorage.getItem(this.USER_PHOTO) ||
            localStorage.getItem(this.USER_PHOTO) ||
            readStoredUserSnapshot()?.profilePictureUrl ||
            readStoredUserSnapshot()?.picture ||
            readStoredUserSnapshot()?.photoUrl ||
            getTokenProfilePhoto() ||
            '';

        const normalized = normalizeProfilePhotoUrl(photo);

        // Add cache buster to external URLs to prevent expired images
        if (normalized && (normalized.startsWith('http://') || normalized.startsWith('https://'))) {
            const sep = normalized.includes('?') ? '&' : '?';
            return `${normalized}${sep}t=${Math.floor(Date.now() / 3600000)}`;
        }

        if (!normalized) {
            const fullName = this.getUserFullName();
            return createNameAvatarDataUrl(fullName);
        }

        return normalized;
    },

    getUserFullName() {
        return readFirstValue([this.USER_FULLNAME, this.REMEMBER_ME_FULLNAME]);
    },

    getUserEmail() {
        return readFirstValue([this.USER_EMAIL, this.REMEMBER_ME_EMAIL]);
    },

    getUserRole() {
        return readFirstValue([this.USER_ROLE, this.REMEMBER_ME_ROLE]);
    },

    getUserId() {
        return readFirstValue([this.USER_ID, this.REMEMBER_ME_USER_ID]);
    },

    getRememberedSession() {
        if (!this.isRememberMeValid()) return null;

        const fullName = localStorage.getItem(this.REMEMBER_ME_FULLNAME) || '';
        const email = localStorage.getItem(this.REMEMBER_ME_EMAIL) || '';
        const role = localStorage.getItem(this.REMEMBER_ME_ROLE) || '';
        const userId = localStorage.getItem(this.REMEMBER_ME_USER_ID) || '';
        const refreshTokenExpiry = localStorage.getItem('refreshTokenExpiry') || '';

        if (!email && !userId && !fullName) return null;

        return normalizeSessionData({
            fullName,
            email,
            role,
            userId,
            profilePictureUrl: '', // Don't use cached image URLs - fetch fresh from server
            refreshTokenExpiry,
        });
    },

    async saveAuth(data, rememberMe = false) {
        if (!data) return;

        manualLogoutPending = false;
        clearManualLogoutFlag();
        clearAuthStorage();

        const sessionData = normalizeSessionData(data);
        const fullName = sessionData.fullName;
        const rawPhoto = sessionData.profilePictureUrl;

        const normalizedPhoto = resolveProfilePhoto(rawPhoto, fullName);
        const persistToLocal = !!rememberMe;

        setStorageValue(this.USER_ROLE, sessionData.role, persistToLocal);
        setStorageValue(this.USER_EMAIL, sessionData.email, persistToLocal);
        setStorageValue(this.USER_FULLNAME, fullName, persistToLocal);
        setStorageValue(this.USER_ID, sessionData.userId, persistToLocal);
        setStorageValue(this.USER_PHOTO, normalizedPhoto, persistToLocal);

        if (persistToLocal) {
            localStorage.setItem(this.REMEMBER_ME_ENABLED, 'true');
            localStorage.setItem(this.REMEMBER_ME_EMAIL, sessionData.email);
            localStorage.setItem(this.REMEMBER_ME_ROLE, sessionData.role);
            localStorage.setItem(this.REMEMBER_ME_FULLNAME, fullName);
            localStorage.setItem(this.REMEMBER_ME_USER_ID, sessionData.userId);
            localStorage.setItem('profilePictureUrl', normalizedPhoto);
            localStorage.setItem('currentUser', JSON.stringify({ ...sessionData, profilePictureUrl: normalizedPhoto }));
            if (sessionData.refreshTokenExpiry) {
                localStorage.setItem('refreshTokenExpiry', sessionData.refreshTokenExpiry);
            }
        } else {
            this.clearRememberMe();
        }

        sessionStorage.setItem('profilePictureUrl', normalizedPhoto);
        sessionStorage.setItem('currentUser', JSON.stringify({ ...sessionData, profilePictureUrl: normalizedPhoto }));
        setVerifiedSession({ ...sessionData, profilePictureUrl: normalizedPhoto });

        emitUserProfileUpdated();
    },

    isAuthenticated() {
        return verifiedSession.authenticated && !this.isManualLogoutPending();
    },

    async bootstrapSession() {
        if (this.isManualLogoutPending()) {
            manualLogoutPending = true;
            clearVerifiedSession();
            return null;
        }

        if (sessionBootstrapPromise) {
            return sessionBootstrapPromise;
        }

        const requestVersion = authSessionVersion;

        sessionBootstrapPromise = (async () => {
            try {
                if (manualLogoutPending || requestVersion !== authSessionVersion) {
                    clearVerifiedSession();
                    return null;
                }

                const payload = unwrapApiPayload(await request('/auth/me', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                }));

                if (payload) {
                    const isOauthNewUser =
                        payload?.registered === false ||
                        payload?.newUser === true ||
                        payload?.user?.registered === false ||
                        payload?.user?.newUser === true;

                    if (isOauthNewUser) {
                        try {
                            sessionStorage.setItem('oauthPendingUser', JSON.stringify(payload));
                        } catch (e) {
                            console.warn('Failed to store oauthPendingUser', e);
                        }

                        clearVerifiedSession();
                        emitUserProfileUpdated();
                        return null;
                    }

                    const rememberMe = this.isRememberMeValid();
                    this.saveAuth(payload, rememberMe);
                    return verifiedSession.user;
                }

                const rememberedSession = this.getRememberedSession();
                if (rememberedSession) {
                    this.saveAuth(rememberedSession, true);
                    return verifiedSession.user;
                }

                clearVerifiedSession();
                return null;
            } catch {
                const rememberedSession = this.getRememberedSession();
                if (rememberedSession) {
                    this.saveAuth(rememberedSession, true);
                    return verifiedSession.user;
                }

                clearVerifiedSession();
                return null;
            } finally {
                sessionBootstrapPromise = null;
            }
        })();

        return sessionBootstrapPromise;
    },

    async validateSession() {
        return this.bootstrapSession();
    },

    getRememberMeDaysLeft(refreshTokenExpiry) {
        if (!refreshTokenExpiry) return 0;
        const now = new Date().getTime();
        const expiry = new Date(refreshTokenExpiry).getTime();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysLeft);
    },

    async restoreFromRememberMe() {
        const sessionData = await this.bootstrapSession();
        return Boolean(sessionData);
    },

    getVerifiedRefreshTokenExpiry() {
        return verifiedSession.refreshTokenExpiry || '';
    },

    isRememberMeValid() {
        try {
            const enabled = localStorage.getItem(this.REMEMBER_ME_ENABLED) === 'true';
            const expiry = localStorage.getItem('refreshTokenExpiry');

            if (!enabled || !expiry) return false;

            return new Date(expiry).getTime() > Date.now();
        } catch {
            return false;
        }
    },

    clearRememberMe() {
        clearRememberMeStorage();
    },

    isManualLogoutPending() {
        return manualLogoutPending || sessionStorage.getItem('manualLogoutPending') === 'true';
    },

    async signOut() {
        manualLogoutPending = true;
        authSessionVersion += 1;

        try {
            await request('/auth/signOut', {
                method: 'POST',
            });
        } catch (err) {
            console.error('Logout request failed:', err);
        }

        clearAuthStorage();
        sessionStorage.setItem('manualLogoutPending', 'true');
        this.clearRememberMe();
        clearVerifiedSession();
        emitUserProfileUpdated();
    },

    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        return {
            id: sessionStorage.getItem(this.USER_ID),
            email: sessionStorage.getItem(this.USER_EMAIL),
            fullName: sessionStorage.getItem(this.USER_FULLNAME),
            role: sessionStorage.getItem(this.USER_ROLE)
        };
    },

    getToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    },
};

export default authService;
