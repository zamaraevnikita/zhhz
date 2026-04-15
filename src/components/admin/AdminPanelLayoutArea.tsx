import React from 'react';
import { Icons } from '../IconComponents';
import { SlotType, LayoutTemplate } from '../../types';
import {
    Plus, Grid3X3, Magnet, AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart, AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd, Columns2, Rows2, Move, Maximize2,
    Image as ImageIcon, Type, Lock, RotateCw, MousePointer
} from 'lucide-react';
import { ToolBtn } from './AdminLayoutSidebar';

interface AdminPanelLayoutAreaProps {
    admin: any;
    editingLayout: LayoutTemplate;
    activeSlotId: string | null;
    activeSlot: LayoutTemplate['slots'][0] | null;
}

export const AdminPanelLayoutArea: React.FC<AdminPanelLayoutAreaProps> = ({
    admin,
    editingLayout,
    activeSlotId,
    activeSlot
}) => {
    return (
        <div
            className="flex-1 bg-zinc-950/20 relative overflow-hidden flex flex-col"
            onClick={(e) => {
                if (!(e.target as HTMLElement).closest('[data-slot-id]')) admin.setActiveSlotId(null);
            }}
        >
            {/* Top Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 bg-zinc-900/40 backdrop-blur-3xl border-b border-white/5 flex-shrink-0 z-10">
                {/* Zoom */}
                <div className="flex items-center gap-1 pr-3 border-r border-white/10">
                    {[50, 75, 100].map(z => (
                        <ToolBtn key={z} onClick={() => admin.setZoom(z)} active={admin.zoom === z} title={`Масштаб ${z}%`}>
                            <span className="text-[10px] font-bold w-6 text-center">{z}%</span>
                        </ToolBtn>
                    ))}
                </div>

                {/* Grid & Snap */}
                <div className="flex items-center gap-1 px-3 border-r border-white/10">
                    <button onClick={admin.startNewLayout} className="px-3 mr-2 font-bold text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors border border-blue-500/20 py-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Plus size={12} /> Новый
                    </button>
                    <ToolBtn onClick={() => admin.setShowGrid((v: boolean) => !v)} active={admin.showGrid} title="Сетка">
                        <Grid3X3 size={14} />
                    </ToolBtn>
                    <ToolBtn onClick={() => admin.setSnapEnabled((v: boolean) => !v)} active={admin.snapEnabled} title="Привязка к направляющим">
                        <Magnet size={14} />
                    </ToolBtn>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 px-3 border-r border-white/10">
                    <ToolBtn onClick={() => admin.alignSlots('left')} disabled={!activeSlot} title="По левому краю"><AlignHorizontalJustifyStart size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.alignSlots('center-x')} disabled={!activeSlot} title="По центру горизонтально"><AlignHorizontalJustifyCenter size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.alignSlots('right')} disabled={!activeSlot} title="По правому краю"><AlignHorizontalJustifyEnd size={14} /></ToolBtn>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <ToolBtn onClick={() => admin.alignSlots('top')} disabled={!activeSlot} title="По верхнему краю"><AlignVerticalJustifyStart size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.alignSlots('center-y')} disabled={!activeSlot} title="По центру вертикально"><AlignVerticalJustifyCenter size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.alignSlots('bottom')} disabled={!activeSlot} title="По нижнему краю"><AlignVerticalJustifyEnd size={14} /></ToolBtn>
                </div>

                {/* Distribution */}
                <div className="flex items-center gap-0.5 px-3 border-r border-white/10">
                    <ToolBtn onClick={() => admin.distributeSlots('horizontal')} disabled={editingLayout.slots.length < 3} title="Распределить горизонтально (3+ слотов)"><Columns2 size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.distributeSlots('vertical')} disabled={editingLayout.slots.length < 3} title="Распределить вертикально (3+ слотов)"><Rows2 size={14} /></ToolBtn>
                </div>

                {/* Center & Full */}
                <div className="flex items-center gap-0.5 px-3">
                    <ToolBtn onClick={() => admin.centerSlot()} disabled={!activeSlot} title="Центрировать"><Move size={14} /></ToolBtn>
                    <ToolBtn onClick={() => admin.resetSlotToFull()} disabled={!activeSlot} title="На всю страницу"><Maximize2 size={14} /></ToolBtn>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Keyboard hint */}
                <div className="text-[9px] text-gray-600 flex items-center gap-3">
                    <span>Del — удалить</span>
                    <span>⌘D — копия</span>
                    <span>↑↓←→ — двигать</span>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-6">
                <div
                    ref={admin.containerRef}
                    className={`bg-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0 relative ${!editingLayout.isCustom ? editingLayout.gridConfig : ''}`}
                    style={{
                        width: admin.CANVAS_W * (admin.zoom / 100),
                        height: admin.CANVAS_H * (admin.zoom / 100),
                        backgroundImage: editingLayout.backgroundImage ? `url(${editingLayout.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        containerType: 'inline-size' as any,
                    }}
                    onMouseMove={admin.handleCanvasMouseMove}
                    onMouseLeave={admin.handleCanvasMouseLeave}
                >
                    {/* Grid Overlay */}
                    {admin.showGrid && (
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 pointer-events-none opacity-[0.04]">
                            {Array.from({ length: 48 }).map((_, i) => <div key={i} className="border border-black"></div>)}
                        </div>
                    )}

                    {/* Center guides (always visible, very subtle) */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-400/10" />
                        <div className="absolute left-0 right-0 top-1/2 h-px bg-blue-400/10" />
                    </div>

                    {/* Snap guides */}
                    <div ref={admin.snapLinesContainerRef} className="absolute inset-0 pointer-events-none z-40" />

                    {/* Slots */}
                    {editingLayout.slots.map((slot: any) => {
                        const isGridSlot = !editingLayout.isCustom && !slot.rect;
                        return (
                            <div
                                key={slot.id}
                                data-slot-id={slot.id}
                                className={`group transition-shadow ${isGridSlot ? slot.className : 'absolute'} ${activeSlotId === slot.id
                                    ? 'z-50 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'z-10 ring-1 ring-gray-300/50 hover:ring-blue-400/50'
                                    } ${isGridSlot ? 'relative min-h-[50px] min-w-[50px] overflow-hidden' : ''}`}
                                style={{
                                    ...(isGridSlot ? {
                                        backgroundColor: slot.type === SlotType.IMAGE ? 'rgba(59, 130, 246, 0.06)' : 'rgba(245, 158, 11, 0.06)'
                                    } : {
                                        left: `${slot.rect?.x}%`,
                                        top: `${slot.rect?.y}%`,
                                        width: `${slot.rect?.w}%`,
                                        height: `${slot.rect?.h}%`,
                                        transform: `rotate(${slot.rotation || 0}deg)`,
                                        transformOrigin: 'center center',
                                        opacity: slot.opacity ?? 1,
                                        borderRadius: `${slot.borderRadius || 0}px`,
                                        backgroundColor: slot.type === SlotType.IMAGE ? 'rgba(59, 130, 246, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                                        cursor: slot.locked ? 'not-allowed' : 'move'
                                    })
                                }}
                                onMouseDown={isGridSlot ? (e) => { e.stopPropagation(); admin.setActiveSlotId(slot.id); } : (e) => admin.handleMouseDown(e, slot, 'move')}
                            >
                                {/* Slot Type Label - centered */}
                                {!slot.defaultContent && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none p-2">
                                        {slot.type === SlotType.IMAGE ? (
                                            <>
                                                <ImageIcon size={isGridSlot ? 32 : Math.min(32, admin.CANVAS_W * (admin.zoom / 100) * (slot.rect?.w || 50) / 100 / 5)} className="text-blue-400/40" />
                                                <span className="text-[10px] font-bold text-blue-400/40 mt-1 uppercase tracking-wider">Фото</span>
                                            </>
                                        ) : (
                                            <>
                                                <Type size={isGridSlot ? 32 : Math.min(32, admin.CANVAS_W * (admin.zoom / 100) * (slot.rect?.w || 50) / 100 / 5)} className="text-amber-400/40" />
                                                <span className="text-[10px] font-bold text-amber-400/40 mt-1 uppercase tracking-wider">Текст</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Status Icons */}
                                <div className="absolute top-1 left-1 flex gap-1 z-50">
                                    {slot.locked && <Lock size={9} className="text-blue-500" />}
                                </div>

                                {/* Size label on hover */}
                                <div className="absolute -bottom-5 left-0 text-[8px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {isGridSlot ? 'CSS Grid' : `${Math.round(slot.rect?.w || 0)}% × ${Math.round(slot.rect?.h || 0)}%`}
                                </div>

                                {/* Default content preview */}
                                {slot.defaultContent && (
                                    <div
                                        className={`absolute inset-0 overflow-hidden flex ${slot.type === SlotType.TEXT ? 'flex-col' : ''} p-0 ${slot.type === SlotType.IMAGE && activeSlotId === slot.id && !slot.locked && !isGridSlot ? 'pointer-events-auto cursor-move' : 'pointer-events-none'}`}
                                        style={{
                                            borderRadius: `${slot.borderRadius || 0}px`,
                                            alignItems: slot.type === SlotType.TEXT ? 'stretch' : 'center',
                                            justifyContent: slot.type === SlotType.TEXT
                                                ? (slot.defaultSettings?.verticalAlign === 'bottom' ? 'flex-end' : slot.defaultSettings?.verticalAlign === 'center' ? 'center' : 'flex-start')
                                                : 'center',
                                        }}
                                        onMouseDown={slot.type === SlotType.IMAGE && !isGridSlot ? (e) => admin.handleImagePositionMouseDown(e, slot) : undefined}
                                    >
                                        {slot.type === SlotType.IMAGE ? (
                                            <img
                                                src={slot.defaultContent}
                                                alt=""
                                                className="w-full h-full object-cover select-none"
                                                style={{ objectPosition: `${slot.defaultContentPosition?.x ?? 50}% ${slot.defaultContentPosition?.y ?? 50}%` }}
                                                draggable={false}
                                            />
                                        ) : (
                                            <span className="text-[10px] leading-tight overflow-hidden p-1 w-full" style={{
                                                whiteSpace: 'pre-wrap',
                                                fontFamily: slot.defaultSettings?.fontFamily || undefined,
                                                fontSize: slot.defaultSettings?.fontSize ? `${slot.defaultSettings.fontSize / 5.2}cqw` : '10px',
                                                fontWeight: slot.defaultSettings?.fontWeight || 'normal',
                                                fontStyle: slot.defaultSettings?.fontStyle || 'normal',
                                                color: slot.defaultSettings?.color || '#1a1a1a',
                                                textAlign: slot.defaultSettings?.align || 'center',
                                                textTransform: slot.defaultSettings?.uppercase ? 'uppercase' : 'none',
                                                lineHeight: slot.defaultSettings?.lineHeight || 1.5,
                                                letterSpacing: slot.defaultSettings?.letterSpacing ? `${slot.defaultSettings.letterSpacing}em` : undefined,
                                            }}>{slot.defaultContent}</span>
                                        )}
                                    </div>
                                )}

                                {/* Resize & Rotate handles */}
                                {activeSlotId === slot.id && !slot.locked && !isGridSlot && (
                                    <>
                                        {/* 4-corner resize */}
                                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md z-50" onMouseDown={(e) => admin.handleMouseDown(e, slot, 'resize')} />
                                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-md z-50" onMouseDown={(e) => admin.handleMouseDown(e, slot, 'resize-tl')} />
                                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-md z-50" onMouseDown={(e) => admin.handleMouseDown(e, slot, 'resize-tr')} />
                                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-md z-50" onMouseDown={(e) => admin.handleMouseDown(e, slot, 'resize-bl')} />
                                        {/* Rotate handle */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-alias text-gray-600 shadow-md z-50" onMouseDown={(e) => admin.handleMouseDown(e, slot, 'rotate')}>
                                            <RotateCw size={11} />
                                        </div>
                                        <div className="absolute -top-2 left-1/2 w-px h-2 bg-blue-500 z-50"></div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center px-4 py-1.5 bg-zinc-900/40 backdrop-blur-3xl border-t border-white/5 text-[9px] text-gray-600 gap-4 flex-shrink-0 z-10">
                <span>{editingLayout.slots.length} слотов</span>
                <span>{admin.CANVAS_W}×{admin.CANVAS_H} px</span>
                <span>Масштаб: {admin.zoom}%</span>
                {admin.mousePos && (
                    <span className="text-gray-500">
                        <MousePointer size={8} className="inline mr-1" />
                        {admin.mousePos.x}%, {admin.mousePos.y}%
                    </span>
                )}
                <div className="flex-1" />
                {admin.snapEnabled && <span className="text-blue-500">● Snap</span>}
                {admin.showGrid && <span className="text-gray-500">● Grid</span>}
            </div>
        </div>
    );
}
