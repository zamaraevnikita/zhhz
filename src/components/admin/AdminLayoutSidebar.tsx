import React from 'react';
import { Icons } from '../IconComponents';
import { SlotType, LayoutTemplate } from '../../types';
import { Layers, Lock, Unlock, Trash2, Image as ImageIcon, Type } from 'lucide-react';

// Shared small button component
export const ToolBtn: React.FC<{ onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title?: string }> = ({ onClick, active, disabled, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center
      ${disabled ? 'text-gray-700 cursor-not-allowed' :
                active ? 'bg-blue-600 text-white shadow-sm' :
                    'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
    >
        {children}
    </button>
);

interface AdminLayoutSidebarProps {
    admin: any;
    editingLayout: LayoutTemplate;
    activeSlotId: string | null;
    onSaveLayout: (layout: LayoutTemplate) => void;
    onClose: () => void;
}

export const AdminLayoutSidebar: React.FC<AdminLayoutSidebarProps> = ({
    admin,
    editingLayout,
    activeSlotId,
    onSaveLayout,
    onClose
}) => {
    return (
        <div className="w-72 bg-zinc-900/50 backdrop-blur-3xl border-r border-white/5 flex flex-col flex-shrink-0 overflow-hidden">
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
                    <div className="space-y-1.5 flex flex-col items-start w-full">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Название</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none hover:bg-white/10 transition-colors" value={editingLayout.name} onChange={(e) => admin.layoutHistory.replace({ ...editingLayout, name: e.target.value })} onBlur={() => admin.layoutHistory.commit()} />
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
                                            ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
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
                        <button onClick={() => admin.addPreset('full_page')} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                            <div className="w-8 h-10 border border-gray-500 rounded-sm bg-gray-700/50"></div>
                            <span className="text-gray-400">Полная</span>
                        </button>
                        <button onClick={() => admin.addPreset('photo_text')} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                            <div className="w-8 h-10 border border-gray-500 rounded-sm flex flex-col overflow-hidden">
                                <div className="flex-1 bg-blue-500/20"></div>
                                <div className="h-3 bg-amber-500/20 flex items-center justify-center"><span className="text-[5px] text-amber-500">T</span></div>
                            </div>
                            <span className="text-gray-400">Фото+Текст</span>
                        </button>
                        <button onClick={() => admin.addPreset('collage_2x2')} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
                            <div className="w-8 h-10 border border-gray-500 rounded-sm grid grid-cols-2 grid-rows-2 gap-[1px] p-[1px]">
                                <div className="bg-blue-500/20 rounded-[1px]"></div>
                                <div className="bg-blue-500/20 rounded-[1px]"></div>
                                <div className="bg-blue-500/20 rounded-[1px]"></div>
                                <div className="bg-blue-500/20 rounded-[1px]"></div>
                            </div>
                            <span className="text-gray-400">Коллаж 2×2</span>
                        </button>
                        <button onClick={() => admin.addPreset('side_by_side')} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1.5 transition-colors border border-white/5">
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
                        {[...editingLayout.slots].reverse().map((slot) => (
                            <div
                                key={slot.id}
                                onClick={() => admin.setActiveSlotId(slot.id)}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-[10px] ${activeSlotId === slot.id
                                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                                    : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
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
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-colors border border-white/5"
                        >
                            <Icons.Image size={13} /> {editingLayout.backgroundImage ? 'Заменить' : 'Загрузить'}
                        </button>
                        {editingLayout.backgroundImage && (
                            <button type="button" onClick={() => admin.setBackgroundImage(undefined)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/5" title="Убрать фон"><Trash2 size={14} /></button>
                        )}
                    </div>
                    {editingLayout.backgroundImage && (
                        <div className="rounded-lg overflow-hidden border border-white/10 aspect-video max-h-20 bg-white/5 mt-2">
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
    );
}
