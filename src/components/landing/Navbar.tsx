import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface NavbarProps {
    onNavigate?: (path: string) => void;
}

/**
 * Проверяю позиционирование Navbar по Figma CSS:
 * - width: 1441px, height: 67px, background: #FFFFFF
 * - Бургер: left 3.47%, top 35.82%, 20×18px, 3 линии 1px solid #000
 * - Логотип: left 45.25%, right 45.25%, top 8.96%, bottom 8.96% → centered
 * - Component 10 (сетка): left 85.7%, top 34.33%, 20×20
 * - Component 9 (корзина): left 90.49%, top 35.82%, 20×20
 * - Component 8 (аккаунт): left 95.21%, top 35.82%, 20×20
 * - margin-top: 0, z-index: 50
 */
export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav
            className="fixed top-0 left-0 w-full z-50"
            style={{ height: 67, background: '#FFFFFF' }}
        >
            <div className="relative w-full h-full max-w-[1441px] mx-auto">

                {/* Бургер — left: 3.47%, top: 35.82% */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="absolute"
                    style={{
                        left: '3.47%',
                        top: '35.82%',
                        width: 20,
                        height: 18,
                    }}
                    aria-label="Меню"
                >
                    <span className={cn(
                        "absolute left-0 right-0 transition-all duration-300",
                        isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                    )} style={{ borderTop: '1px solid #000000' }} />
                    <span className={cn(
                        "absolute left-0 right-0 transition-all duration-300",
                        isMenuOpen ? "opacity-0" : "top-1/2 -translate-y-1/2"
                    )} style={{ borderTop: '1px solid #000000' }} />
                    <span className={cn(
                        "absolute left-0 right-0 transition-all duration-300",
                        isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                    )} style={{ borderTop: '1px solid #000000' }} />
                </button>

                {/* Логотип — центр, left/right: 45.25%, top/bottom: 8.96% → ~137×55 */}
                <div
                    className="absolute cursor-pointer flex items-center justify-center"
                    onClick={() => onNavigate?.('/')}
                    style={{
                        left: '45.25%',
                        right: '45.25%',
                        top: '8.96%',
                        bottom: '8.96%',
                    }}
                >
                    <img
                        src={`${import.meta.env.BASE_URL}images/logo.png`.replace(/\/\//g, '/')}
                        alt="РЕВЬЮ*"
                        className="h-full w-auto object-contain select-none"
                        draggable={false}
                    />
                </div>

                {/* Component 10 — Сетка 2×2 (точный SVG) */}
                <button
                    onClick={() => onNavigate?.('/projects')}
                    className="absolute hover:opacity-60 transition-opacity"
                    style={{ left: '85.7%', top: '34.33%', width: 20, height: 20 }}
                    aria-label="Проекты"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="9.43478" height="9.43478" stroke="black" />
                        <rect x="10.0652" y="10.0654" width="9.43478" height="9.43478" stroke="black" />
                        <rect x="0.5" y="10.0654" width="9.43478" height="9.43478" stroke="black" />
                        <rect x="10.0652" y="0.5" width="9.43478" height="9.43478" stroke="black" />
                    </svg>
                </button>

                {/* Component 9 — Корзина (точный SVG) */}
                <button
                    onClick={() => onNavigate?.('/cart')}
                    className="absolute hover:opacity-60 transition-opacity"
                    style={{ left: '90.49%', top: '35.82%', width: 20, height: 20 }}
                    aria-label="Корзина"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0.5H2.5L4 6M4 6L5.5 12H17.5L19 6H4Z" stroke="black" />
                        <circle cx="8" cy="16.5" r="2.5" stroke="black" />
                        <circle cx="15" cy="16.5" r="2.5" stroke="black" />
                    </svg>
                </button>

                {/* Component 8 — Аккаунт (точный SVG) */}
                <button
                    className="absolute hover:opacity-60 transition-opacity"
                    style={{ left: '95.21%', top: '35.82%', width: 20, height: 20 }}
                    aria-label="Аккаунт"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.5 19H0.5C0.5 16.8333 2.4 10.5 10 10.5C17.6 10.5 19.5 16.8333 19.5 19Z" stroke="black" />
                        <circle cx="10" cy="4.5" r="4" stroke="black" />
                    </svg>
                </button>
            </div>

            {/* Выпадающее меню */}
            <div className={cn(
                "absolute top-[67px] left-0 w-full bg-white transition-all duration-300 overflow-hidden",
                isMenuOpen ? "max-h-[400px] opacity-100 border-b border-black" : "max-h-0 opacity-0"
            )}>
                <div className="flex flex-col px-[50px] py-6 gap-4 max-w-[1441px] mx-auto">
                    {[
                        { label: 'Конструктор', path: '/theme-selection' },
                        { label: 'О нас', path: '#' },
                        { label: 'Доставка', path: '#' },
                        { label: 'Контакты', path: '#' },
                    ].map(item => (
                        <button
                            key={item.label}
                            onClick={() => { onNavigate?.(item.path); setIsMenuOpen(false); }}
                            className="text-left text-black hover:text-gray-500 transition-colors"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 14 }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};
