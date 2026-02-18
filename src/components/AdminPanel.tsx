import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutTemplate, LayoutSlot, SlotType } from '../types';
import { Icons } from './IconComponents';
import { deepClone, generateId, normalizeSlotRect } from '../utils';
import { 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Layers, 
  LayoutGrid,
  Maximize,
  Move,
  RotateCw,
  Trash2,
  Plus
} from 'lucide-react';

interface AdminPanelProps {
  layouts: LayoutTemplate[];
  onSaveLayout: (layout: LayoutTemplate) => void;
  onClose: () => void;
}

const createNewLayout = (): LayoutTemplate => ({
    id: generateId(),
    name: 'Новый макет',
    thumbnail: '',
    slots: [],
    gridConfig: '',
    isCustom: true,
    tags: ['universal']
});

// --- Helper Components from Album Builder ---

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
  const [localValue, setLocalValue] = useState(String(value));
  useEffect(() => { setLocalValue(String(value)); }, [value]);

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

export const AdminPanel: React.FC<AdminPanelProps> = ({ layouts, onSaveLayout, onClose }) => {
  const [editingLayout, setEditingLayout] = useState<LayoutTemplate>(createNewLayout());
  const [history, setHistory] = useState<LayoutTemplate[]>([createNewLayout()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ 
    id: string; 
    startX: number; 
    startY: number; 
    startRect: { x: number; y: number; w: number; h: number }; 
    startRotation: number; 
    type: 'move' | 'resize' | 'rotate' 
  } | null>(null);
  const positionDragRef = useRef<{ slotId: string; startX: number; startY: number; startPosX: number; startPosY: number; width: number; height: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const slotImageInputRef = useRef<HTMLInputElement>(null);

  const activeSlot = editingLayout.slots.find(s => s.id === activeSlotId) || null;

  const CANVAS_W = 520;
  const CANVAS_H = Math.round(CANVAS_W * 1.414);

  // Snap to other slots (guides) — threshold in % of canvas
  const SNAP_THRESHOLD_PERCENT = 1.5;
  const [guideLines, setGuideLines] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });
  const layoutRef = useRef(editingLayout);
  layoutRef.current = editingLayout;

  const getSnapLines = useCallback((slots: LayoutSlot[], excludeId: string) => {
    const vertical: number[] = [0, 100];
    const horizontal: number[] = [0, 100];
    slots.forEach(s => {
      if (s.id === excludeId || !s.rect) return;
      const { x, y, w, h } = s.rect;
      vertical.push(x, x + w, x + w / 2);
      horizontal.push(y, y + h, y + h / 2);
    });
    return { vertical, horizontal };
  }, []);

  const snapToLines = useCallback((
    value: number,
    lines: number[],
    threshold: number
  ): { value: number; line: number | null } => {
    let bestLine: number | null = null;
    let bestDist = threshold;
    lines.forEach(line => {
      const d = Math.abs(value - line);
      if (d < bestDist) {
        bestDist = d;
        bestLine = line;
      }
    });
    return { value: bestLine !== null ? bestLine : value, line: bestLine };
  }, []);

  // --- Core Logic ---

  const addToHistory = (layout: LayoutTemplate) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(deepClone(layout));
      if (newHistory.length > 30) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setEditingLayout(deepClone(history[newIndex]));
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setEditingLayout(deepClone(history[newIndex]));
      }
  };

  const updateLayoutAndHistory = (newLayout: LayoutTemplate) => {
      setEditingLayout(newLayout);
      addToHistory(newLayout);
  };

  const updateSlot = (id: string, updates: Partial<LayoutSlot>) => {
      const newSlots = editingLayout.slots.map(s => {
          if (s.id !== id) return s;
          const merged = { ...s, ...updates };
          if (merged.rect && updates.rect !== undefined) {
              merged.rect = normalizeSlotRect({ ...merged.rect, ...updates.rect });
          }
          return merged;
      });
      setEditingLayout({ ...editingLayout, slots: newSlots });
  };

  const addSlot = (type: SlotType) => {
      const newSlot: LayoutSlot = {
          id: generateId(),
          type,
          className: type === SlotType.IMAGE ? 'bg-gray-200' : '',
          rect: normalizeSlotRect({ x: 25, y: 25, w: 50, h: 40 }),
          rotation: 0,
          opacity: 1,
          borderRadius: 0,
          locked: false
      };
      updateLayoutAndHistory({ ...editingLayout, slots: [...editingLayout.slots, newSlot] });
      setActiveSlotId(newSlot.id);
  };

  const removeSlot = (id: string) => {
      updateLayoutAndHistory({ ...editingLayout, slots: editingLayout.slots.filter(s => s.id !== id) });
      setActiveSlotId(null);
  };

  const duplicateSlot = (slot: LayoutSlot) => {
      const rawRect = { ...slot.rect!, x: slot.rect!.x + 2, y: slot.rect!.y + 2 };
      const newSlot = { ...deepClone(slot), id: generateId(), rect: normalizeSlotRect(rawRect) };
      updateLayoutAndHistory({ ...editingLayout, slots: [...editingLayout.slots, newSlot] });
      setActiveSlotId(newSlot.id);
  };

  /** Загрузка макета из библиотеки с нормализацией всех rect. */
  const loadLayout = useCallback((layout: LayoutTemplate) => {
      const next = deepClone(layout);
      next.slots = next.slots.map(s => s.rect ? { ...s, rect: normalizeSlotRect(s.rect) } : s);
      setEditingLayout(next);
  }, []);

  const setBackgroundImage = (url: string | undefined) => {
      const next = { ...editingLayout, backgroundImage: url };
      setEditingLayout(next);
      addToHistory(next);
  };

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
          setBackgroundImage(String(reader.result));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const handleSlotDefaultImageChange = (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/') || !activeSlot) return;
      const reader = new FileReader();
      reader.onload = () => {
          updateSlot(slotId, { defaultContent: String(reader.result) });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const moveLayer = (direction: 'front' | 'back') => {
      if (!activeSlotId) return;
      const index = editingLayout.slots.findIndex(s => s.id === activeSlotId);
      const newSlots = [...editingLayout.slots];
      const [item] = newSlots.splice(index, 1);
      if (direction === 'front') newSlots.push(item);
      else newSlots.unshift(item);
      updateLayoutAndHistory({ ...editingLayout, slots: newSlots });
  };

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent, slot: LayoutSlot, type: 'move' | 'resize' | 'rotate') => {
      if (slot.locked && type !== 'rotate') return;
      e.stopPropagation();
      setActiveSlotId(slot.id);
      if(slot.rect) {
          dragRef.current = {
              id: slot.id,
              startX: e.clientX,
              startY: e.clientY,
              startRect: { ...slot.rect },
              startRotation: slot.rotation || 0,
              type
          };
      }
  };

  const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const { clientX, clientY } = e;
      const { startX, startY, startRect, startRotation, id, type } = dragRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const prev = layoutRef.current;
      const lines = getSnapLines(prev.slots, id);
      const activeGuides = { vertical: [] as number[], horizontal: [] as number[] };

      const slots = prev.slots.map(s => {
          if (s.id !== id || !s.rect) return s;
          let newRect = { ...s.rect };
          let newRotation = s.rotation || 0;

          if (type === 'move') {
              let rawX = startRect.x + ((clientX - startX) / containerRect.width) * 100;
              let rawY = startRect.y + ((clientY - startY) / containerRect.height) * 100;
              const w = startRect.w;
              const h = startRect.h;
              // Snap to vertical: left, right or center — choose closest
              const leftSnap = snapToLines(rawX, lines.vertical, SNAP_THRESHOLD_PERCENT);
              const rightSnap = snapToLines(rawX + w, lines.vertical, SNAP_THRESHOLD_PERCENT);
              const centerXSnap = snapToLines(rawX + w / 2, lines.vertical, SNAP_THRESHOLD_PERCENT);
              const dL = leftSnap.line != null ? Math.abs(rawX - leftSnap.value) : Infinity;
              const dR = rightSnap.line != null ? Math.abs((rawX + w) - rightSnap.value) : Infinity;
              const dC = centerXSnap.line != null ? Math.abs((rawX + w / 2) - centerXSnap.value) : Infinity;
              const minX = Math.min(dL, dR, dC);
              if (minX < Infinity) {
                  if (minX === dL) { rawX = leftSnap.value; activeGuides.vertical.push(leftSnap.line!); }
                  else if (minX === dR) { rawX = rightSnap.value - w; activeGuides.vertical.push(rightSnap.line!); }
                  else { rawX = centerXSnap.value - w / 2; activeGuides.vertical.push(centerXSnap.line!); }
              }
              const topSnap = snapToLines(rawY, lines.horizontal, SNAP_THRESHOLD_PERCENT);
              const bottomSnap = snapToLines(rawY + h, lines.horizontal, SNAP_THRESHOLD_PERCENT);
              const centerYSnap = snapToLines(rawY + h / 2, lines.horizontal, SNAP_THRESHOLD_PERCENT);
              const dT = topSnap.line != null ? Math.abs(rawY - topSnap.value) : Infinity;
              const dB = bottomSnap.line != null ? Math.abs((rawY + h) - bottomSnap.value) : Infinity;
              const dCY = centerYSnap.line != null ? Math.abs((rawY + h / 2) - centerYSnap.value) : Infinity;
              const minY = Math.min(dT, dB, dCY);
              if (minY < Infinity) {
                  if (minY === dT) { rawY = topSnap.value; activeGuides.horizontal.push(topSnap.line!); }
                  else if (minY === dB) { rawY = bottomSnap.value - h; activeGuides.horizontal.push(bottomSnap.line!); }
                  else { rawY = centerYSnap.value - h / 2; activeGuides.horizontal.push(centerYSnap.line!); }
              }
              newRect.x = Math.max(0, Math.min(100 - w, rawX));
              newRect.y = Math.max(0, Math.min(100 - h, rawY));
          } else if (type === 'resize') {
              let rawW = Math.max(5, startRect.w + ((clientX - startX) / containerRect.width) * 100);
              let rawH = Math.max(5, startRect.h + ((clientY - startY) / containerRect.height) * 100);
              const right = startRect.x + rawW;
              const bottom = startRect.y + rawH;
              const rightSnap = snapToLines(right, lines.vertical, SNAP_THRESHOLD_PERCENT);
              const bottomSnap = snapToLines(bottom, lines.horizontal, SNAP_THRESHOLD_PERCENT);
              if (rightSnap.line != null) {
                  rawW = Math.max(5, rightSnap.value - startRect.x);
                  activeGuides.vertical.push(rightSnap.line);
              }
              if (bottomSnap.line != null) {
                  rawH = Math.max(5, bottomSnap.value - startRect.y);
                  activeGuides.horizontal.push(bottomSnap.line);
              }
              newRect.w = Math.min(rawW, 100 - startRect.x);
              newRect.h = Math.min(rawH, 100 - startRect.y);
          } else if (type === 'rotate') {
              const centerX = containerRect.left + (startRect.x + startRect.w / 2) * (containerRect.width / 100);
              const centerY = containerRect.top + (startRect.y + startRect.h / 2) * (containerRect.height / 100);
              newRotation = (Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI) + 90;
          }
          newRect = normalizeSlotRect(newRect);
          return { ...s, rect: newRect, rotation: newRotation };
      });

      setEditingLayout({ ...prev, slots });
      setGuideLines(activeGuides);
  };

  const handleMouseUp = () => {
      if (dragRef.current) {
          addToHistory(layoutRef.current);
          dragRef.current = null;
          setGuideLines({ vertical: [], horizontal: [] });
      }
      positionDragRef.current = null;
  };

  const handleImagePositionMouseDown = (e: React.MouseEvent, slot: LayoutSlot) => {
      if (slot.locked || slot.type !== SlotType.IMAGE || !slot.defaultContent) return;
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const posX = slot.defaultContentPosition?.x ?? 50;
      const posY = slot.defaultContentPosition?.y ?? 50;
      positionDragRef.current = { slotId: slot.id, startX: e.clientX, startY: e.clientY, startPosX: posX, startPosY: posY, width: rect.width, height: rect.height };
  };

  const handleImagePositionMouseMove = useCallback((e: MouseEvent) => {
      if (!positionDragRef.current) return;
      const { slotId, startX, startY, startPosX, startPosY, width, height } = positionDragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const deltaPctX = (deltaX / width) * 100 * -1;
      const deltaPctY = (deltaY / height) * 100 * -1;
      const newX = Math.min(100, Math.max(0, startPosX + deltaPctX));
      const newY = Math.min(100, Math.max(0, startPosY + deltaPctY));
      setEditingLayout(prev => ({
          ...prev,
          slots: prev.slots.map(s => s.id === slotId ? { ...s, defaultContentPosition: { x: newX, y: newY } } : s)
      }));
  }, []);

  useEffect(() => {
      const onMove = (e: MouseEvent) => {
          if (!positionDragRef.current) return;
          handleImagePositionMouseMove(e);
      };
      const onUp = () => {
          if (positionDragRef.current) {
              addToHistory(layoutRef.current);
              positionDragRef.current = null;
          }
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [handleImagePositionMouseMove]);

  useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [editingLayout]);

  return (
    <div className="fixed inset-0 bg-[#111] z-50 flex text-gray-100 font-sans overflow-hidden">
        
        {/* Left Sidebar: Layout Settings */}
        <div className="w-72 bg-[#1a1a1a] border-r border-white/5 p-6 flex flex-col gap-6 flex-shrink-0">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Конструктор</h2>
                <div className="flex gap-1">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-20"><Icons.Undo size={14}/></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-20"><Icons.Redo size={14}/></button>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Название</label>
                    <input className="w-full bg-[#222] border border-white/10 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none" value={editingLayout.name} onChange={(e) => setEditingLayout({...editingLayout, name: e.target.value})} onBlur={() => addToHistory(editingLayout)} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Теги (через запятую)</label>
                    <input className="w-full bg-[#222] border border-white/10 rounded p-2 text-[10px] focus:ring-1 focus:ring-blue-500 outline-none" value={editingLayout.tags?.join(', ')} onChange={(e) => setEditingLayout({...editingLayout, tags: e.target.value.split(',').map(t => t.trim())})} onBlur={() => addToHistory(editingLayout)} />
                </div>

                <div className="pt-4 space-y-3">
                    <button onClick={() => addSlot(SlotType.IMAGE)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Plus size={14} /> ФОТО-СЛОТ
                    </button>
                    <button onClick={() => addSlot(SlotType.TEXT)} className="w-full bg-[#333] hover:bg-[#444] text-white p-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Plus size={14} /> ТЕКСТ-СЛОТ
                    </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Задний план</label>
                    <input
                        ref={backgroundFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundFileChange}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => backgroundFileInputRef.current?.click()}
                            className="flex-1 bg-[#333] hover:bg-[#444] text-white p-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Icons.Image size={14} /> Загрузить фото
                        </button>
                        {editingLayout.backgroundImage && (
                            <button
                                type="button"
                                onClick={() => setBackgroundImage(undefined)}
                                className="p-2.5 rounded text-xs font-bold flex items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Убрать фон"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    {editingLayout.backgroundImage && (
                        <div className="rounded bg-black/30 overflow-hidden aspect-[210/297] max-h-24 border border-white/10">
                            <img src={editingLayout.backgroundImage} alt="Фон" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                <button onClick={() => onSaveLayout(editingLayout)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded text-xs font-black uppercase tracking-widest transition-colors">Сохранить</button>
                <button onClick={onClose} className="w-full text-gray-500 hover:text-white text-xs py-2 transition-colors">Закрыть</button>
            </div>
        </div>

        {/* Center: Canvas Area */}
        <div
            ref={viewportRef}
            className="flex-1 bg-[#0a0a0a] relative overflow-hidden"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('[data-slot-id]')) setActiveSlotId(null);
            }}
        >
            {/* Top controls: grid toggle only */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#111]/80 backdrop-blur border border-white/10 rounded-xl px-3 py-2">
                <button
                    onClick={() => setShowGrid(v => !v)}
                    className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Сетка"
                >
                    <Layers size={16} />
                </button>
            </div>

            {/* Canvas stage — centered, no zoom/pan */}
            <div className="absolute inset-0 flex items-center justify-center overflow-auto p-6">
                <div
                    ref={containerRef}
                    className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0"
                    style={{
                        width: CANVAS_W,
                        height: CANVAS_H,
                        backgroundImage: editingLayout.backgroundImage ? `url(${editingLayout.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Grid Overlay */}
                    {showGrid && (
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 pointer-events-none opacity-[0.03]">
                            {Array.from({length: 48}).map((_,i) => <div key={i} className="border border-black"></div>)}
                        </div>
                    )}

                    {/* Snap guides (edges/centers of other slots) */}
                    {(guideLines.vertical.length > 0 || guideLines.horizontal.length > 0) && (
                        <div className="absolute inset-0 pointer-events-none z-40">
                            {guideLines.vertical.map((v, i) => (
                                <div key={`v-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-80" style={{ left: `${v}%`, marginLeft: -1 }} />
                            ))}
                            {guideLines.horizontal.map((h, i) => (
                                <div key={`h-${i}`} className="absolute left-0 right-0 h-0.5 bg-blue-500 opacity-80" style={{ top: `${h}%`, marginTop: -1 }} />
                            ))}
                        </div>
                    )}

                {editingLayout.slots.map(slot => (
                    <div
                        key={slot.id}
                        data-slot-id={slot.id}
                        className={`absolute border-2 transition-shadow ${activeSlotId === slot.id ? 'border-blue-500 z-50 ring-4 ring-blue-500/10' : 'border-gray-300 hover:border-blue-300 z-10'}`}
                        style={{
                            left: `${slot.rect?.x}%`,
                            top: `${slot.rect?.y}%`,
                            width: `${slot.rect?.w}%`,
                            height: `${slot.rect?.h}%`,
                            transform: `rotate(${slot.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            opacity: slot.opacity ?? 1,
                            borderRadius: `${slot.borderRadius}px`,
                            backgroundColor: slot.type === SlotType.IMAGE ? 'rgba(59, 130, 246, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                            cursor: slot.locked ? 'not-allowed' : 'move'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, slot, 'move')}
                    >
                        {/* Status Icons */}
                        <div className="absolute top-1 left-1 flex gap-1 opacity-40">
                            {slot.locked && <Lock size={10} className="text-gray-900" />}
                            {slot.type === SlotType.TEXT ? <Icons.Type size={10} className="text-amber-600"/> : <Icons.Image size={10} className="text-blue-600"/>}
                        </div>
                        {/* Предзаполненный контент: фото на всю рамку (cover), при выделении — перетаскивание для сдвига */}
                        {slot.defaultContent && (
                            <div
                                className={`absolute inset-0 overflow-hidden flex items-center justify-center p-0 ${slot.type === SlotType.IMAGE && activeSlotId === slot.id && !slot.locked ? 'pointer-events-auto cursor-move' : 'pointer-events-none'}`}
                                onMouseDown={slot.type === SlotType.IMAGE ? (e) => handleImagePositionMouseDown(e, slot) : undefined}
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
                                    <span className="text-[10px] text-gray-800 leading-tight line-clamp-6 text-center p-1">{slot.defaultContent}</span>
                                )}
                            </div>
                        )}

                        {activeSlotId === slot.id && !slot.locked && (
                            <>
                                {/* Resize Handle */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-sm" onMouseDown={(e) => handleMouseDown(e, slot, 'resize')} />
                                {/* Rotate Handle */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-alias text-gray-600 shadow-md" onMouseDown={(e) => handleMouseDown(e, slot, 'rotate')}>
                                    <RotateCw size={12} />
                                </div>
                                <div className="absolute -top-2 left-1/2 w-px h-2 bg-blue-500"></div>
                            </>
                        )}
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Right Sidebar: Properties Inspector — overlay, не меняет ширину области холста */}
        <div className={`
            fixed top-0 right-0 bottom-0 w-72 bg-[#1a1a1a] border-l border-white/5 transition-transform duration-300 z-40
            ${activeSlot ? 'translate-x-0' : 'translate-x-full'}
        `}>
            {activeSlot && (
                <div className="flex flex-col h-full w-72">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Свойства слота</h3>
                        <button onClick={() => updateSlot(activeSlot.id, { locked: !activeSlot.locked })} className={`p-1.5 rounded transition-colors ${activeSlot.locked ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                            {activeSlot.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Position & Size */}
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-bold text-gray-600 uppercase">Размеры и позиция</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">X (%)</span><NumericInput value={activeSlot.rect!.x} onChange={val => updateSlot(activeSlot.id, { rect: {...activeSlot.rect!, x: val} })} min={0} max={100} step={0.5} suffix="%" /></div>
                                <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Y (%)</span><NumericInput value={activeSlot.rect!.y} onChange={val => updateSlot(activeSlot.id, { rect: {...activeSlot.rect!, y: val} })} min={0} max={100} step={0.5} suffix="%" /></div>
                                <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Ширина (%)</span><NumericInput value={activeSlot.rect!.w} onChange={val => updateSlot(activeSlot.id, { rect: {...activeSlot.rect!, w: val} })} min={1} max={100} step={0.5} suffix="%" /></div>
                                <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Высота (%)</span><NumericInput value={activeSlot.rect!.h} onChange={val => updateSlot(activeSlot.id, { rect: {...activeSlot.rect!, h: val} })} min={1} max={100} step={0.5} suffix="%" /></div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-[9px] font-bold text-gray-600 uppercase">Внешний вид</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Поворот</span><span>{Math.round(activeSlot.rotation || 0)}°</span></div>
                                    <input type="range" min="0" max="360" value={activeSlot.rotation || 0} onChange={e => updateSlot(activeSlot.id, { rotation: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Прозрачность</span><span>{Math.round((activeSlot.opacity || 1) * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={activeSlot.opacity ?? 1} onChange={e => updateSlot(activeSlot.id, { opacity: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div className="flex justify-between items-center bg-[#222] p-2 rounded">
                                    <span className="text-[10px] text-gray-400">Скругление</span>
                                    <NumericInput value={activeSlot.borderRadius || 0} onChange={val => updateSlot(activeSlot.id, { borderRadius: val })} className="!w-16 !bg-transparent !border-none" suffix="px" />
                                </div>
                            </div>
                        </div>

                        {/* Default content — предзаполнение шаблона */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-[9px] font-bold text-gray-600 uppercase">Контент по умолчанию</h4>
                            {activeSlot.type === SlotType.IMAGE ? (
                                <>
                                    <input ref={slotImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSlotDefaultImageChange(e, activeSlot.id)} />
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => slotImageInputRef.current?.click()} className="flex-1 p-2 bg-[#222] hover:bg-[#333] rounded text-[10px] flex items-center justify-center gap-2">
                                            <Icons.Image size={14} /> {activeSlot.defaultContent ? 'Заменить фото' : 'Загрузить фото'}
                                        </button>
                                        {activeSlot.defaultContent && (
                                            <button type="button" onClick={() => updateSlot(activeSlot.id, { defaultContent: undefined })} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Убрать"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                    {activeSlot.defaultContent && (
                                        <div className="rounded overflow-hidden border border-white/10 aspect-video max-h-24 bg-[#222]">
                                            <img src={activeSlot.defaultContent} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <textarea
                                        value={activeSlot.defaultContent ?? ''}
                                        onChange={e => updateSlot(activeSlot.id, { defaultContent: e.target.value || undefined })}
                                        placeholder="Текст по умолчанию в шаблоне"
                                        className="w-full bg-[#222] border border-white/10 rounded p-2 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[80px] resize-y"
                                        rows={3}
                                    />
                                </>
                            )}
                        </div>

                        {/* Layers */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-[9px] font-bold text-gray-600 uppercase">Слои и действия</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => moveLayer('front')} className="p-2 bg-[#222] hover:bg-[#333] rounded text-[10px] flex items-center justify-center gap-2"><ArrowUp size={12}/> Вперёд</button>
                                <button onClick={() => moveLayer('back')} className="p-2 bg-[#222] hover:bg-[#333] rounded text-[10px] flex items-center justify-center gap-2"><ArrowDown size={12}/> Назад</button>
                                <button onClick={() => duplicateSlot(activeSlot)} className="p-2 bg-[#222] hover:bg-[#333] rounded text-[10px] flex items-center justify-center gap-2"><Copy size={12}/> Копия</button>
                                <button onClick={() => removeSlot(activeSlot.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-[10px] flex items-center justify-center gap-2"><Trash2 size={12}/> Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Toggle: open library when no slot selected */}
        {!activeSlot && (
            <>
                <button
                    onClick={() => setLibraryOpen(v => !v)}
                    className="absolute right-6 top-6 z-[60] flex items-center gap-2 bg-[#1a1a1a]/90 hover:bg-[#222] backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors shadow-lg"
                    title={libraryOpen ? 'Скрыть библиотеку' : 'Библиотека макетов'}
                >
                    <LayoutGrid size={16} />
                    Библиотека макетов
                </button>
                {libraryOpen && (
                    <div className="absolute right-6 top-[4.25rem] bottom-6 w-64 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden flex flex-col pointer-events-auto z-50 transition-opacity">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Библиотека макетов</h3>
                            <button onClick={() => setLibraryOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" title="Закрыть">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 min-h-0">
                            {layouts.map(layout => (
                                <div key={layout.id} onClick={() => loadLayout(layout)} className={`p-3 rounded-xl cursor-pointer border transition-all ${editingLayout.id === layout.id ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/20' : 'bg-[#222] border-white/5 hover:bg-[#282828]'}`}>
                                    <div className="text-xs font-bold">{layout.name}</div>
                                    <div className="text-[9px] text-white/40 mt-1 uppercase tracking-tighter">{layout.slots.length} слотов • {layout.isCustom ? 'Custom' : 'System'}</div>
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