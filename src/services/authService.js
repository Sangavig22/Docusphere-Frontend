import { request } from '../api/apiClient.js';

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
    
    VERIFICATION_EMAIL: 'verificationEmail',
    
    REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days 

    async signUp(userData) {
        return request('/auth/signUp', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async verifyEmail(token) {
        return request(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    },

    async resendVerificationEmail(email) {
        return request('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
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
                confirmPassword: confirmPassword
            }),
        });
    },

    saveAuth(data, rememberMe = false) {
        if (!data?.token) {
            return;
        }

        this.signOut();
        if (rememberMe) {
            // Store in localStorage with expiry (Remember Me - 7 days)
            const expiryTime = Date.now() + this.REMEMBER_ME_DURATION;

            localStorage.setItem(this.REMEMBER_ME, data.token);
            localStorage.setItem(this.REMEMBER_ME_EXPIRY, expiryTime.toString());
            localStorage.setItem(this.REMEMBER_ME_EMAIL, data.email || '');
            localStorage.setItem(this.REMEMBER_ME_ROLE, data.role || '');
            localStorage.setItem(this.REMEMBER_ME_FULLNAME, data.fullName || '');
            localStorage.setItem(this.REMEMBER_ME_USER_ID, data.userId || '');
            
            // Also set in sessionStorage for immediate use
            sessionStorage.setItem(this.AUTH_TOKEN, data.token);
            if (data.role) sessionStorage.setItem(this.USER_ROLE, data.role);
            if (data.email) sessionStorage.setItem(this.USER_EMAIL, data.email);
            if (data.fullName) sessionStorage.setItem(this.USER_FULLNAME, data.fullName);
            if (data.userId) sessionStorage.setItem(this.USER_ID, data.userId);
        } else {
            // Store in sessionStorage (temporary session)
            sessionStorage.setItem(this.AUTH_TOKEN, data.token);
            if (data.role) sessionStorage.setItem(this.USER_ROLE, data.role);
            if (data.email) sessionStorage.setItem(this.USER_EMAIL, data.email);
            if (data.fullName) sessionStorage.setItem(this.USER_FULLNAME, data.fullName);
            if (data.userId) sessionStorage.setItem(this.USER_ID, data.userId);
        }
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

    //Check if Remember Me token is still valid
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
    // Restore session from Remember Me on app startup
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

    saveVerificationEmail(email) {
        sessionStorage.setItem(this.VERIFICATION_EMAIL, email);
    },

    getVerificationEmail() {
        return sessionStorage.getItem(this.VERIFICATION_EMAIL);
    },

    clearVerificationEmail() {
        sessionStorage.removeItem(this.VERIFICATION_EMAIL);
    },

    signOut() {
        sessionStorage.removeItem(this.AUTH_TOKEN);
        sessionStorage.removeItem(this.USER_ROLE);
        sessionStorage.removeItem(this.USER_EMAIL);
        sessionStorage.removeItem(this.USER_FULLNAME);
        sessionStorage.removeItem(this.USER_ID);
        sessionStorage.removeItem(this.VERIFICATION_EMAIL);

        this.clearRememberMe();
    },

    getRememberMeDaysLeft() {
        const expiry = localStorage.getItem(this.REMEMBER_ME_EXPIRY);
        if (!expiry) return 0;
        const daysLeft = Math.ceil((parseInt(expiry) - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysLeft);
    },

    getUserId() {
        return sessionStorage.getItem(this.USER_ID);
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
};

export default authService;