/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);     
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await fetch(`${ENDPOINTS.AUTH}/me`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { checkSession(); }, [checkSession]);

    /**
     * login — handles both employee and PA login.
     * @param {string} empCode
     * @param {string} password
     * @param {'EMPLOYEE'|'PA'} loginType - determines which endpoint to call
     */
    const login = async (empCode, password, loginType = 'EMPLOYEE') => {
        const endpoint = loginType === 'PA'
            ? `${ENDPOINTS.AUTH}/login-pa`
            : `${ENDPOINTS.AUTH}/login`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ empCode, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${ENDPOINTS.AUTH}/logout`, { method: 'POST', credentials: 'include' });
        } catch { /* clear local state */ }
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isPA: user?.role === 'PA',
        isNormal: user?.role === 'NORMAL',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
