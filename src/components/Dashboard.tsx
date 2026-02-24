import React, { useState } from 'react';
import { Project } from '../types';
import { Icons } from './IconComponents';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface DashboardProps {
    projects: Project[];
    activeProjectId: string | null;
    onProjectSelect: (id: string) => void;
    onNewProject: (themeId: string) => void;
    onDeleteProject: (id: string) => void;
    onViewCart: () => void;
    onAdminPanel: () => void;
}

const Logo = () => (
    <div className="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-lg shadow-sm">
        <span className="text-white font-bold text-xl font-mono">P</span>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ projects, activeProjectId, onProjectSelect, onNewProject, onDeleteProject, onViewCart, onAdminPanel }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { items, addToCart, cartItemCount } = useCart();
    const { role, currentUser, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">

            {/* Navbar - Reverted to White/Standard */}
            <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="flex items-center gap-12">
                    <Logo />
                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-600 font-mono text-[10px]">
                        <button className="flex items-center gap-1 text-gray-900 transition-colors">
                            Проекты
                        </button>
                        <button className="hover:text-gray-900 transition-colors">Магазин</button>
                        <button className="hover:text-gray-900 transition-colors">О нас</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {role === 'ADMIN' && (
                        <button onClick={onAdminPanel} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold transition-colors hover:bg-black">
                            <Icons.Settings size={14} /> Админ
                        </button>
                    )}

                    {role === 'GUEST' ? (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="text-sm font-bold text-gray-900 border-2 border-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-900 hover:text-white transition-colors"
                        >
                            Войти
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
                            <span className="text-xs font-medium text-gray-600 hidden sm:block max-w-[120px] truncate">
                                {currentUser?.name}
                            </span>
                            <button
                                onClick={logout}
                                className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
                                title="Выйти"
                            >
                                Выйти
                            </button>
                        </div>
                    )}

                    <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors ml-2 hidden sm:flex">
                        <Icons.Grid size={18} />
                    </button>
                    <button onClick={onViewCart} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors shrink-0 relative" title="Корзина">
                        <Icons.Cart size={20} />
                        {cartItemCount > 0 && (
                            <span className="absolute max-h-4 -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-sm">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 sm:px-8 py-8 sm:py-12 max-w-[1400px] mx-auto w-full relative z-10">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-16 gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                            Мои Проекты
                        </h1>
                        <p className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">
                    // Архив 2025
                        </p>
                    </div>

                    <button
                        onClick={() => onNewProject('classic')}
                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-full shadow-lg hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-2 font-bold text-sm tracking-wide"
                    >
                        <Icons.Plus size={18} /> СОЗДАТЬ АЛЬБОМ
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="alabaster-card flex flex-col items-center justify-center py-20 sm:py-32 text-center bg-white border border-gray-200">
                        <div className="w-20 h-20 sm:w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                            <Icons.Image size={32} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Архив пуст</h3>
                        <p className="text-gray-500 mb-8 max-w-md font-mono text-[10px] px-4">Создайте свой первый фотоальбом, выбрав один из наших дизайнерских макетов.</p>
                        <button onClick={() => onNewProject('classic')} className="text-gray-900 font-bold border-b-2 border-gray-900 hover:opacity-70 transition-opacity pb-1 text-sm tracking-wide">
                            НАЧАТЬ ТВОРЧЕСТВО
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {projects.map((project, idx) => (
                            <div
                                key={project.id}
                                className="alabaster-card group"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="grain"></div>

                                {/* Image Container */}
                                <div className="image-container">
                                    {/* Inner Orb decoration */}
                                    <div className="absolute w-[150px] h-[150px] bg-white blur-[50px] rounded-full opacity-50 z-0 top-[-20px] left-[-20px]"></div>

                                    {project.previewUrl ? (
                                        <img
                                            src={project.previewUrl}
                                            alt={project.name}
                                            className="w-[85%] h-[85%] object-cover shadow-[0_20px_30px_rgba(0,0,0,0.05)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 group-hover:-translate-y-2 z-10 rounded-lg"
                                        />
                                    ) : (
                                        <div className="z-10 text-[#4A3B3C] opacity-30">
                                            <Icons.Image size={48} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <span className="label-mono">
                                        {new Date(project.updatedAt).toLocaleDateString()} • {project.pageCount} Pages
                                    </span>

                                    <h3 className="product-title break-words">
                                        {project.name}
                                    </h3>

                                    <div className="price-tag">
                                        {project.price}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => onProjectSelect(project.id)}
                                            className="cta-button flex-1"
                                        >
                                            ИЗМЕНИТЬ
                                            <Icons.Edit size={14} />
                                        </button>
                                        <button onClick={() => addToCart(project)} className="cta-button-secondary hover:bg-gray-100 transition-colors" title="В корзину">
                                            <Icons.Cart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};