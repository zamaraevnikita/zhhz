import React from 'react';
import { Project } from '../types';
import { Icons } from './IconComponents';

interface DashboardProps {
  projects: Project[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
}

const Logo = () => (
    <div className="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-lg shadow-sm">
        <span className="text-white font-bold text-xl font-mono">P</span>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateProject, onEditProject }) => {
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
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
                <Icons.Grid size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
                <Icons.Cart size={18} />
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
                onClick={onCreateProject}
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
                <button onClick={onCreateProject} className="text-gray-900 font-bold border-b-2 border-gray-900 hover:opacity-70 transition-opacity pb-1 text-sm tracking-wide">
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
                                    onClick={() => onEditProject(project)}
                                    className="cta-button flex-1"
                                >
                                    ИЗМЕНИТЬ
                                    <Icons.Edit size={14} />
                                </button>
                                <button className="cta-button-secondary" title="В корзину">
                                    <Icons.Cart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
};