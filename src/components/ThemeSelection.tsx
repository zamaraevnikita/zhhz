import React, { useState } from 'react';
import { THEMES } from '../themes';
import { ThemeConfig } from '../types';
import { Icons } from './IconComponents';

interface ThemeSelectionProps {
  onSelectTheme: (theme: ThemeConfig) => void;
  onBack: () => void;
}

const CATEGORIES = [
    { id: 'all', label: 'Все' },
    { id: 'lookbook', label: 'Лукбук' },
    { id: 'valentine', label: 'Любовь' },
    { id: 'memories', label: 'Память' },
    { id: 'travel', label: 'Тревел' },
    { id: 'year', label: 'Год' },
];

const Logo = () => (
    <div className="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-lg shadow-sm">
        <span className="text-white font-bold text-xl font-mono">P</span>
    </div>
);

export const ThemeSelection: React.FC<ThemeSelectionProps> = ({ onSelectTheme, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredThemes = THEMES.filter(theme => {
      const tid = theme.id;
      if (selectedCategory === 'all') return true;
      
      switch (selectedCategory) {
          case 'lookbook': return tid === 'lookbook' || tid === 'red_fabric';
          case 'valentine': return tid === 'valentine' || tid === 'red_fabric';
          case 'soulmates': return tid === 'valentine' || tid === 'memories'; 
          case 'memories': return tid === 'memories' || tid === 'year_2025' || tid === 'kavkaz' || tid === 'soulmates';
          case 'travel': return tid === 'kavkaz';
          case 'year': return tid === 'year_2025' || tid === 'astrology';
          default: return true;
      }
  });

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
       
       {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
            <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 hover:scale-105 transition-all shadow-sm"
            >
                <Icons.Back size={20} />
            </button>
            <Logo />
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-500">
                Выберите макет
            </span>
        </div>
        <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
                <Icons.Grid size={18} />
            </button>
        </div>
      </header>

      <div className="px-4 sm:px-8 py-8 sm:py-12 max-w-[1600px] mx-auto w-full relative z-10">

        {/* Categories Chips - Scrollable on mobile */}
        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-16 pb-4 sm:pb-0 sm:justify-center">
           {CATEGORIES.map(cat => (
             <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 border ${
                    selectedCategory === cat.id 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform sm:scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
             >
               {cat.label}
             </button>
           ))}
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredThemes.length > 0 ? (
              filteredThemes.map((theme, idx) => (
                <div 
                    key={theme.id} 
                    className="alabaster-card flex flex-col cursor-pointer group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => onSelectTheme(theme)}
                >
                  <div className="grain"></div>
                  
                  {/* Badge */}
                  {theme.badge && (
                        <div className="absolute top-6 -right-8 bg-[#4A3B3C] text-white py-1 w-32 text-center text-[10px] font-mono font-bold uppercase tracking-widest transform rotate-45 shadow-sm z-20">
                            {theme.badge}
                        </div>
                  )}

                  {/* Image Container */}
                  <div className="image-container aspect-[3/4] mb-5">
                    <img 
                        src={theme.previewImage} 
                        alt={theme.name} 
                        className="w-[90%] h-[90%] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-lg group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    />
                  </div>

                  {/* Info */}
                  <div className="relative z-10 flex-1 flex flex-col">
                       <span className="label-mono mb-2">
                           {theme.recommendedPages} Pages • {theme.colors.palette.length} Colors
                       </span>
                      <h3 className="product-title text-2xl mb-1">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-[#4A3B3C]/70 leading-relaxed font-medium mb-4 line-clamp-2">
                          {theme.description}
                      </p>
                      
                      <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#4A3B3C]/10">
                           <div className="price-tag mb-0 !text-sm">
                               {theme.price}
                           </div>
                           <button className="bg-[#4A3B3C] text-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                               <Icons.Plus size={14} />
                           </button>
                      </div>
                  </div>
                </div>
              ))
          ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-20 font-mono text-sm">
                  <p>В этой категории пока пусто.</p>
                  <button onClick={() => setSelectedCategory('all')} className="mt-4 text-gray-800 border-b border-gray-800 hover:opacity-70 pb-0.5 transition-colors">Показать все</button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};