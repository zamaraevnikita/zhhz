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
                if (token === 'mock-jwt-token') {
                     setCurrentUser({
                         id: 'mock-user-id',
                         phone: '+7 (999) 000-00-00',
                         name: 'Тестовый Пользователь',
                         email: 'test@example.com',
                         role: 'USER'
                     });
                } else {
                    const data = await fetchApi<{ user: User }>('/auth/me');
                    setCurrentUser(data.user);
                }
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
        // MOCKED: Accept any password and simulate success.
        const mockUser: User = {
            id: 'mock-user-id',
            phone: phone,
            name: 'Тестовый Пользователь',
            email: 'test@example.com',
            role: 'USER'
        };
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        setCurrentUser(mockUser);
        console.log("[MOCK] Login successful. User logged in as:", mockUser);
    };

    const requestOtp = async (phone: string, profile?: { name?: string; email?: string; password?: string }): Promise<void> => {
        // MOCKED: No backend call needed. Just simulate success.
        console.log(`[MOCK] Requested OTP for ${phone}. Use code 1111.`);
        // To make it fully usable without backend, we store the profile locally for the verification step
        if (profile) {
             (window as any).__mockProfile = profile;
        }
    };

    const verifyOtp = async (phone: string, code: string) => {
        // MOCKED: Accept any code (e.g. 1111) and simulate success.
        if (code !== '1111') {
             throw new Error("Неверный код. Используйте 1111.");
        }
        
        const profile = (window as any).__mockProfile || {};
        
        const mockUser: User = {
            id: 'mock-user-id',
            phone: phone,
            name: profile.name || 'Тестовый Пользователь',
            email: profile.email || 'test@example.com',
            role: 'USER'
        };

        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        setCurrentUser(mockUser);
        console.log("[MOCK] Verification successful. User logged in as:", mockUser);
    };

    const setDevRole = (newRole: UserRole) => {
        if (!currentUser) {
            setCurrentUser({ id: 'dev-user', phone: '+123', role: newRole } as User);
            return;
        }
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
