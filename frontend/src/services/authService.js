import { ENDPOINTS } from '../config/api';

/**
 * Auth Service — uses fetch with credentials: 'include' for HttpOnly cookie auth.
 * The JWT token is managed entirely by the server via HttpOnly cookies.
 * This service is kept for backward compatibility, but the primary auth 
 * flow should use the useAuth() hook from AuthContext.
 */
export const authService = {
    // 1. LOGIN — server sets HttpOnly cookie
    login: async (empCode, password) => {
        const response = await fetch(`${ENDPOINTS.AUTH}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ empCode, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login Failed');
        }

        return data;
    },

    // 2. LOGOUT — server clears HttpOnly cookie
    logout: async () => {
        try {
            await fetch(`${ENDPOINTS.AUTH}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch {
            // Silent fail — cookie will expire naturally
        }
    },

    // 3. GET CURRENT USER — verifies session via /me endpoint
    getCurrentUser: async () => {
        try {
            const response = await fetch(`${ENDPOINTS.AUTH}/me`, {
                credentials: 'include'
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.user;
        } catch {
            return null;
        }
    }
};