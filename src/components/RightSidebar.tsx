import React from 'react';
import { createPortal } from 'react-dom';
import { Spread, PageData, LayoutTemplate, SlotType, ThemeConfig } from '../types';
import { Icons } from './IconComponents';
import { PageRenderer } from './PageRenderer';
import { SortableSpreadItem } from './SortableSpreadItem';
import { StaticPageRenderer } from './StaticPageRenderer';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

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
    onReorderSpreads: (oldIndex: number, newIndex: number) => void;
    onClose?: () => void;
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
    onReorderSpreads,
    onClose
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [overlayWidth, setOverlayWidth] = React.useState<number | undefined>();
    const containerRef = React.useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        if (containerRef.current) {
            setOverlayWidth(containerRef.current.clientWidth - 24);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = spreads.findIndex(s => s.id === active.id);
            const newIndex = spreads.findIndex(s => s.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                onReorderSpreads(oldIndex, newIndex);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const activeSpreadIndex = activeId ? spreads.findIndex(s => s.id === activeId) : -1;
    const activeSpread = activeSpreadIndex !== -1 ? spreads[activeSpreadIndex] : null;

    const getLabelsForSpread = (spread: Spread, idx: number) => {
        if (idx === 0) return { left: 'Обложка', right: '' };
        if (idx === 1) return { left: 'Форзац', right: '1' };
        
        const pLeft = (idx - 1) * 2;
        const pRight = (idx - 1) * 2 + 1;
        
        let labelRight = pRight.toString();
        if (spread.rightPage.type === 'flyleaf') {
            labelRight = 'Форзац';
        }
        return { left: pLeft.toString(), right: labelRight };
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToWindowEdges]}
        >
            <div className="w-full bg-white flex flex-col h-full flex-shrink-0 overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Страницы</span>
                    {onClose && (
                        <button onClick={onClose} className="ml-auto p-1 hover:bg-gray-100 rounded-full lg:hidden">
                            <Icons.Close size={16} />
                        </button>
                    )}
                </div>

                {/* Navigation Content */}
                <div 
                    ref={containerRef} 
                    className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar"
                >
                    <SortableContext 
                        items={spreads.slice(1).map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {spreads.map((spread, idx) => {
                            const isCover = idx === 0;
                            const isSelected = idx === currentSpreadIndex;
                            const { left: labelLeft, right: labelRight } = getLabelsForSpread(spread, idx);

                            const layoutLeft = layouts.find(l => l.id === spread.leftPage.layoutId);
                            const layoutRight = layouts.find(l => l.id === spread.rightPage.layoutId);

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
                                            style={{ width: '50%' }}
                                        >
                                            <div className="w-full h-full border border-gray-200">
                                                <PageRenderer 
                                                    pageData={spread.rightPage} 
                                                    isSelected={false}
                                                    onSelect={() => {}}
                                                    selectedSlotId={null}
                                                    onSelectSlot={() => {}}
                                                    onUpdateContent={() => {}}
                                                    onUpdateSettings={() => {}}
                                                    theme={theme}
                                                    customLayouts={layouts}
                                                    readOnly={true}
                                                />
                                            </div>
                                            {isSelected && activePageSide === 'right' && (
                                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                        </button>
                                        <span className="text-[10px] text-gray-400 font-medium">Обложка</span>
                                    </div>
                                );
                            }

                            return (
                                <SortableSpreadItem 
                                    key={spread.id}
                                    id={spread.id}
                                    spread={spread}
                                    idx={idx}
                                    isSelected={isSelected}
                                    activePageSide={activePageSide}
                                    labelLeft={labelLeft}
                                    labelRight={labelRight}
                                    layoutLeft={layoutLeft}
                                    layoutRight={layoutRight}
                                    theme={theme}
                                    onSelectSpread={onSelectSpread}
                                />
                            );
                        })}
                    </SortableContext>

                    {/* Add Pages Button */}
                    {totalPages < maxPages && (
                        <div className="pt-2">
                            <button
                                onClick={onAddPages}
                                className="w-full h-16 border border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-all font-medium text-xs sm:text-sm"
                            >
                                <Icons.Plus size={20} />
                                <span>Добавить разворот</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Action */}
                <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={onClearAll}
                        className="w-full py-2 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-700 text-[11px] font-medium rounded-lg transition-colors"
                    >
                        Очистить все страницы
                    </button>
                </div>
            </div>

            {/* Drag Overlay Portal */}
            {typeof document !== 'undefined' && createPortal(
                <DragOverlay dropAnimation={dropAnimation} style={{ zIndex: 9999 }}>
                    {activeSpread ? (() => {
                        const { left: lblLeft, right: lblRight } = getLabelsForSpread(activeSpread, activeSpreadIndex);
                        const layoutLeft = layouts.find(l => l.id === activeSpread.leftPage.layoutId);
                        const layoutRight = layouts.find(l => l.id === activeSpread.rightPage.layoutId);
                        const width = overlayWidth || 200;
                        const height = width / 1.414;
                        
                        return (
                            <div 
                                style={{ 
                                    width: `${width}px`,
                                    height: `${height}px`,
                                    pointerEvents: 'none',
                                }}
                                className="flex flex-col gap-2 items-center cursor-grabbing shadow-2xl opacity-100"
                            >
                                <div
                                    className="w-full h-full flex bg-white p-1 shadow-md relative ring-4 ring-blue-500 rounded-sm"
                                >
                                    <div className="w-full h-full flex gap-1 bg-white border border-gray-200">
                                         <div className="flex-1 overflow-hidden relative border-r">
                                            <StaticPageRenderer 
                                                pageData={activeSpread.leftPage} 
                                                theme={theme}
                                                customLayouts={layoutLeft ? [layoutLeft] : []}
                                            />
                                         </div>
                                         <div className="flex-1 overflow-hidden relative">
                                            <StaticPageRenderer 
                                                pageData={activeSpread.rightPage} 
                                                theme={theme}
                                                customLayouts={layoutRight ? [layoutRight] : []}
                                            />
                                         </div>
                                    </div>
                                </div>
                                <div className="w-full flex justify-between px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[9px] uppercase tracking-tighter text-blue-600 font-bold shadow-sm">
                                    <span>{lblLeft}</span>
                                    <span>{lblRight}</span>
                                </div>
                            </div>
                        );
                    })() : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};