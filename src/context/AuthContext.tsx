import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { fetchApi, setLogoutCallback } from '../utils/api';

interface AuthContextProps {
    currentUser: User | null;
    isLoading: boolean;
    role: UserRole;
    login: (phone: string, password: string) => Promise<void>;
    requestOtp: (phone: string, profile?: { name?: string; email?: string; password?: string }) => Promise<void>;
    verifyOtp: (phone: string, code: string) => Promise<void>;
    logout: () => void;
    // Development only helper
    setDevRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const TOKEN_KEY = 'periodica_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setCurrentUser(null);
        // Dispatch event so other hooks (useProjects, useOrders) can react
        window.dispatchEvent(new Event('auth:logout'));
    };

    // Register logout callback so fetchApi can auto-logout on 401
    useEffect(() => {
        setLogoutCallback(logout);
    }, []);

    // Initial load: Verify token against backend /me
    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await fetchApi<{ user: User }>('/auth/me');
                setCurrentUser(data.user);
            } catch (error) {
                console.error("Failed to restore session", error);
                localStorage.removeItem(TOKEN_KEY);
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const role: UserRole = currentUser?.role || 'GUEST';

    const login = async (phone: string, password: string) => {
        const data = await fetchApi<{ user: User, token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password })
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        setCurrentUser(data.user);
    };

    const requestOtp = async (phone: string, profile?: { name?: string; email?: string; password?: string }): Promise<void> => {
        await fetchApi('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, ...profile })
        });
        // Backend generates a random OTP and (in prod) sends via SMS.
        // In dev, the code is printed in the backend console.
    };

    const verifyOtp = async (phone: string, code: string) => {
        const data = await fetchApi<{ user: User, token: string }>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, code })
        });

        localStorage.setItem(TOKEN_KEY, data.token);
        setCurrentUser(data.user);
    };

    const setDevRole = (newRole: UserRole) => {
        if (!currentUser) return;
        setCurrentUser({ ...currentUser, role: newRole });
    };

    return (
        <AuthContext.Provider value={{ currentUser, isLoading, role, login, requestOtp, verifyOtp, logout, setDevRole }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
