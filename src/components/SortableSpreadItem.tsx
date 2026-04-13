import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Spread, LayoutTemplate, ThemeConfig } from '../types';
import { PageRenderer } from './PageRenderer';
import { StaticPageRenderer } from './StaticPageRenderer';
import { Icons } from './IconComponents';

interface SortableSpreadItemProps {
    id: string; // The dnd-kit unique identifier
    spread: Spread;
    idx: number;
    isSelected: boolean;
    activePageSide: 'left' | 'right';
    labelLeft: string;
    labelRight: string;
    layoutLeft?: LayoutTemplate;
    layoutRight?: LayoutTemplate;
    theme: ThemeConfig;
    onSelectSpread: (index: number, side?: 'left' | 'right') => void;
}

export const SortableSpreadItem: React.FC<SortableSpreadItemProps> = ({
    id,
    spread,
    idx,
    isSelected,
    activePageSide,
    labelLeft,
    labelRight,
    layoutLeft,
    layoutRight,
    theme,
    onSelectSpread,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original element completely, keep space
        position: 'relative' as const,
        zIndex: isDragging ? 10 : 1,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col gap-2 items-center group relative">
            
            {/* Drag Handle (Hover to see) */}
            <div 
                {...attributes} 
                {...listeners} 
                className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 shadow-sm rounded-md p-0.5 cursor-grab active:cursor-grabbing z-20"
                title="Перетащите, чтобы изменить порядок"
            >
                <Icons.GripVertical size={14} className="text-gray-400" />
            </div>

            <div
                className={`w-full flex transition-all bg-white p-1 shadow-sm relative
            ${isSelected
                        ? 'ring-2 ring-blue-400'
                        : 'hover:ring-1 hover:ring-gray-300'
                    }
        `}
            >
                {/* Thumbnail Visuals */}
                <div className="w-full h-full flex gap-1 bg-gray-50 border border-gray-200">
                    {/* Left Page Thumbnail */}
                    <button
                        onClick={() => onSelectSpread(idx, 'left')}
                        className={`flex-1 overflow-hidden relative border-r transition-all ${isSelected && activePageSide === 'left' ? 'ring-2 ring-blue-500 z-10 scale-[1.02] shadow-md' : 'hover:bg-black/5 block'}`}
                    >
                        <PageRenderer 
                            pageData={spread.leftPage} 
                            isSelected={false}
                            onSelect={() => {}}
                            selectedSlotId={null}
                            onSelectSlot={() => {}}
                            onUpdateContent={() => {}}
                            onUpdateSettings={() => {}}
                            theme={theme}
                            customLayouts={layoutLeft ? [layoutLeft] : []}
                            readOnly={true}
                        />
                    </button>
                    <button
                        onClick={() => onSelectSpread(idx, 'right')}
                        className={`flex-1 overflow-hidden relative transition-all ${isSelected && activePageSide === 'right' ? 'ring-2 ring-blue-500 z-10 scale-[1.02] shadow-md' : 'hover:bg-black/5 block'}`}
                    >
                        <PageRenderer 
                            pageData={spread.rightPage} 
                            isSelected={false}
                            onSelect={() => {}}
                            selectedSlotId={null}
                            onSelectSlot={() => {}}
                            onUpdateContent={() => {}}
                            onUpdateSettings={() => {}}
                            theme={theme}
                            customLayouts={layoutRight ? [layoutRight] : []}
                            readOnly={true}
                        />
                    </button>
                </div>
            </div>

            {/* Labels */}
            <div className="w-full flex justify-between px-1 text-[10px] text-gray-400 font-medium select-none pointer-events-none">
                <span>{labelLeft}</span>
                <span>{labelRight}</span>
            </div>
        </div>
    );
};
