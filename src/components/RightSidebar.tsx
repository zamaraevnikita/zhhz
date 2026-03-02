import React from 'react';
import { Spread, PageData, LayoutTemplate, SlotType, ThemeConfig } from '../types';
import { Icons } from './IconComponents';
import { SlotRenderer } from './SlotRenderer';

interface RightSidebarProps {
    spreads: Spread[];
    currentSpreadIndex: number;
    activePageSide: 'left' | 'right';
    onSelectSpread: (index: number, side?: 'left' | 'right') => void;
    onAddPages: () => void;
    onClearAll: () => void;
    totalPages: number;
    maxPages: number;
    layouts: LayoutTemplate[];
    theme: ThemeConfig;
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
const MiniPage: React.FC<{ page: PageData; layout?: LayoutTemplate; theme: ThemeConfig }> = ({ page, layout, theme }) => {
    if (page.type === 'flyleaf') {
        return (
            <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-full opacity-30 bg-repeat" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
            </div>
        );
    }

    // Default white if no layout found
    if (!layout) return <div className="w-full h-full bg-white"></div>;

    const renderSlot = (s: typeof layout.slots[0], idx: number) => {
        const content = page.content[s.id];
        const settings = page.slotSettings?.[s.id] || {};
        const isText = s.type === SlotType.TEXT;

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
            // we let SlotRenderer manage the inner radius but we border-radius the outer bounds too for rect slots
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
                {/* 
                  Use SlotRenderer here for the visual implementation 
                  scaleFactor={0.15} is an approx ratio for a ~180px thumbnail from a 1200px master (180/1200 = 0.15) 
                */}
                <SlotRenderer
                    slot={s}
                    content={content}
                    settings={settings}
                    theme={theme}
                    scaleFactor={0.15}
                    isExporting={true} // True forces precise pixel rendering instead of viewport relative
                />
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
    activePageSide,
    onSelectSpread,
    onAddPages,
    onClearAll,
    totalPages,
    maxPages,
    layouts,
    theme,
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
                                    onClick={() => onSelectSpread(idx, 'right')}
                                    className={`flex transition-all bg-white p-2 shadow-sm relative
                                ${isSelected && activePageSide === 'right'
                                            ? 'ring-2 ring-blue-400'
                                            : 'hover:ring-1 hover:ring-gray-300'
                                        }
                            `}
                                    style={{ width: '50%', aspectRatio: '1 / 1.414' }} // A4 Vertical
                                >
                                    <div className="w-full h-full border border-gray-200">
                                        <MiniPage page={spread.rightPage} layout={layoutRight} theme={theme} />
                                    </div>
                                    {isSelected && activePageSide === 'right' && (
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                                    )}
                                </button>
                                <span className="text-[10px] text-gray-400 font-medium">Обложка</span>
                            </div>
                        )
                    }

                    // SPREADS
                    return (
                        <div key={spread.id} className="flex flex-col gap-2 items-center">
                            <div
                                className={`w-full flex transition-all bg-white p-1 shadow-sm relative
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
                                    <button
                                        onClick={() => onSelectSpread(idx, 'left')}
                                        className={`flex-1 overflow-hidden relative border-r transition-all ${isSelected && activePageSide === 'left' ? 'ring-2 ring-blue-500 z-10 scale-[1.02] shadow-md' : 'hover:bg-black/5 block'}`}
                                    >
                                        <MiniPage page={spread.leftPage} layout={layoutLeft} theme={theme} />
                                    </button>
                                    <button
                                        onClick={() => onSelectSpread(idx, 'right')}
                                        className={`flex-1 overflow-hidden relative transition-all ${isSelected && activePageSide === 'right' ? 'ring-2 ring-blue-500 z-10 scale-[1.02] shadow-md' : 'hover:bg-black/5 block'}`}
                                    >
                                        <MiniPage page={spread.rightPage} layout={layoutRight} theme={theme} />
                                    </button>
                                </div>
                            </div>

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