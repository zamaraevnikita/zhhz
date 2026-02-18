import React, { useState } from 'react';
import { UploadedImage, SidebarTab, LayoutTemplate, ThemeConfig, SlotSettings, Spread, SlotType } from '../types';
import { Icons } from './IconComponents';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  uploadedImages: UploadedImage[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLayoutSelect: (layoutId: string) => void;
  onBackgroundSelect: (color: string) => void;
  theme: ThemeConfig;
  layouts: LayoutTemplate[];
  onClearPhotos: () => void;
  selectedSlotId: string | null;
  selectedSlotSide: 'left' | 'right' | null;
  selectedSlotType: SlotType | null;
  onPlaceImage: (side: 'left' | 'right', slotId: string, url: string) => void;
  onUpdateSettings: (side: 'left' | 'right', slotId: string, settings: Partial<SlotSettings>) => void;
  currentSpread: Spread;
  onClose?: () => void;
  isLeftPageSelected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  uploadedImages,
  onUpload,
  onLayoutSelect,
  onBackgroundSelect,
  theme,
  layouts,
  onClearPhotos,
  selectedSlotId,
  selectedSlotSide,
  selectedSlotType,
  onPlaceImage,
  onUpdateSettings,
  currentSpread
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  const handleTabClick = (tab: SidebarTab) => {
    if (activeTab === tab && isPanelOpen) {
        setIsPanelOpen(false);
    } else {
        setActiveTab(tab);
        setIsPanelOpen(true);
    }
  };

  const handleDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData('content', url);
    e.dataTransfer.setData('type', 'image');
    e.dataTransfer.effectAllowed = 'copy';
  };

  const canClickPlaceImage =
    activeTab === 'gallery' &&
    Boolean(selectedSlotId) &&
    Boolean(selectedSlotSide) &&
    selectedSlotType !== SlotType.TEXT;

  const textSettings = (!selectedSlotId || !selectedSlotSide) ? {} : (selectedSlotSide === 'left' ? currentSpread.leftPage : currentSpread.rightPage).slotSettings[selectedSlotId] || {};

  return (
    <>
        {isPanelOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
        )}

        <div className={`
            fixed lg:relative z-40
            flex flex-col-reverse lg:flex-row lg:h-full bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-300 ease-in-out
            inset-x-0 bottom-0 lg:inset-auto lg:top-0 lg:left-0
            ${isPanelOpen ? 'h-[65vh] sm:h-[70vh] lg:w-[352px]' : 'h-16 lg:w-16'}
        `}>
            {/* ICON STRIP */}
            <div className="bg-white border-gray-200 z-50 flex items-center lg:flex-col py-0 lg:py-6 gap-2 sm:gap-6 justify-around lg:justify-start px-4 lg:px-0 w-full lg:w-16 h-16 lg:h-full border-t lg:border-t-0 lg:border-r flex-shrink-0 relative">
                <button onClick={() => handleTabClick('gallery')} className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${activeTab === 'gallery' && isPanelOpen ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}><Icons.Image size={20} strokeWidth={1.5} /></button>
                <button onClick={() => handleTabClick('templates')} className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${activeTab === 'templates' && isPanelOpen ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}><Icons.Layout size={20} strokeWidth={1.5} /></button>
                <button onClick={() => handleTabClick('backgrounds')} className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${activeTab === 'backgrounds' && isPanelOpen ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}><Icons.PaintBucket size={20} strokeWidth={1.5} /></button>
                <button onClick={() => handleTabClick('text')} className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${activeTab === 'text' && isPanelOpen ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}><Icons.Type size={20} strokeWidth={1.5} /></button>
                <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400"><Icons.ChevronDown size={20} className={`transition-transform duration-300 ${isPanelOpen ? '' : 'rotate-180'}`} /></button>
            </div>

            {/* CONTENT PANEL */}
            <div className={`
                bg-white flex flex-col flex-1 min-h-0 lg:flex-none border-r border-gray-200 transition-all duration-300 overflow-hidden
                w-full lg:w-72
                ${isPanelOpen ? 'opacity-100' : 'opacity-0 lg:w-0 lg:border-0 pointer-events-none'}
            `}>
                <div className="flex flex-col flex-1 min-h-0 w-full lg:w-72 overflow-hidden">
                    {activeTab === 'gallery' && (
                    <div className="flex flex-col h-full min-h-0">
                        <div className="p-2 lg:p-4 border-b border-gray-100 shrink-0"><label className="flex items-center justify-center w-full py-2 lg:py-3 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-900 rounded-sm cursor-pointer transition-colors gap-1.5"><Icons.Plus size={16} /><span className="text-xs lg:text-sm font-medium">Загрузить фото</span><input type="file" className="hidden" multiple accept="image/*" onChange={(e) => { onUpload(e); e.target.value = ''; }} /></label></div>
                        <div className="flex-1 overflow-y-auto p-2 lg:p-4 custom-scrollbar min-h-0"><div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-2">{uploadedImages.map((img) => (<div key={img.id} className={`relative group aspect-square bg-gray-100 rounded-sm overflow-hidden border border-gray-100 hover:border-blue-400 transition-all ${canClickPlaceImage ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`} draggable onDragStart={(e) => handleDragStart(e, img.url)} onClick={() => { if (!canClickPlaceImage || !selectedSlotId || !selectedSlotSide) return; onPlaceImage(selectedSlotSide, selectedSlotId, img.url); if (window.innerWidth < 1024) setIsPanelOpen(false); }}><img src={img.url} alt="Uploaded" className={`w-full h-full object-cover transition-opacity ${img.usedCount > 0 ? 'opacity-50 grayscale' : 'opacity-100'}`} />{img.usedCount > 0 && <div className="absolute top-1 right-1 bg-white text-gray-900 rounded-full p-0.5 shadow-sm"><Icons.Check size={10} /></div>}</div>))}</div>{uploadedImages.length === 0 && <div className="text-center text-gray-400 text-sm mt-10 px-4">Загрузите фото</div>}{canClickPlaceImage && <div className="text-center text-gray-400 text-[10px] mt-3">Клик по фото вставит его в выбранный блок</div>}</div>
                        <div className="p-2 lg:p-4 border-t border-gray-100 bg-gray-50 shrink-0"><button onClick={onClearPhotos} className="w-full py-1.5 lg:py-2 bg-white border border-gray-200 text-gray-600 text-[10px] lg:text-xs font-medium rounded-sm">Очистить все</button></div>
                    </div>
                    )}
                    {activeTab === 'templates' && (
                    <div className="flex flex-col h-full overflow-hidden min-h-0"><div className="flex-1 overflow-y-auto p-2 lg:p-4 custom-scrollbar min-h-0"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 lg:gap-3">{layouts.map((layout) => (<button key={layout.id} onClick={() => { onLayoutSelect(layout.id); if (window.innerWidth < 1024) setIsPanelOpen(false); }} className="flex flex-col gap-0.5 lg:gap-1 group"><div className="w-full aspect-[210/297] max-h-[220px] sm:max-h-[260px] lg:max-h-none border border-gray-200 bg-white shadow-sm rounded-sm p-1.5 lg:p-2 group-hover:border-blue-400 transition-all relative overflow-hidden">{layout.isCustom ? (<div className="relative w-full h-full">{layout.slots.map(s => <div key={s.id} className="absolute bg-gray-200" style={{ left: `${s.rect?.x}%`, top: `${s.rect?.y}%`, width: `${s.rect?.w}%`, height: `${s.rect?.h}%`, transform: `rotate(${s.rotation || 0}deg)` }} />)}</div>) : (<div className={`w-full h-full grid ${layout.gridConfig} gap-1`}>{layout.slots.map((slot, i) => <div key={i} className={`bg-gray-100 ${slot.className}`} style={{ borderRadius: slot.className.includes('rounded') ? '50%' : '0' }} />)}</div>)}</div></button>))}</div></div></div>
                    )}
                    {activeTab === 'backgrounds' && (
                        <div className="flex flex-col h-full p-2 lg:p-4 overflow-y-auto min-h-0"><h3 className="text-xs lg:text-sm font-medium text-gray-900 mb-2 lg:mb-4">Цвета темы</h3><div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-4 gap-2 lg:gap-3">{theme.colors.palette.map((color) => (<button key={color} onClick={() => { onBackgroundSelect(color); if (window.innerWidth < 1024) setIsPanelOpen(false); }} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-blue-400" style={{ backgroundColor: color }} title={color} />))}<button onClick={() => onBackgroundSelect('#ffffff')} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform bg-white flex items-center justify-center text-red-400 text-xs" title="Сброс">✕</button></div></div>
                    )}
                    {activeTab === 'text' && (
                        <div className="flex flex-col h-full p-2 lg:p-4 overflow-y-auto custom-scrollbar min-h-0">
                            {selectedSlotId ? (
                                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div><h3 className="text-sm font-medium text-gray-900 mb-1">Редактирование</h3><p className="text-[10px] text-gray-400">Настройте стиль</p></div>
                                    <div className="flex flex-col gap-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Шрифт</label><select className="w-full text-xs border border-gray-200 rounded p-2 outline-none focus:border-blue-400 bg-white text-gray-900" value={textSettings.fontFamily || ''} onChange={(e) => onUpdateSettings(selectedSlotSide!, selectedSlotId, { fontFamily: e.target.value })}><option value="">Тема: Основной</option><option value={theme.fonts.heading}>Тема: Заголовок</option><option value="Inter, sans-serif">Inter</option><option value="Merriweather, serif">Merriweather</option><option value="Playfair Display, serif">Playfair Display</option><option value="Courier Prime, monospace">Courier Prime</option><option value="Arial, sans-serif">Arial</option></select></div>
                                    <div className="flex gap-3"><div className="flex-1 flex flex-col gap-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Размер</label><input type="number" className="w-full text-xs border border-gray-200 rounded p-2 outline-none focus:border-blue-400 bg-white text-gray-900" value={textSettings.fontSize || 14} onChange={(e) => onUpdateSettings(selectedSlotSide!, selectedSlotId, { fontSize: parseInt(e.target.value) })} min={8} max={120} /></div><div className="flex-1 flex flex-col gap-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Выравнивание</label><div className="flex bg-gray-50 rounded border border-gray-200 p-1">{(['left', 'center', 'right'] as const).map((align) => (<button key={align} className={`flex-1 flex items-center justify-center p-1 rounded ${textSettings.align === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => onUpdateSettings(selectedSlotSide!, selectedSlotId, { align })}>{align === 'left' && <Icons.AlignLeft size={14} />}{align === 'center' && <Icons.AlignCenter size={14} />}{align === 'right' && <Icons.AlignRight size={14} />}</button>))}</div></div></div>
                                    <div className="flex flex-col gap-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Стиль</label><div className="flex gap-2"><div className="flex bg-gray-50 rounded border border-gray-200 p-1"><button className={`p-2 rounded ${textSettings.fontWeight === 'bold' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => onUpdateSettings(selectedSlotSide!, selectedSlotId, { fontWeight: textSettings.fontWeight === 'bold' ? 'normal' : 'bold' })} title="Жирный"><Icons.Bold size={16} /></button><button className={`p-2 rounded ${textSettings.fontStyle === 'italic' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => onUpdateSettings(selectedSlotSide!, selectedSlotId, { fontStyle: textSettings.fontStyle === 'italic' ? 'normal' : 'italic' })} title="Курсив"><Icons.Italic size={16} /></button><button className={`p-2 rounded text-xs font-bold ${textSettings.uppercase ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => onUpdateSettings(selectedSlotSide!, selectedSlotId, { uppercase: !textSettings.uppercase })} title="Заглавные">AA</button></div><input type="color" value={textSettings.color || theme.colors.text} onChange={(e) => onUpdateSettings(selectedSlotSide!, selectedSlotId, { color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent self-center ml-auto" /></div></div>
                                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100"><div className="flex flex-col gap-2"><div className="flex justify-between"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Межбуквенное</span><span className="text-[10px] text-gray-500">{textSettings.letterSpacing || 0}em</span></div><input type="range" min="-0.1" max="0.5" step="0.01" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" value={textSettings.letterSpacing ?? 0} onChange={(e) => onUpdateSettings(selectedSlotSide!, selectedSlotId, { letterSpacing: parseFloat(e.target.value) })} /></div><div className="flex flex-col gap-2"><div className="flex justify-between"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Межстрочное</span><span className="text-[10px] text-gray-500">{textSettings.lineHeight || 1.4}</span></div><input type="range" min="0.8" max="3" step="0.1" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" value={textSettings.lineHeight ?? 1.4} onChange={(e) => onUpdateSettings(selectedSlotSide!, selectedSlotId, { lineHeight: parseFloat(e.target.value) })} /></div></div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center"><Icons.Type size={32} className="text-gray-300 mb-4" /><h3 className="text-sm font-medium text-gray-900 mb-1">Редактирование</h3><p className="text-xs text-gray-500 mb-6 px-4">Выберите текст</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TOGGLE BUTTON DESKTOP */}
            <button 
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 bg-white border border-l-0 border-gray-200 p-1.5 rounded-r-md text-gray-400 hover:text-gray-900 shadow-md z-[60] transition-colors self-center"
                style={{ pointerEvents: 'auto' }}
            >
                {isPanelOpen ? <Icons.ChevronLeft size={16} /> : <Icons.ChevronRight size={16} />}
            </button>
        </div>
    </>
  );
};