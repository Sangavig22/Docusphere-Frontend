import { request } from '../api/apiClient.js';

const authService = {
    REMEMBER_ME: 'rememberMeToken',
    REMEMBER_ME_EXPIRY: 'rememberMeExpiry',
    REMEMBER_ME_EMAIL: 'rememberMeEmail',
    REMEMBER_ME_ROLE: 'rememberMeRole',
    REMEMBER_ME_FULLNAME: 'rememberMeFullName',
    
    AUTH_TOKEN: 'authToken',
    USER_ROLE: 'userRole',
    USER_EMAIL: 'userEmail',
    USER_FULLNAME: 'userFullName',
    
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
            
            // Also set in sessionStorage for immediate use
            sessionStorage.setItem(this.AUTH_TOKEN, data.token);
            if (data.role) sessionStorage.setItem(this.USER_ROLE, data.role);
            if (data.email) sessionStorage.setItem(this.USER_EMAIL, data.email);
            if (data.fullName) sessionStorage.setItem(this.USER_FULLNAME, data.fullName);
        } else {
            // Store in sessionStorage (temporary session)
            sessionStorage.setItem(this.AUTH_TOKEN, data.token);
            if (data.role) sessionStorage.setItem(this.USER_ROLE, data.role);
            if (data.email) sessionStorage.setItem(this.USER_EMAIL, data.email);
            if (data.fullName) sessionStorage.setItem(this.USER_FULLNAME, data.fullName);
        }
    },

    getToken() {
        if (this.isRememberMeValid()) {
            return localStorage.getItem(this.REMEMBER_ME);
        }
        return sessionStorage.getItem(this.AUTH_TOKEN);
    },

    //Check if user is authenticated

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

            sessionStorage.setItem(this.AUTH_TOKEN, token);
            if (email) sessionStorage.setItem(this.USER_EMAIL, email);
            if (role) sessionStorage.setItem(this.USER_ROLE, role);
            if (fullName) sessionStorage.setItem(this.USER_FULLNAME, fullName);

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
        sessionStorage.removeItem(this.VERIFICATION_EMAIL);

        this.clearRememberMe();
    },

    getRememberMeDaysLeft() {
        const expiry = localStorage.getItem(this.REMEMBER_ME_EXPIRY);
        if (!expiry) return 0;
        const daysLeft = Math.ceil((parseInt(expiry) - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysLeft);
    },
};

export default authService;