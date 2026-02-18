import Cookies from 'js-cookie';
import { ENDPOINTS } from '../config/api';

export const authService = {
    // 1. LOGIN & STORE (No Try-Catch)
    login: async (empCode, password) => {
        // Direct fetch call
        const response = await fetch(`${ENDPOINTS.AUTH}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empCode, password })
        });

        // We await the JSON parsing immediately
        const data = await response.json();

        // Check for 400/401/500 errors manually
        if (!response.ok) {
            // This error will bubble up to the component calling this function
            throw new Error(data.error || 'Login Failed');
        }

        // --- SAVE TO COOKIE ---
        if (data.user) {
            Cookies.set('currentUser', JSON.stringify(data.user), { expires: 1, sameSite: 'Strict' });
        }

        return data;
    },

    // 2. LOGOUT
    logout: () => {
        Cookies.remove('currentUser');
    },

    // 3. GET CURRENT USER
    getCurrentUser: () => {
        const userCookie = Cookies.get('currentUser');
        return userCookie ? JSON.parse(userCookie) : null;
    }
};