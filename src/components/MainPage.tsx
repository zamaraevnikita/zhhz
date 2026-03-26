import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './landing/Navbar';

/**
 * MainPage — пока только Navbar для поочерёдной проверки.
 * Секции будут добавляться по одной после проверки.
 */
export const MainPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        if (path.startsWith('#')) return;
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar onNavigate={handleNavigate} />

            {/* Временный контент чтобы видеть навбар */}
            <div className="pt-[67px] flex items-center justify-center" style={{ height: '100vh' }}>
                <p className="text-gray-300 text-sm" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                    Секции будут добавляться поочерёдно
                </p>
            </div>
        </div>
    );
};
