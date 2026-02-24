import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextProps {
    currentUser: User | null;
    role: UserRole;
    login: (email: string) => Promise<void>;
    register: (name: string, email: string) => Promise<void>;
    logout: () => void;
    // Development only helper
    setDevRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Attempt to load mock session from local storage, fallback to null (GUEST)
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('mock_user_session');
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
        return null;
    });

    const role: UserRole = currentUser?.role || 'GUEST';

    // Persist session changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('mock_user_session', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('mock_user_session');
        }
    }, [currentUser]);

    const login = async (email: string) => {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock admin check for demo purposes
        if (email.includes('admin')) {
            setCurrentUser({ id: 'u_admin_1', name: 'Admin User', email, role: 'ADMIN' });
        } else {
            setCurrentUser({ id: `u_${Date.now()}`, name: 'Customer User', email, role: 'USER' });
        }
    };

    const register = async (name: string, email: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentUser({ id: `u_${Date.now()}`, name, email, role: 'USER' });
    };

    const logout = () => setCurrentUser(null);

    const setDevRole = (newRole: UserRole) => {
        if (newRole === 'GUEST') {
            setCurrentUser(null);
        } else {
            setCurrentUser({
                id: `dev_${newRole.toLowerCase()}`,
                name: `Dev ${newRole}`,
                email: `dev@${newRole.toLowerCase()}.com`,
                role: newRole
            });
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, role, login, register, logout, setDevRole }}>
            {children}
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
