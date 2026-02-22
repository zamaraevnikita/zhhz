import React, { useEffect } from 'react';
import { LayoutTemplate, SlotType } from '../types';
import { Icons } from './IconComponents';
import { useAdminPanel } from '../hooks/useAdminPanel';
import {
    Lock,
    Unlock,
    ArrowUp,
    ArrowDown,
    Copy,
    Layers,
    LayoutGrid,
    RotateCw,
    Trash2,
    Plus,
    Magnet,
    Grid3X3,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Maximize2,
    MousePointer,
    Eye,
    EyeOff,
    Move,
    Columns2,
    Rows2,
    ImageIcon,
    Type
} from 'lucide-react';

interface AdminPanelProps {
    layouts: LayoutTemplate[];
    onSaveLayout: (layout: LayoutTemplate) => void;
    onDeleteLayout: (layoutId: string) => void;
    onClose: () => void;
}

// --- Helper: Numeric Input ---
const NumericInput = ({
    value,
    onChange,
    className,
    min,
    max,
    step = 1,
    suffix = ""
}: {
    value: number;
    onChange: (val: number) => void;
    className?: string;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
}) => {
    const [localValue, setLocalValue] = React.useState(String(value));
    React.useEffect(() => { setLocalValue(String(value)); }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        if (val === '' || val === '-') return;
        const num = parseFloat(val);
        if (!isNaN(num)) onChange(num);
    };

    const handleBlur = () => {
        let num = parseFloat(localValue);
        if (isNaN(num)) num = value;
        if (min !== undefined) num = Math.max(min, num);
        if (max !== undefined) num = Math.min(max, num);
        setLocalValue(String(num));
        onChange(num);
    };

    return (
        <div className="relative flex items-center">
            <input
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`w-full font-mono text-[11px] bg-gray-700 px-2 py-1.5 rounded border border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none ${className}`}
                min={min}
                max={max}
                step={step}
            />
            {suffix && <span className="absolute right-6 text-[9px] text-gray-500 pointer-events-none">{suffix}</span>}
        </div>
    );
};

// --- Helper: Toolbar Button ---
const ToolBtn: React.FC<{
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded-lg transition-all text-[11px] ${disabled
            ? 'opacity-20 cursor-not-allowed'
            : active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
    >
        {children}
    </button>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ layouts, onSaveLayout, onDeleteLayout, onClose }) => {
    const admin = useAdminPanel(layouts);
    const { editingLayout, activeSlot, activeSlotId } = admin;
    const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Skip when typing in inputs
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

            const isMeta = e.metaKey || e.ctrlKey;

            if (e.key === 'Escape') {
                admin.setActiveSlotId(null);
                e.preventDefault();
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && activeSlotId) {
                admin.removeSlot(activeSlotId);
                e.preventDefault();
            } else if (isMeta && e.key === 'z' && !e.shiftKey) {
                admin.layoutHistory.undo();
                e.preventDefault();
            } else if (isMeta && e.key === 'z' && e.shiftKey) {
                admin.layoutHistory.redo();
                e.preventDefault();
            } else if (isMeta && (e.key === 'd' || e.key === 'D') && activeSlot) {
                admin.duplicateSlot(activeSlot);
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' && activeSlotId) {
                admin.moveSlotByArrow('left', e.shiftKey ? 5 : 1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && activeSlotId) {
                admin.moveSlotByArrow('right', e.shiftKey ? 5 : 1);
                e.preventDefault();
            } else if (e.key === 'ArrowUp' && activeSlotId) {
                admin.moveSlotByArrow('up', e.shiftKey ? 5 : 1);
                e.preventDefault();
            } else if (e.key === 'ArrowDown' && activeSlotId) {
                admin.moveSlotByArrow('down', e.shiftKey ? 5 : 1);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [admin, activeSlot, activeSlotId]);

    return (
        <div className="fixed inset-0 bg-[#111] z-50 flex text-gray-100 font-sans overflow-hidden">

            {/* ===== LEFT SIDEBAR ===== */}
            <div className="w-72 bg-[#1a1a1a] border-r border-white/5 flex flex-col flex-shrink-0 overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-3 flex items-center justify-between flex-shrink-0 border-b border-white/5">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Конструктор</h2>
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-1 ml-1 pl-2">
                            <ToolBtn onClick={admin.layoutHistory.undo} disabled={!admin.layoutHistory.canUndo} title="Отменить (⌘Z)"><Icons.Undo size={14} /></ToolBtn>
                            <ToolBtn onClick={admin.layoutHistory.redo} disabled={!admin.layoutHistory.canRedo} title="Повторить (⌘⇧Z)"><Icons.Redo size={14} /></ToolBtn>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                    {/* Name & Tags */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Название</label>
                            <input className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" value={editingLayout.name} onChange={(e) => admin.layoutHistory.replace({ ...editingLayout, name: e.target.value })} onBlur={() => admin.layoutHistory.commit()} />
                        </div>
                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Категории</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'lookbook', label: 'Лукбук' },
                                    { id: 'universal', label: 'Базовые' },
                                    { id: 'travel', label: 'Тревел' },
                                    { id: 'memories', label: 'Память' },
                                    { id: 'valentine', label: 'Любовь' },
                                    { id: 'year', label: 'Год' }
                                ].map(cat => {
                                    const isSelected = editingLayout.tags?.includes(cat.id) || false;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                const currentTags = editingLayout.tags || [];
                                                const newTags = isSelected
                                                    ? currentTags.filter(t => t !== cat.id)
                                                    : [...currentTags, cat.id];

                                                admin.layoutHistory.replace({ ...editingLayout, tags: newTags });
                                                admin.layoutHistory.commit();
                                            }}
                                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-colors border ${isSelected
                                                ? 'bg-blue-600/20 border-blue-500/30 text-blue-300'
                                                : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Add Slots */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Добавить слот</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => admin.addSlot(SlotType.IMAGE)} className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-blue-500/20">
                                <ImageIcon size={13} /> Фото
                            </button>
                            <button onClick={() => admin.addSlot(SlotType.TEXT)} className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 p-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20">
                                <Type size={13} /> Текст
                            </button>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Пресеты</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => admin.addPreset('full_page')} className="bg-[#222] hover:bg-[#2a2a2a] p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                                <div className="w-8 h-10 border border-gray-500 rounded-sm bg-gray-700/50"></div>
                                <span className="text-gray-400">Полная</span>
                            </button>
                            <button onClick={() => admin.addPreset('photo_text')} className="bg-[#222] hover:bg-[#2a2a2a] p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                                <div className="w-8 h-10 border border-gray-500 rounded-sm flex flex-col overflow-hidden">
                                    <div className="flex-1 bg-blue-500/20"></div>
                                    <div className="h-3 bg-amber-500/20 flex items-center justify-center"><span className="text-[5px] text-amber-500">T</span></div>
                                </div>
                                <span className="text-gray-400">Фото+Текст</span>
                            </button>
                            <button onClick={() => admin.addPreset('collage_2x2')} className="bg-[#222] hover:bg-[#2a2a2a] p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                                <div className="w-8 h-10 border border-gray-500 rounded-sm grid grid-cols-2 grid-rows-2 gap-[1px] p-[1px]">
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                </div>
                                <span className="text-gray-400">Коллаж 2×2</span>
                            </button>
                            <button onClick={() => admin.addPreset('side_by_side')} className="bg-[#222] hover:bg-[#2a2a2a] p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                                <div className="w-8 h-10 border border-gray-500 rounded-sm grid grid-cols-2 gap-[1px] p-[1px]">
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                    <div className="bg-blue-500/20 rounded-[1px]"></div>
                                </div>
                                <span className="text-gray-400">2 фото</span>
                            </button>
                        </div>
                    </div>

                    {/* Layers */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={11} />
                            Слои ({editingLayout.slots.length})
                        </label>
                        <div className="space-y-1">
                            {[...editingLayout.slots].reverse().map((slot, _idx) => (
                                <div
                                    key={slot.id}
                                    onClick={() => admin.setActiveSlotId(slot.id)}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-[10px] ${activeSlotId === slot.id
                                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                                        : 'bg-[#222] border border-white/5 text-gray-400 hover:bg-[#282828]'
                                        }`}
                                >
                                    {slot.type === SlotType.IMAGE
                                        ? <ImageIcon size={12} className="text-blue-400 flex-shrink-0" />
                                        : <Type size={12} className="text-amber-400 flex-shrink-0" />
                                    }
                                    <span className="flex-1 truncate font-medium">
                                        {slot.type === SlotType.IMAGE ? 'Фото' : 'Текст'}
                                        <span className="text-[8px] text-gray-600 ml-1.5">
                                            {Math.round(slot.rect?.w || 0)}×{Math.round(slot.rect?.h || 0)}%
                                        </span>
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); admin.updateSlot(slot.id, { locked: !slot.locked }); }}
                                        className={`p-0.5 rounded transition-colors ${slot.locked ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
                                        title={slot.locked ? 'Разблокировать' : 'Заблокировать'}
                                    >
                                        {slot.locked ? <Lock size={10} /> : <Unlock size={10} />}
                                    </button>
                                </div>
                            ))}
                            {editingLayout.slots.length === 0 && (
                                <div className="text-[10px] text-gray-600 text-center py-4">
                                    Нет слотов. Добавьте фото или текст.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Background */}
                    <div className="space-y-2 pt-3 border-t border-white/5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Задний план</label>
                        <input
                            ref={admin.backgroundFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={admin.handleBackgroundFileChange}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => admin.backgroundFileInputRef.current?.click()}
                                className="flex-1 bg-[#222] hover:bg-[#2a2a2a] text-white p-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-colors border border-white/5"
                            >
                                <Icons.Image size={13} /> {editingLayout.backgroundImage ? 'Заменить' : 'Загрузить'}
                            </button>
                            {editingLayout.backgroundImage && (
                                <button type="button" onClick={() => admin.setBackgroundImage(undefined)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/5" title="Убрать фон"><Trash2 size={14} /></button>
                            )}
                        </div>
                        {editingLayout.backgroundImage && (
                            <div className="rounded-lg overflow-hidden border border-white/10 aspect-video max-h-20 bg-[#222]">
                                <img src={editingLayout.backgroundImage} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-3 border-t border-white/5 space-y-2 flex-shrink-0">
                    <button onClick={() => onSaveLayout(editingLayout)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Сохранить</button>
                    <button onClick={onClose} className="w-full text-gray-500 hover:text-white text-xs py-2 transition-colors">Закрыть</button>
                </div>
            </div>

            {/* ===== CENTER: Canvas Area ===== */}
            <div
                className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex flex-col"
                onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('[data-slot-id]')) admin.setActiveSlotId(null);
                }}
            >
                {/* Top Toolbar */}
                <div className="flex items-center gap-1 px-4 py-2 bg-[#151515] border-b border-white/5 flex-shrink-0 z-10">
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
                        <ToolBtn onClick={() => admin.setShowGrid(v => !v)} active={admin.showGrid} title="Сетка">
                            <Grid3X3 size={14} />
                        </ToolBtn>
                        <ToolBtn onClick={() => admin.setSnapEnabled(v => !v)} active={admin.snapEnabled} title="Привязка к направляющим">
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
                        {(admin.guideLines.vertical.length > 0 || admin.guideLines.horizontal.length > 0) && (
                            <div className="absolute inset-0 pointer-events-none z-40">
                                {admin.guideLines.vertical.map((v, i) => (
                                    <div key={`v-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-80" style={{ left: `${v}%`, marginLeft: -1 }} />
                                ))}
                                {admin.guideLines.horizontal.map((h, i) => (
                                    <div key={`h-${i}`} className="absolute left-0 right-0 h-0.5 bg-blue-500 opacity-80" style={{ top: `${h}%`, marginTop: -1 }} />
                                ))}
                            </div>
                        )}

                        {/* Slots */}
                        {editingLayout.slots.map((slot, index) => {
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
                <div className="flex items-center px-4 py-1.5 bg-[#151515] border-t border-white/5 text-[9px] text-gray-600 gap-4 flex-shrink-0">
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

            {/* ===== RIGHT SIDEBAR: Properties ===== */}
            <div className={`
                fixed top-0 right-0 bottom-0 w-80 bg-[#1a1a1a] border-l border-white/5 transition-transform duration-300 z-40
                ${activeSlot ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {activeSlot && (
                    <div className="flex flex-col h-full w-80">
                        {/* Header with type */}
                        <div className="p-5 border-b border-white/5 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${activeSlot.type === SlotType.IMAGE ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
                                {activeSlot.type === SlotType.IMAGE
                                    ? <ImageIcon size={16} className="text-blue-400" />
                                    : <Type size={16} className="text-amber-400" />
                                }
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-white">
                                    {activeSlot.type === SlotType.IMAGE ? 'Фото-слот' : 'Текстовый слот'}
                                </h3>
                                <span className="text-[9px] text-gray-500">
                                    {Math.round(activeSlot.rect?.w || 0)}% × {Math.round(activeSlot.rect?.h || 0)}%
                                </span>
                            </div>
                            <button onClick={() => admin.updateSlot(activeSlot.id, { locked: !activeSlot.locked })} className={`p-2 rounded-lg transition-colors ${activeSlot.locked ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                                {activeSlot.locked ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            {/* Position & Size */}
                            {activeSlot.rect ? (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Позиция и размер</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">X (%)</span><NumericInput value={activeSlot.rect!.x} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, x: val } })} min={0} max={100} step={0.5} suffix="%" /></div>
                                        <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Y (%)</span><NumericInput value={activeSlot.rect!.y} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, y: val } })} min={0} max={100} step={0.5} suffix="%" /></div>
                                        <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Ширина (%)</span><NumericInput value={activeSlot.rect!.w} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, w: val } })} min={1} max={100} step={0.5} suffix="%" /></div>
                                        <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Высота (%)</span><NumericInput value={activeSlot.rect!.h} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, h: val } })} min={1} max={100} step={0.5} suffix="%" /></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => admin.centerSlot()} className="flex-1 p-2 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[9px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors text-gray-400">
                                            <Move size={10} /> Центр
                                        </button>
                                        <button onClick={() => admin.resetSlotToFull()} className="flex-1 p-2 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[9px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors text-gray-400">
                                            <Maximize2 size={10} /> На всю страницу
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Макет-сетка</h4>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[10px] text-amber-200/80 leading-relaxed">
                                        Размеры и позиции этого слота зафиксированы системной сеткой макета.
                                    </div>
                                    <button
                                        onClick={admin.convertToCustomLayout}
                                        className="w-full bg-[#222] hover:bg-[#2a2a2a] p-2.5 rounded-lg text-[10px] font-bold border border-white/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Unlock size={12} />
                                        Отвязать от сетки
                                    </button>
                                </div>
                            )}

                            {/* Appearance */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Внешний вид</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Поворот</span><span>{Math.round(activeSlot.rotation || 0)}°</span></div>
                                        <input type="range" min="0" max="360" value={activeSlot.rotation || 0} onChange={e => admin.updateSlot(activeSlot.id, { rotation: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Прозрачность</span><span>{Math.round((activeSlot.opacity || 1) * 100)}%</span></div>
                                        <input type="range" min="0" max="1" step="0.01" value={activeSlot.opacity ?? 1} onChange={e => admin.updateSlot(activeSlot.id, { opacity: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="flex justify-between items-center bg-[#222] p-2.5 rounded-lg">
                                        <span className="text-[10px] text-gray-400">Скругление</span>
                                        <NumericInput value={activeSlot.borderRadius || 0} onChange={val => admin.updateSlot(activeSlot.id, { borderRadius: val })} className="!w-16 !bg-transparent !border-none" suffix="px" />
                                    </div>
                                </div>
                            </div>

                            {/* Default content */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Контент по умолчанию</h4>
                                {activeSlot.type === SlotType.IMAGE ? (
                                    <>
                                        <input ref={admin.slotImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => admin.handleSlotDefaultImageChange(e, activeSlot.id)} />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => admin.slotImageInputRef.current?.click()} className="flex-1 p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-2 border border-white/5 transition-colors">
                                                <Icons.Image size={13} /> {activeSlot.defaultContent ? 'Заменить фото' : 'Загрузить фото'}
                                            </button>
                                            {activeSlot.defaultContent && (
                                                <button type="button" onClick={() => admin.updateSlot(activeSlot.id, { defaultContent: undefined })} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/5" title="Убрать"><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                        {activeSlot.defaultContent && (
                                            <div className="rounded-lg overflow-hidden border border-white/10 aspect-video max-h-24 bg-[#222]">
                                                <img src={activeSlot.defaultContent} alt="" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <textarea
                                            value={activeSlot.defaultContent ?? ''}
                                            onChange={e => admin.updateSlot(activeSlot.id, { defaultContent: e.target.value || undefined })}
                                            placeholder="Текст по умолчанию в шаблоне"
                                            className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[60px] resize-y"
                                            rows={2}
                                        />

                                        {/* Text Styling */}
                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Стиль текста</h4>

                                            {/* Font Family */}
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Шрифт</span>
                                                <select
                                                    value={activeSlot.defaultSettings?.fontFamily || ''}
                                                    onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontFamily: e.target.value || undefined } })}
                                                    className="w-full text-[11px] bg-[#222] border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">По умолчанию (тема)</option>
                                                    <option value="Inter, sans-serif">Inter</option>
                                                    <option value="Merriweather, serif">Merriweather</option>
                                                    <option value="Playfair Display, serif">Playfair Display</option>
                                                    <option value="Courier Prime, monospace">Courier Prime</option>
                                                    <option value="Arial, sans-serif">Arial</option>
                                                    <option value="Georgia, serif">Georgia</option>
                                                </select>
                                            </div>

                                            {/* Font Size & Color — single row */}
                                            <div className="flex items-end gap-2">
                                                <div className="space-y-1 flex-1">
                                                    <span className="text-[9px] text-gray-500 ml-1">Размер</span>
                                                    <NumericInput
                                                        value={activeSlot.defaultSettings?.fontSize || 14}
                                                        onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontSize: val } })}
                                                        min={8}
                                                        max={72}
                                                        step={1}
                                                        suffix="px"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] text-gray-500 ml-1">Цвет</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="color"
                                                            value={activeSlot.defaultSettings?.color || '#000000'}
                                                            onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, color: e.target.value } })}
                                                            className="w-7 h-7 bg-transparent border border-white/10 rounded cursor-pointer flex-shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={activeSlot.defaultSettings?.color || '#000000'}
                                                            onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, color: e.target.value } })}
                                                            className="w-[72px] font-mono text-[10px] bg-[#222] border border-white/10 rounded-lg px-1.5 py-1.5 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weight, Italic, Uppercase */}
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontWeight: activeSlot.defaultSettings?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
                                                    className={`flex-1 p-2 rounded-lg text-[10px] font-bold transition-colors border ${activeSlot.defaultSettings?.fontWeight === 'bold' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                >
                                                    <strong>B</strong>
                                                </button>
                                                <button
                                                    onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontStyle: activeSlot.defaultSettings?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
                                                    className={`flex-1 p-2 rounded-lg text-[10px] transition-colors border ${activeSlot.defaultSettings?.fontStyle === 'italic' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                >
                                                    <em>I</em>
                                                </button>
                                                <button
                                                    onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, uppercase: !activeSlot.defaultSettings?.uppercase } })}
                                                    className={`flex-1 p-2 rounded-lg text-[10px] transition-colors border ${activeSlot.defaultSettings?.uppercase ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                >
                                                    AA
                                                </button>
                                            </div>

                                            {/* Horizontal Alignment */}
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Горизонтально</span>
                                                <div className="flex gap-1.5">
                                                    {([['left', '≡ Л'], ['center', '≡ Ц'], ['right', '≡ П'], ['justify', '≡ Ш']] as const).map(([align, label]) => (
                                                        <button
                                                            key={align}
                                                            onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, align } })}
                                                            className={`flex-1 p-2 rounded-lg text-[9px] font-bold transition-colors border ${(activeSlot.defaultSettings?.align || 'left') === align ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Vertical Alignment */}
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Вертикально</span>
                                                <div className="flex gap-1.5">
                                                    {([['top', '↑ Верх'], ['center', '⇅ Центр'], ['bottom', '↓ Низ']] as const).map(([vAlign, label]) => (
                                                        <button
                                                            key={vAlign}
                                                            onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, verticalAlign: vAlign } })}
                                                            className={`flex-1 p-2 rounded-lg text-[9px] font-bold transition-colors border ${(activeSlot.defaultSettings?.verticalAlign || 'top') === vAlign ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Line Height & Letter Spacing */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] text-gray-500 ml-1">Межстрочный</span>
                                                    <NumericInput
                                                        value={activeSlot.defaultSettings?.lineHeight || 1.5}
                                                        onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, lineHeight: val } })}
                                                        min={0.8}
                                                        max={3}
                                                        step={0.1}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] text-gray-500 ml-1">Трекинг (em)</span>
                                                    <NumericInput
                                                        value={activeSlot.defaultSettings?.letterSpacing || 0}
                                                        onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, letterSpacing: val } })}
                                                        min={-0.1}
                                                        max={0.5}
                                                        step={0.01}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Layers & Actions */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Действия</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => admin.moveLayer('front')} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><ArrowUp size={11} /> Вперёд</button>
                                    <button onClick={() => admin.moveLayer('back')} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><ArrowDown size={11} /> Назад</button>
                                    <button onClick={() => admin.duplicateSlot(activeSlot)} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><Copy size={11} /> Копия</button>
                                    <button onClick={() => admin.removeSlot(activeSlot.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-red-500/10 transition-colors"><Trash2 size={11} /> Удалить</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Library toggle */}
            {!activeSlot && (
                <>
                    <button
                        onClick={() => admin.setLibraryOpen((v: boolean) => !v)}
                        className="absolute right-6 top-16 z-[60] flex items-center gap-2 bg-[#1a1a1a]/90 hover:bg-[#222] backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors shadow-lg"
                        title={admin.libraryOpen ? 'Скрыть библиотеку' : 'Библиотека макетов'}
                    >
                        <LayoutGrid size={16} />
                        Библиотека
                    </button>
                    {admin.libraryOpen && (
                        <div className="absolute right-6 top-28 bottom-12 w-64 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden flex flex-col pointer-events-auto z-50 transition-opacity">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Библиотека</h3>
                                <button onClick={() => admin.setLibraryOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" title="Закрыть">×</button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 min-h-0">
                                {layouts.map(layout => (
                                    <div key={layout.id} className={`p-3 rounded-xl cursor-pointer border transition-all group relative ${editingLayout.id === layout.id ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/20' : 'bg-[#222] border-white/5 hover:bg-[#282828]'}`}>
                                        <div onClick={() => admin.loadLayout(layout)}>
                                            <div className="text-xs font-bold pr-6">{layout.name}</div>
                                            <div className="text-[9px] text-white/40 mt-1 uppercase tracking-tighter">{layout.slots.length} слотов • {layout.isCustom ? 'Custom' : 'System'}</div>
                                        </div>
                                        {layout.isCustom && (
                                            confirmDeleteId === layout.id ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteLayout(layout.id); setConfirmDeleteId(null); }}
                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30 transition-all"
                                                >
                                                    Да?
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(layout.id); setTimeout(() => setConfirmDeleteId(prev => prev === layout.id ? null : prev), 3000); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Удалить макет"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};