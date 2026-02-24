import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const RoleSwitcher: React.FC = () => {
    const { role, setDevRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white text-xs font-mono px-3 py-2 rounded-lg shadow-lg opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
                title="Dev Mode: Role Switcher"
            >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                ROLE: {role}
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 p-4 rounded-xl shadow-2xl w-64">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-500 tracking-wider">DEV CONTROLS</span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-900"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-2">
                {(['GUEST', 'USER', 'ADMIN'] as UserRole[]).map(r => (
                    <button
                        key={r}
                        onClick={() => {
                            setDevRole(r);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === r
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {r}
                        {role === r && <span className="float-right">✓</span>}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 leading-tight">
                This widget bypasses standard authentication flows to forcefully set the current role for testing conditional UI logic.
            </p>
        </div>
    );
};
