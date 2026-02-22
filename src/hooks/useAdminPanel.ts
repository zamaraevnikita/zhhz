import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutTemplate, LayoutSlot, SlotType } from '../types';
import { deepClone, generateId, normalizeSlotRect } from '../utils';
import { useHistory, UseHistoryReturn } from './useHistory';

export interface UseAdminPanelReturn {
    // Layout (with history)
    editingLayout: LayoutTemplate;
    layoutHistory: UseHistoryReturn<LayoutTemplate>;
    activeSlotId: string | null;
    setActiveSlotId: (id: string | null) => void;
    activeSlot: LayoutSlot | null;

    // UI state
    showGrid: boolean;
    setShowGrid: (v: boolean | ((prev: boolean) => boolean)) => void;
    libraryOpen: boolean;
    setLibraryOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
    guideLines: { vertical: number[]; horizontal: number[] };
    zoom: number;
    setZoom: (v: number) => void;
    snapEnabled: boolean;
    setSnapEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
    mousePos: { x: number; y: number } | null;

    // Slot CRUD
    addSlot: (type: SlotType) => void;
    removeSlot: (id: string) => void;
    duplicateSlot: (slot: LayoutSlot) => void;
    updateSlot: (id: string, updates: Partial<LayoutSlot>) => void;
    moveLayer: (direction: 'front' | 'back') => void;

    // Alignment & Distribution
    alignSlots: (axis: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => void;
    centerSlot: () => void;
    distributeSlots: (axis: 'horizontal' | 'vertical') => void;
    resetSlotToFull: () => void;

    // Presets
    addPreset: (preset: 'full_page' | 'photo_text' | 'collage_2x2' | 'side_by_side') => void;

    // Arrow key movement
    moveSlotByArrow: (direction: 'up' | 'down' | 'left' | 'right', amount: number) => void;

    // Canvas refs & handlers
    containerRef: React.RefObject<HTMLDivElement | null>;
    handleMouseDown: (e: React.MouseEvent, slot: LayoutSlot, type: 'move' | 'resize' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'rotate') => void;
    handleImagePositionMouseDown: (e: React.MouseEvent, slot: LayoutSlot) => void;
    handleCanvasMouseMove: (e: React.MouseEvent) => void;
    handleCanvasMouseLeave: () => void;

    // Background
    setBackgroundImage: (url: string | undefined) => void;
    handleBackgroundFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSlotDefaultImageChange: (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => void;

    // Library
    loadLayout: (layout: LayoutTemplate) => void;
    startNewLayout: () => void;
    convertToCustomLayout: () => void;

    // Refs for input elements
    backgroundFileInputRef: React.RefObject<HTMLInputElement | null>;
    slotImageInputRef: React.RefObject<HTMLInputElement | null>;

    // Canvas dimensions
    CANVAS_W: number;
    CANVAS_H: number;
}

const createNewLayout = (): LayoutTemplate => ({
    id: generateId(),
    name: 'Новый макет',
    thumbnail: '',
    slots: [],
    gridConfig: '',
    isCustom: true,
    tags: ['universal'],
});

const SNAP_THRESHOLD_PERCENT = 1.5;

/**
 * Хук для всей логики админ-панели (конструктор макетов).
 */
export function useAdminPanel(layouts: LayoutTemplate[]): UseAdminPanelReturn {
    const layoutHistory = useHistory<LayoutTemplate>(createNewLayout(), 30);
    const editingLayout = layoutHistory.current;

    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [guideLines, setGuideLines] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });
    const [zoom, setZoom] = useState(100);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const backgroundFileInputRef = useRef<HTMLInputElement>(null);
    const slotImageInputRef = useRef<HTMLInputElement>(null);

    const dragRef = useRef<{
        id: string;
        startX: number;
        startY: number;
        startRect: { x: number; y: number; w: number; h: number };
        startRotation: number;
        type: 'move' | 'resize' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'rotate';
    } | null>(null);

    const positionDragRef = useRef<{
        slotId: string;
        startX: number;
        startY: number;
        startPosX: number;
        startPosY: number;
        width: number;
        height: number;
    } | null>(null);

    const layoutRef = useRef(editingLayout);
    layoutRef.current = editingLayout;

    const activeSlot = editingLayout.slots.find(s => s.id === activeSlotId) || null;

    const CANVAS_W = 520;
    const CANVAS_H = Math.round(CANVAS_W * 1.414);

    // --- Canvas mouse tracking ---

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }, []);

    const handleCanvasMouseLeave = useCallback(() => {
        setMousePos(null);
    }, []);

    // --- Snap Logic ---

    const getSnapLines = useCallback((slots: LayoutSlot[], excludeId: string) => {
        const vertical: number[] = [0, 50, 100];
        const horizontal: number[] = [0, 50, 100];
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

    // --- Slot CRUD ---

    const updateSlot = useCallback((id: string, updates: Partial<LayoutSlot>) => {
        const newSlots = editingLayout.slots.map(s => {
            if (s.id !== id) return s;
            const merged = { ...s, ...updates };
            if (merged.rect && updates.rect !== undefined) {
                merged.rect = normalizeSlotRect({ ...merged.rect, ...updates.rect });
            }
            return merged;
        });
        layoutHistory.replace({ ...editingLayout, slots: newSlots });
    }, [editingLayout, layoutHistory]);

    const addSlot = useCallback((type: SlotType) => {
        const newSlot: LayoutSlot = {
            id: generateId(),
            type,
            className: type === SlotType.IMAGE ? 'bg-gray-200' : '',
            rect: normalizeSlotRect({ x: 25, y: 25, w: 50, h: 40 }),
            rotation: 0,
            opacity: 1,
            borderRadius: 0,
            locked: false,
        };
        layoutHistory.set({ ...editingLayout, slots: [...editingLayout.slots, newSlot] });
        setActiveSlotId(newSlot.id);
    }, [editingLayout, layoutHistory]);

    const removeSlot = useCallback((id: string) => {
        layoutHistory.set({ ...editingLayout, slots: editingLayout.slots.filter(s => s.id !== id) });
        setActiveSlotId(null);
    }, [editingLayout, layoutHistory]);

    const duplicateSlot = useCallback((slot: LayoutSlot) => {
        const rawRect = { ...slot.rect!, x: slot.rect!.x + 2, y: slot.rect!.y + 2 };
        const newSlot = { ...deepClone(slot), id: generateId(), rect: normalizeSlotRect(rawRect) };
        layoutHistory.set({ ...editingLayout, slots: [...editingLayout.slots, newSlot] });
        setActiveSlotId(newSlot.id);
    }, [editingLayout, layoutHistory]);

    const moveLayer = useCallback((direction: 'front' | 'back') => {
        if (!activeSlotId) return;
        const index = editingLayout.slots.findIndex(s => s.id === activeSlotId);
        const newSlots = [...editingLayout.slots];
        const [item] = newSlots.splice(index, 1);
        if (direction === 'front') newSlots.push(item);
        else newSlots.unshift(item);
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [activeSlotId, editingLayout, layoutHistory]);

    const loadLayout = useCallback((layout: LayoutTemplate) => {
        const next = deepClone(layout);
        next.slots = next.slots.map(s => s.rect ? { ...s, rect: normalizeSlotRect(s.rect) } : s);
        layoutHistory.set(next);
    }, [layoutHistory]);

    const startNewLayout = useCallback(() => {
        layoutHistory.set(createNewLayout());
        setActiveSlotId(null);
    }, [layoutHistory]);

    const convertToCustomLayout = useCallback(() => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const newSlots = editingLayout.slots.map(slot => {
            if (slot.rect) return slot;
            const el = containerRef.current!.querySelector(`[data-slot-id="${slot.id}"]`);
            if (el) {
                const elRect = el.getBoundingClientRect();
                return {
                    ...slot,
                    className: '', // Clear grid classes
                    rect: normalizeSlotRect({
                        x: ((elRect.left - containerRect.left) / containerRect.width) * 100,
                        y: ((elRect.top - containerRect.top) / containerRect.height) * 100,
                        w: (elRect.width / containerRect.width) * 100,
                        h: (elRect.height / containerRect.height) * 100,
                    })
                };
            }
            return slot;
        });

        layoutHistory.set({ ...editingLayout, isCustom: true, gridConfig: '', slots: newSlots });
    }, [editingLayout, layoutHistory]);

    // --- Alignment ---

    const alignSlots = useCallback((axis: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
        if (!activeSlotId) return;
        const slot = editingLayout.slots.find(s => s.id === activeSlotId);
        if (!slot?.rect) return;

        const newRect = { ...slot.rect };
        switch (axis) {
            case 'left': newRect.x = 0; break;
            case 'center-x': newRect.x = (100 - newRect.w) / 2; break;
            case 'right': newRect.x = 100 - newRect.w; break;
            case 'top': newRect.y = 0; break;
            case 'center-y': newRect.y = (100 - newRect.h) / 2; break;
            case 'bottom': newRect.y = 100 - newRect.h; break;
        }
        const newSlots = editingLayout.slots.map(s =>
            s.id === activeSlotId ? { ...s, rect: normalizeSlotRect(newRect) } : s
        );
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [activeSlotId, editingLayout, layoutHistory]);

    const centerSlot = useCallback(() => {
        if (!activeSlotId) return;
        const slot = editingLayout.slots.find(s => s.id === activeSlotId);
        if (!slot?.rect) return;
        const newRect = {
            ...slot.rect,
            x: (100 - slot.rect.w) / 2,
            y: (100 - slot.rect.h) / 2,
        };
        const newSlots = editingLayout.slots.map(s =>
            s.id === activeSlotId ? { ...s, rect: normalizeSlotRect(newRect) } : s
        );
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [activeSlotId, editingLayout, layoutHistory]);

    const resetSlotToFull = useCallback(() => {
        if (!activeSlotId) return;
        const newSlots = editingLayout.slots.map(s =>
            s.id === activeSlotId ? { ...s, rect: normalizeSlotRect({ x: 0, y: 0, w: 100, h: 100 }), rotation: 0 } : s
        );
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [activeSlotId, editingLayout, layoutHistory]);

    // --- Distribution ---

    const distributeSlots = useCallback((axis: 'horizontal' | 'vertical') => {
        const slotsWithRect = editingLayout.slots.filter(s => s.rect);
        if (slotsWithRect.length < 3) return;

        const sorted = [...slotsWithRect].sort((a, b) =>
            axis === 'horizontal' ? a.rect!.x - b.rect!.x : a.rect!.y - b.rect!.y
        );

        const first = sorted[0].rect!;
        const last = sorted[sorted.length - 1].rect!;
        const totalSpace = axis === 'horizontal'
            ? (last.x + last.w) - first.x
            : (last.y + last.h) - first.y;
        const totalSlotSize = sorted.reduce((acc, s) =>
            acc + (axis === 'horizontal' ? s.rect!.w : s.rect!.h), 0
        );
        const gap = (totalSpace - totalSlotSize) / (sorted.length - 1);

        let current = axis === 'horizontal' ? first.x : first.y;
        const idToPos: Record<string, number> = {};
        sorted.forEach(s => {
            idToPos[s.id] = current;
            current += (axis === 'horizontal' ? s.rect!.w : s.rect!.h) + gap;
        });

        const newSlots = editingLayout.slots.map(s => {
            if (!s.rect || !(s.id in idToPos)) return s;
            const newRect = { ...s.rect };
            if (axis === 'horizontal') newRect.x = idToPos[s.id];
            else newRect.y = idToPos[s.id];
            return { ...s, rect: normalizeSlotRect(newRect) };
        });
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [editingLayout, layoutHistory]);

    // --- Presets ---

    const addPreset = useCallback((preset: 'full_page' | 'photo_text' | 'collage_2x2' | 'side_by_side') => {
        const makeSlot = (type: SlotType, rect: { x: number; y: number; w: number; h: number }): LayoutSlot => ({
            id: generateId(),
            type,
            className: type === SlotType.IMAGE ? 'bg-gray-200' : '',
            rect: normalizeSlotRect(rect),
            rotation: 0,
            opacity: 1,
            borderRadius: 0,
            locked: false,
        });

        let newSlots: LayoutSlot[] = [];
        switch (preset) {
            case 'full_page':
                newSlots = [makeSlot(SlotType.IMAGE, { x: 0, y: 0, w: 100, h: 100 })];
                break;
            case 'photo_text':
                newSlots = [
                    makeSlot(SlotType.IMAGE, { x: 5, y: 5, w: 90, h: 55 }),
                    makeSlot(SlotType.TEXT, { x: 10, y: 65, w: 80, h: 30 }),
                ];
                break;
            case 'collage_2x2':
                newSlots = [
                    makeSlot(SlotType.IMAGE, { x: 3, y: 3, w: 45, h: 45 }),
                    makeSlot(SlotType.IMAGE, { x: 52, y: 3, w: 45, h: 45 }),
                    makeSlot(SlotType.IMAGE, { x: 3, y: 52, w: 45, h: 45 }),
                    makeSlot(SlotType.IMAGE, { x: 52, y: 52, w: 45, h: 45 }),
                ];
                break;
            case 'side_by_side':
                newSlots = [
                    makeSlot(SlotType.IMAGE, { x: 3, y: 5, w: 45, h: 90 }),
                    makeSlot(SlotType.IMAGE, { x: 52, y: 5, w: 45, h: 90 }),
                ];
                break;
        }

        layoutHistory.set({ ...editingLayout, slots: newSlots });
        if (newSlots.length > 0) setActiveSlotId(newSlots[0].id);
    }, [editingLayout, layoutHistory]);

    // --- Arrow key movement ---

    const moveSlotByArrow = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
        if (!activeSlotId) return;
        const slot = editingLayout.slots.find(s => s.id === activeSlotId);
        if (!slot?.rect || slot.locked) return;

        const newRect = { ...slot.rect };
        switch (direction) {
            case 'left': newRect.x = Math.max(0, newRect.x - amount); break;
            case 'right': newRect.x = Math.min(100 - newRect.w, newRect.x + amount); break;
            case 'up': newRect.y = Math.max(0, newRect.y - amount); break;
            case 'down': newRect.y = Math.min(100 - newRect.h, newRect.y + amount); break;
        }
        const newSlots = editingLayout.slots.map(s =>
            s.id === activeSlotId ? { ...s, rect: normalizeSlotRect(newRect) } : s
        );
        layoutHistory.set({ ...editingLayout, slots: newSlots });
    }, [activeSlotId, editingLayout, layoutHistory]);

    // --- Background ---

    const setBackgroundImage = useCallback((url: string | undefined) => {
        layoutHistory.set({ ...editingLayout, backgroundImage: url });
    }, [editingLayout, layoutHistory]);

    const handleBackgroundFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            setBackgroundImage(String(reader.result));
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [setBackgroundImage]);

    const handleSlotDefaultImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            updateSlot(slotId, { defaultContent: String(reader.result) });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [updateSlot]);

    // --- Drag Handlers ---

    const handleMouseDown = useCallback((e: React.MouseEvent, slot: LayoutSlot, type: 'move' | 'resize' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'rotate') => {
        if (slot.locked && type !== 'rotate') return;
        e.stopPropagation();
        setActiveSlotId(slot.id);
        if (slot.rect) {
            dragRef.current = {
                id: slot.id,
                startX: e.clientX,
                startY: e.clientY,
                startRect: { ...slot.rect },
                startRotation: slot.rotation || 0,
                type,
            };
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current || !containerRef.current) return;
        const { clientX, clientY } = e;
        const { startX, startY, startRect, startRotation, id, type } = dragRef.current;
        const containerRect = containerRef.current.getBoundingClientRect();
        const prev = layoutRef.current;
        const lines = snapEnabled ? getSnapLines(prev.slots, id) : { vertical: [], horizontal: [] };
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

                if (snapEnabled) {
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
                }

                newRect.x = Math.max(0, Math.min(100 - w, rawX));
                newRect.y = Math.max(0, Math.min(100 - h, rawY));
            } else if (type === 'resize') {
                // Bottom-right resize
                let rawW = Math.max(5, startRect.w + ((clientX - startX) / containerRect.width) * 100);
                let rawH = Math.max(5, startRect.h + ((clientY - startY) / containerRect.height) * 100);
                if (snapEnabled) {
                    const right = startRect.x + rawW;
                    const bottom = startRect.y + rawH;
                    const rightSnap = snapToLines(right, lines.vertical, SNAP_THRESHOLD_PERCENT);
                    const bottomSnap = snapToLines(bottom, lines.horizontal, SNAP_THRESHOLD_PERCENT);
                    if (rightSnap.line != null) { rawW = Math.max(5, rightSnap.value - startRect.x); activeGuides.vertical.push(rightSnap.line); }
                    if (bottomSnap.line != null) { rawH = Math.max(5, bottomSnap.value - startRect.y); activeGuides.horizontal.push(bottomSnap.line); }
                }
                newRect.w = Math.min(rawW, 100 - startRect.x);
                newRect.h = Math.min(rawH, 100 - startRect.y);
            } else if (type === 'resize-tl') {
                // Top-left resize: move origin + shrink
                const dxPct = ((clientX - startX) / containerRect.width) * 100;
                const dyPct = ((clientY - startY) / containerRect.height) * 100;
                let newX = startRect.x + dxPct;
                let newY = startRect.y + dyPct;
                let newW = startRect.w - dxPct;
                let newH = startRect.h - dyPct;
                newX = Math.max(0, newX);
                newY = Math.max(0, newY);
                newW = Math.max(5, Math.min(newW, startRect.x + startRect.w));
                newH = Math.max(5, Math.min(newH, startRect.y + startRect.h));
                newRect = { x: newX, y: newY, w: newW, h: newH };
            } else if (type === 'resize-tr') {
                const dxPct = ((clientX - startX) / containerRect.width) * 100;
                const dyPct = ((clientY - startY) / containerRect.height) * 100;
                let newY = startRect.y + dyPct;
                let newW = startRect.w + dxPct;
                let newH = startRect.h - dyPct;
                newY = Math.max(0, newY);
                newW = Math.max(5, Math.min(newW, 100 - startRect.x));
                newH = Math.max(5, Math.min(newH, startRect.y + startRect.h));
                newRect = { x: startRect.x, y: newY, w: newW, h: newH };
            } else if (type === 'resize-bl') {
                const dxPct = ((clientX - startX) / containerRect.width) * 100;
                const dyPct = ((clientY - startY) / containerRect.height) * 100;
                let newX = startRect.x + dxPct;
                let newW = startRect.w - dxPct;
                let newH = startRect.h + dyPct;
                newX = Math.max(0, newX);
                newW = Math.max(5, Math.min(newW, startRect.x + startRect.w));
                newH = Math.max(5, Math.min(newH, 100 - startRect.y));
                newRect = { x: newX, y: startRect.y, w: newW, h: newH };
            } else if (type === 'rotate') {
                const centerX = containerRect.left + (startRect.x + startRect.w / 2) * (containerRect.width / 100);
                const centerY = containerRect.top + (startRect.y + startRect.h / 2) * (containerRect.height / 100);
                newRotation = (Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI) + 90;
            }
            newRect = normalizeSlotRect(newRect);
            return { ...s, rect: newRect, rotation: newRotation };
        });

        layoutHistory.replace({ ...prev, slots });
        setGuideLines(activeGuides);
    }, [snapEnabled, getSnapLines, snapToLines, layoutHistory]);

    const handleMouseUp = useCallback(() => {
        if (dragRef.current) {
            layoutHistory.commit();
            dragRef.current = null;
            setGuideLines({ vertical: [], horizontal: [] });
        }
        positionDragRef.current = null;
    }, [layoutHistory]);

    const handleImagePositionMouseDown = useCallback((e: React.MouseEvent, slot: LayoutSlot) => {
        if (slot.locked || slot.type !== SlotType.IMAGE || !slot.defaultContent) return;
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const posX = slot.defaultContentPosition?.x ?? 50;
        const posY = slot.defaultContentPosition?.y ?? 50;
        positionDragRef.current = {
            slotId: slot.id,
            startX: e.clientX,
            startY: e.clientY,
            startPosX: posX,
            startPosY: posY,
            width: rect.width,
            height: rect.height,
        };
    }, []);

    const handleImagePositionMouseMove = useCallback((e: MouseEvent) => {
        if (!positionDragRef.current) return;
        const { slotId, startX, startY, startPosX, startPosY, width, height } = positionDragRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const deltaPctX = (deltaX / width) * 100 * -1;
        const deltaPctY = (deltaY / height) * 100 * -1;
        const newX = Math.min(100, Math.max(0, startPosX + deltaPctX));
        const newY = Math.min(100, Math.max(0, startPosY + deltaPctY));
        layoutHistory.replace({
            ...layoutRef.current,
            slots: layoutRef.current.slots.map(s =>
                s.id === slotId ? { ...s, defaultContentPosition: { x: newX, y: newY } } : s
            ),
        });
    }, [layoutHistory]);

    // --- Global Mouse Events ---

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            handleMouseMove(e);
            handleImagePositionMouseMove(e);
        };
        const onUp = () => {
            handleMouseUp();
            if (positionDragRef.current) {
                layoutHistory.commit();
                positionDragRef.current = null;
            }
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [handleMouseMove, handleMouseUp, handleImagePositionMouseMove, layoutHistory]);

    return {
        editingLayout,
        layoutHistory,
        activeSlotId,
        setActiveSlotId,
        activeSlot,
        showGrid,
        setShowGrid: setShowGrid as any,
        libraryOpen,
        setLibraryOpen: setLibraryOpen as any,
        guideLines,
        zoom,
        setZoom,
        snapEnabled,
        setSnapEnabled: setSnapEnabled as any,
        mousePos,
        addSlot,
        removeSlot,
        duplicateSlot,
        updateSlot,
        moveLayer,
        alignSlots,
        centerSlot,
        distributeSlots,
        resetSlotToFull,
        addPreset,
        moveSlotByArrow,
        containerRef,
        handleMouseDown,
        handleImagePositionMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseLeave,
        setBackgroundImage,
        handleBackgroundFileChange,
        handleSlotDefaultImageChange,
        loadLayout,
        startNewLayout,
        convertToCustomLayout,
        backgroundFileInputRef,
        slotImageInputRef,
        CANVAS_W,
        CANVAS_H,
    };
}
