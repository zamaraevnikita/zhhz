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

export const Dashboard: React.FC<DashboardProps> = ({ 
    projects, 
    onProjectSelect, 
    onNewProject, 
    onDeleteProject, 
    onViewCart, 
    onAdminPanel 
}) => {
    const { items, addToCart, cartItemCount } = useCart();
    const { role, currentUser, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Подгрузка шрифтов не встроена в этот файл, предполагается что они есть глобально.
    // Если Syncopate Cyr нету, он упадет до sans-serif (или нужно добавить import в css)

    return (
        <div className="min-h-screen bg-white relative flex flex-col font-['Helvetica',sans-serif]">
            
            {/* HABБAP (Navbar) */}
            <header className="w-full h-[67px] bg-white border-b border-black flex items-center px-4 sm:px-[3.47%] justify-between shrink-0 relative z-50">
                {/* Бургер меню */}
                <button className="flex items-center justify-center p-2 text-black hover:bg-gray-100 rounded-sm">
                    <Icons.Menu size={24} />
                </button>
                
                {/* Center Logo */}
                <div className="absolute left-1/2 -translate-x-1/2 font-['Syncopate_Cyr',sans-serif] font-bold text-xl uppercase tracking-widest cursor-pointer">
                    Лого
                </div>
                
                {/* Right Area */}
                <div className="flex items-center gap-4 text-black">
                    {role === 'ADMIN' && (
                        <button onClick={onAdminPanel} className="text-xs uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                            Админ
                        </button>
                    )}
                    
                    {role === 'GUEST' ? (
                        <button onClick={() => setIsAuthModalOpen(true)} className="text-xs uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                            Войти
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-sm border-r border-black pr-4 hidden sm:block">
                                {currentUser?.name}
                            </span>
                            <button onClick={logout} className="text-xs uppercase hover:underline">
                                Выйти
                            </button>
                        </div>
                    )}

                    <button className="p-2 hover:bg-gray-100 hidden sm:block border-x border-black">
                        <Icons.Grid size={20} />
                    </button>
                    
                    <button onClick={onViewCart} className="p-2 hover:bg-gray-100 relative group flex items-center">
                        <Icons.Cart size={20} />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-[77px] py-[74px]">
                
                {/* МОИ ПРОЕКТЫ TITLE */}
                <h1 
                    className="text-black uppercase mb-12"
                    style={{
                        fontFamily: "'Syncopate Cyr', sans-serif",
                        fontWeight: 400,
                        fontSize: '31px',
                        lineHeight: '28px'
                    }}
                >
                    Мои проекты
                </h1>

                {/* PROJECTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-[60px] gap-y-[60px] pb-24">
                    
                    {/* Project Cards */}
                    {projects.map((project) => (
                        <div 
                            key={project.id}
                            className="w-full max-w-[444px] h-[227px] bg-white border border-black flex overflow-hidden group hover:shadow-xl transition-shadow"
                        >
                            {/* Left Image Placeholder (Rectangle 99) */}
                            <div 
                                className="w-[212px] h-full shrink-0 flex items-center justify-center cursor-pointer relative group/img"
                                style={{ backgroundColor: '#CCCCCC' }}
                                onClick={() => onProjectSelect(project.id)}
                            >
                                {project.previewUrl ? (
                                    <img 
                                        src={project.previewUrl} 
                                        alt={project.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <Icons.Image className="text-gray-500 opacity-50" size={32} />
                                )}
                                {/* Delete Button on Image Hover */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-50 text-red-500 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity hover:bg-red-500 hover:text-white"
                                    title="Удалить проект"
                                >
                                    <Icons.Trash size={14} />
                                </button>
                            </div>
                            
                            {/* Right Info Details */}
                            <div className="flex-1 flex flex-col pt-[25px] pb-[16px] pl-[15px] pr-[20px] max-w-[232px]">
                                <h2 
                                    className="text-black uppercase truncate w-full"
                                    style={{
                                        fontFamily: "'Syncopate Cyr', sans-serif",
                                        fontWeight: 400,
                                        fontSize: '15px',
                                        lineHeight: '13px',
                                        letterSpacing: '-0.03em'
                                    }}
                                    title={project.name}
                                >
                                    {project.name}
                                </h2>
                                
                                <p 
                                    className="text-black mt-[16px]"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 400,
                                        fontSize: '13px',
                                        lineHeight: '16px'
                                    }}
                                >
                                    {project.pageCount} стр.
                                </p>
                                
                                <p 
                                    className="text-[#111111] mt-[7px]"
                                    style={{
                                        fontFamily: "'Syncopate Cyr', sans-serif",
                                        fontWeight: 400,
                                        fontSize: '15px',
                                        lineHeight: '13px'
                                    }}
                                >
                                    {project.price || '6500'}₽
                                </p>
                                
                                <div className="mt-auto flex flex-col gap-[11px]">
                                    {/* Button 2: Подробнее */}
                                    <button 
                                        onClick={() => onProjectSelect(project.id)}
                                        className="w-full h-[25px] border border-black flex items-center justify-center text-black hover:bg-gray-50 transition-colors uppercase"
                                        style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '10px', lineHeight: '11px' }}
                                    >
                                        Подробнее
                                    </button>
                                    
                                    {/* Button 1: Собрать */}
                                    <button 
                                        onClick={() => addToCart(project)}
                                        className="w-full h-[25px] bg-black flex items-center justify-center text-white hover:bg-white hover:text-black hover:border hover:border-black transition-colors uppercase box-border"
                                        style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '10px', lineHeight: '11px' }}
                                    >
                                        Собрать
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add Project Button */}
                    <div className="w-full max-w-[444px] h-[227px] flex items-center justify-center">
                        <button 
                            onClick={() => onNewProject('classic')}
                            className="w-[53px] h-[53px] rounded-full bg-[#F6F6F6] flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                            title="Добавить проект"
                        >
                            <Icons.Plus size={24} strokeWidth={1.5} className="text-black" />
                        </button>
                    </div>

                </div>
            </main>

            {/* ПОДВАЛ (Footer) */}
            <footer className="w-full min-h-[215px] border-t border-black bg-white flex flex-col md:flex-row items-center sm:items-start justify-between py-10 px-4 sm:px-[77px] gap-8 shrink-0">
                
                {/* Левые колонки ссылок (Каталог) */}
                <div className="flex flex-wrap gap-x-16 gap-y-4">
                    {/* Колонка 1 */}
                    <div className="flex flex-col gap-4">
                        {['Каталог', 'Каталог', 'Каталог', 'Каталог', 'Каталог'].map((link, i) => (
                            <a key={i} href="#" className="text-black hover:underline" style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '14px', lineHeight: '16px' }}>
                                {link}
                            </a>
                        ))}
                    </div>
                    {/* Колонка 2 */}
                     <div className="flex flex-col gap-4">
                        {['Каталог', 'Каталог'].map((link, i) => (
                            <a key={i} href="#" className="text-black hover:underline" style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '14px', lineHeight: '16px' }}>
                                {link}
                            </a>
                        ))}
                    </div>
                    {/* Колонка 3 */}
                     <div className="flex flex-col gap-4">
                        {['Каталог', 'Каталог'].map((link, i) => (
                            <a key={i} href="#" className="text-black hover:underline" style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '14px', lineHeight: '16px' }}>
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Правая часть с соцсетями и кнопками */}
                <div className="flex flex-col items-center sm:items-end gap-6">
                    {/* Соц сети */}
                    <div className="flex gap-4">
                        <a href="#" className="w-[42px] h-[42px] bg-gray-100 flex items-center justify-center rounded-sm hover:bg-gray-200 transition-colors" title="VK">
                            <span className="font-bold text-xs uppercase">VK</span>
                        </a>
                        <a href="#" className="w-[42px] h-[42px] bg-gray-100 flex items-center justify-center rounded-sm hover:bg-gray-200 transition-colors" title="TG">
                            <span className="font-bold text-xs uppercase">TG</span>
                        </a>
                    </div>
                    
                    {/* Две большие кнопки (Rectangle 97, 98) */}
                    <div className="flex gap-4">
                        <button className="h-[50px] px-8 border border-black bg-white hover:bg-black hover:text-white transition-colors" style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '20px', lineHeight: '23px' }}>
                            Каталог
                        </button>
                        <button className="h-[50px] px-8 border border-black bg-white hover:bg-black hover:text-white transition-colors" style={{ fontFamily: "'Helvetica', sans-serif", fontSize: '20px', lineHeight: '23px' }}>
                            Каталог
                        </button>
                    </div>
                </div>
            </footer>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};