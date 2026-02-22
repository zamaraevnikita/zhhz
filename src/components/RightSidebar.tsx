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

// Helper to scale down Tailwind classes for thumbnails
const scaleTailwindClasses = (classes: string = '') => {
    return classes
        .replace(/\bp-\[[^\]]+\]/g, 'p-[2px]') // p-[...]
        .replace(/\bp-(\d+|px)\b/g, 'p-[2px]') // p-4, p-6, p-px (but NOT place-items...)
        .replace(/\bgap-(\d+|px)\b/g, 'gap-[1px]') // gap-4
        .replace(/\b(pt|pb|pl|pr|px|py)-(\d+|px)\b/g, (match) => {
            const prefix = match.split('-')[0];
            return `${prefix}-[1px]`;
        })
        .replace(/\bborder-\[\d+px\]/g, 'border-[0.5px]') // border-[12px] -> border-[0.5px]
        .replace(/\bshadow-(sm|md|lg|xl|2xl|inner|none)\b/g, 'shadow-sm')
        .replace(/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/g, 'rounded-[1px]');
};

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

    const getFilterCSS = (filterMode: string) => {
        if (filterMode === 'grayscale') return 'grayscale(100%)';
        if (filterMode === 'sepia') return 'sepia(100%)';
        if (filterMode === 'contrast') return 'contrast(150%)';
        return 'none';
    };

    const renderSlot = (s: typeof layout.slots[0], idx: number) => {
        const content = page.content[s.id];
        const settings = page.slotSettings?.[s.id] || {};
        const isText = s.type === SlotType.TEXT;
        const fitMode = settings.fit || 'cover';
        const filterMode = settings.filter || 'none';
        const cropX = settings.cropX ?? 50;
        const cropY = settings.cropY ?? 50;

        // Scale slot specific classes
        const scaledSlotClass = scaleTailwindClasses(s.className);

        // Base style for the slot container
        const slotStyle: React.CSSProperties = s.rect ? {
            position: 'absolute',
            left: `${s.rect.x}%`,
            top: `${s.rect.y}%`,
            width: `${s.rect.w}%`,
            height: `${s.rect.h}%`,
            transform: `rotate(${s.rotation || 0}deg)`,
            transformOrigin: 'center center',
            opacity: s.opacity ?? 1,
            zIndex: s.zIndex || 0,
            borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined, 
        } : {};

        return (
            <div
                key={s.id || idx}
                className={`${s.rect ? '' : scaledSlotClass} relative overflow-hidden`}
                style={{
                    ...slotStyle,
                    backgroundColor: content ? 'transparent' : (isText ? 'transparent' : 'rgba(0,0,0,0.05)')
                }}
            >
                {content && !isText && (
                    <img
                        src={content}
                        className={`absolute inset-0 w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                        style={{
                            objectPosition: `${cropX}% ${cropY}%`,
                            filter: getFilterCSS(filterMode),
                            borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                        }}
                        alt=""
                    />
                )}
                {content && isText && (
                    <div
                        className="absolute inset-0 w-full h-full break-words overflow-hidden p-[1px]"
                        style={{
                            color: settings.color || '#1f2937',
                            fontFamily: settings.fontFamily || 'inherit',
                            fontWeight: (settings.fontWeight as any) || 'normal',
                            fontStyle: settings.fontStyle || 'normal',
                            textAlign: (settings.align as any) || 'left',
                            textTransform: settings.uppercase ? 'uppercase' : 'none',
                            // Typography scaling
                            fontSize: settings.fontSize ? `${settings.fontSize / 5.2}cqw` : '3.5cqw',
                            lineHeight: settings.lineHeight || 1.4,
                            letterSpacing: settings.letterSpacing ? `${settings.letterSpacing}em` : 'normal',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {content}
                    </div>
                )}
            </div>
        );
    };

    const scaledGridConfig = layout.isCustom ? '' : scaleTailwindClasses(layout.gridConfig);

    return (
        <div 
            className="w-full h-full relative bg-white overflow-hidden" 
            style={{ 
                backgroundColor: page.backgroundColor,
                containerType: 'inline-size' as any 
            }}
        >
            {layout.backgroundImage && (
                <img src={layout.backgroundImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
            )}

            {layout.isCustom ? (
                <div className="relative w-full h-full">
                    {layout.slots.filter(s => s.rect).map((s, i) => renderSlot(s, i))}
                </div>
            ) : (
                <div className={`w-full h-full ${scaledGridConfig}`}>
                    {layout.slots.map((s, i) => renderSlot(s, i))}
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
        <div className="w-full bg-white flex flex-col h-full flex-shrink-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Страницы</span>
            </div>
            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar">

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

            <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                <button
                    onClick={onClearAll}
                    className="w-full py-2 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-700 text-[11px] font-medium rounded-lg transition-colors"
                >
                    Очистить все страницы
                </button>
            </div>
        </div>
    );
};