import React from 'react';
import { Spread, PageData, LayoutTemplate, SlotType } from '../types';
import { Icons } from './IconComponents';

interface RightSidebarProps {
  spreads: Spread[];
  currentSpreadIndex: number;
  onSelectSpread: (index: number) => void;
  onAddPages: () => void;
  onClearAll: () => void;
  totalPages: number;
  maxPages: number;
  layouts: LayoutTemplate[];
  onClose?: () => void;
}

// Helper component for thumbnail page
const MiniPage: React.FC<{ page: PageData; layout?: LayoutTemplate }> = ({ page, layout }) => {
    if (page.type === 'flyleaf') {
        return (
            <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-full opacity-30 bg-repeat" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
            </div>
        );
    }

    // Default white if no layout found
    if (!layout) return <div className="w-full h-full bg-white"></div>;

    return (
        <div className="w-full h-full relative bg-white overflow-hidden" style={{ backgroundColor: page.backgroundColor }}>
            {/* BG Image */}
            {layout.backgroundImage && (
                <img src={layout.backgroundImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
            )}

            {/* Custom Layout (Absolute) */}
            {layout.isCustom && (
                 <div className="relative w-full h-full">
                    {layout.slots.map(s => {
                         const content = page.content[s.id];
                         const isText = s.type === SlotType.TEXT;
                         if (!s.rect) return null;
                         return (
                             <div 
                                key={s.id}
                                className="absolute flex items-center justify-center overflow-hidden"
                                style={{
                                    left: `${s.rect.x}%`,
                                    top: `${s.rect.y}%`,
                                    width: `${s.rect.w}%`,
                                    height: `${s.rect.h}%`,
                                    transform: `rotate(${s.rotation || 0}deg)`,
                                    backgroundColor: content ? 'transparent' : (isText ? 'transparent' : 'rgba(0,0,0,0.05)')
                                }}
                             >
                                 {content && !isText && (
                                     <img src={content} className="w-full h-full object-cover" alt="" />
                                 )}
                                 {content && isText && (
                                     <div className="w-full h-full text-[2px] leading-tight text-gray-800 break-words overflow-hidden p-[1px]">
                                         {content}
                                     </div>
                                 )}
                             </div>
                         )
                    })}
                 </div>
            )}

            {/* Grid Layout (CSS Grid) */}
            {!layout.isCustom && (
                <div className={`w-full h-full grid ${layout.gridConfig} gap-[1px] p-[2px]`}>
                    {layout.slots.map((s, i) => {
                         const content = page.content[s.id];
                         const isText = s.type === SlotType.TEXT;
                         return (
                             <div 
                                key={i} 
                                className={`${s.className} flex items-center justify-center overflow-hidden`}
                                style={{ backgroundColor: content ? 'transparent' : (isText ? 'transparent' : 'rgba(0,0,0,0.05)') }}
                             >
                                 {content && !isText && (
                                     <img src={content} className="w-full h-full object-cover" alt="" />
                                 )}
                                 {content && isText && (
                                      <div className="w-full h-full text-[2px] leading-tight text-gray-800 break-words overflow-hidden p-[1px]">
                                         {content}
                                     </div>
                                 )}
                             </div>
                         )
                    })}
                </div>
            )}
        </div>
    )
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  spreads,
  currentSpreadIndex,
  onSelectSpread,
  onAddPages,
  onClearAll,
  totalPages,
  maxPages,
  layouts,
  onClose
}) => {
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-3 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">Страницы</span>
        </div>
        {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        
        {spreads.map((spread, idx) => {
             const isCover = idx === 0;
             const isFlyleaf = idx === 1;
             const isSelected = idx === currentSpreadIndex;
             
             let labelLeft = '';
             let labelRight = '';

             if (isCover) {
                 labelLeft = 'Обложка';
             } else if (isFlyleaf) {
                 labelLeft = 'Форзац';
                 labelRight = '1';
             } else {
                 // Standard calculation
                 const pLeft = (idx - 1) * 2;
                 const pRight = (idx - 1) * 2 + 1;
                 
                 labelLeft = pLeft.toString();
                 labelRight = pRight.toString();

                 // If last page is flyleaf, override label
                 if (spread.rightPage.type === 'flyleaf') {
                     labelRight = 'Форзац';
                 }
             }

             // Find layouts
             const layoutLeft = layouts.find(l => l.id === spread.leftPage.layoutId);
             const layoutRight = layouts.find(l => l.id === spread.rightPage.layoutId);

             // COVER: Special Single Page Rendering
             if (isCover) {
                 return (
                     <div key={spread.id} className="flex flex-col gap-2 items-center">
                        <button
                            onClick={() => onSelectSpread(idx)}
                            className={`flex transition-all bg-white p-2 shadow-sm
                                ${isSelected 
                                    ? 'ring-2 ring-blue-400' 
                                    : 'hover:ring-1 hover:ring-gray-300'
                                }
                            `}
                            style={{ width: '50%', aspectRatio: '1 / 1.414' }} // A4 Vertical
                        >
                             <div className="w-full h-full border border-gray-200">
                                 <MiniPage page={spread.rightPage} layout={layoutRight} />
                             </div>
                        </button>
                         <span className="text-[10px] text-gray-400 font-medium">Обложка</span>
                     </div>
                 )
             }

             // SPREADS
             return (
                 <div key={spread.id} className="flex flex-col gap-2 items-center">
                    <button
                        onClick={() => onSelectSpread(idx)}
                        className={`w-full flex transition-all bg-white p-1 shadow-sm
                            ${isSelected 
                                    ? 'ring-2 ring-blue-400' 
                                    : 'hover:ring-1 hover:ring-gray-300'
                            }
                        `}
                        style={{ aspectRatio: '1.414 / 1' }}
                    >
                         {/* Thumbnail Visuals */}
                        <div className="w-full h-full flex gap-1 bg-gray-50 border border-gray-200">
                             {/* Left Page Thumbnail */}
                             <div className="flex-1 h-full bg-white relative">
                                  <MiniPage page={spread.leftPage} layout={layoutLeft} />
                             </div>
                             
                             {/* Right Page Thumbnail */}
                             <div className="flex-1 h-full bg-white relative">
                                  <MiniPage page={spread.rightPage} layout={layoutRight} />
                             </div>
                        </div>
                    </button>
                    
                    {/* Labels */}
                    <div className="w-full flex justify-between px-1 text-[10px] text-gray-400 font-medium">
                        <span>{labelLeft}</span>
                        <span>{labelRight}</span>
                    </div>
                 </div>
             )
        })}

        {/* Add Pages Button */}
        {totalPages < maxPages && (
            <div className="pt-2">
                <button
                    onClick={onAddPages}
                    className="w-full h-16 border border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <Icons.Plus size={20} />
                </button>
            </div>
        )}

      </div>

      <div className="p-6 border-t border-gray-100 bg-white">
          <button 
            onClick={onClearAll}
            className="w-full py-3 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-900 text-xs font-medium rounded-sm transition-colors"
          >
              Очистить все страницы
          </button>
      </div>
    </div>
  );
};