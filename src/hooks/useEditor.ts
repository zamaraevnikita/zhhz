import { useState, useCallback } from 'react';
import {
    Spread,
    SlotSettings,
    SlotType,
    SidebarTab,
    LayoutTemplate,
    PageContent,
} from '../types';
import { deepClone } from '../utils';
import { useHistory, UseHistoryReturn } from './useHistory';
import { createSpread } from '../services/spreadService';
import { buildPageFromLayout } from '../services/layoutService';

export interface UseEditorReturn {
    // Spreads (with history)
    spreads: Spread[];
    spreadsHistory: UseHistoryReturn<Spread[]>;
    totalPages: number;

    // Navigation
    currentSpreadIndex: number;
    setCurrentSpreadIndex: (index: number) => void;
    activePageSide: 'left' | 'right';
    setActivePageSide: (side: 'left' | 'right') => void;

    // Slot selection
    selectedSlot: { id: string; side: 'left' | 'right'; type: SlotType } | null;
    setSelectedSlot: (slot: { id: string; side: 'left' | 'right'; type: SlotType } | null) => void;

    // View & UI
    viewMode: 'editor' | 'preview' | 'admin' | 'cart';
    setViewMode: (mode: 'editor' | 'preview' | 'admin' | 'cart') => void;
    activeTab: SidebarTab;
    setActiveTab: (tab: SidebarTab) => void;
    isMobilePagesOpen: boolean;
    setIsMobilePagesOpen: (open: boolean) => void;
    isRightPanelOpen: boolean;
    setIsRightPanelOpen: (open: boolean) => void;

    // Actions
    updatePageContent: (side: 'left' | 'right', slotId: string, content: string) => void;
    updatePageSettings: (side: 'left' | 'right', slotId: string, settings: Partial<SlotSettings>) => void;
    handleLayoutSelect: (layoutId: string, layouts: LayoutTemplate[]) => void;
    handleBackgroundSelect: (color: string) => void;
    addPages: () => void;
    handleClearAllPages: () => void;

    // Init
    initEditor: (initialSpreads: Spread[]) => void;
}

/**
 * Хук ядра редактора — работа с разворотами, страницами, слотами.
 */
export function useEditor(params: {
    onSpreadsChange?: (spreads: Spread[], totalPages: number) => void;
}): UseEditorReturn {
    const { onSpreadsChange } = params;

    const spreadsHistory = useHistory<Spread[]>([]);

    // Derived
    const spreads = spreadsHistory.current;
    const totalPages = Math.max(0, (spreads.length - 2) * 2);

    // Navigation
    const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
    const [activePageSide, setActivePageSide] = useState<'left' | 'right'>('right');

    // Selection
    const [selectedSlot, setSelectedSlot] = useState<{ id: string; side: 'left' | 'right'; type: SlotType } | null>(null);

    // View
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'admin' | 'cart'>('editor');
    const [activeTab, setActiveTab] = useState<SidebarTab>('gallery');
    const [isMobilePagesOpen, setIsMobilePagesOpen] = useState(false);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    // Helper: обновить spreads с записью в историю и уведомить
    const updateSpreads = useCallback((newSpreads: Spread[]) => {
        spreadsHistory.set(newSpreads);
        const newTotalPages = Math.max(0, (newSpreads.length - 2) * 2);
        onSpreadsChange?.(newSpreads, newTotalPages);
    }, [spreadsHistory, onSpreadsChange]);

    const updatePageContent = useCallback((side: 'left' | 'right', slotId: string, content: string) => {
        const newSpreads = deepClone(spreads);
        const spread = newSpreads[currentSpreadIndex];
        const pageKey = side === 'left' ? 'leftPage' : 'rightPage';
        if (spread[pageKey].type === 'flyleaf') return;
        spread[pageKey].content[slotId] = content;
        updateSpreads(newSpreads);
    }, [spreads, currentSpreadIndex, updateSpreads]);

    const updatePageSettings = useCallback((side: 'left' | 'right', slotId: string, settings: Partial<SlotSettings>) => {
        const newSpreads = deepClone(spreads);
        const spread = newSpreads[currentSpreadIndex];
        const pageKey = side === 'left' ? 'leftPage' : 'rightPage';
        if (spread[pageKey].type === 'flyleaf') return;
        const currentSettings = spread[pageKey].slotSettings[slotId] || {};
        spread[pageKey].slotSettings[slotId] = { ...currentSettings, ...settings };
        updateSpreads(newSpreads);
    }, [spreads, currentSpreadIndex, updateSpreads]);

    const handleLayoutSelect = useCallback((layoutId: string, layouts: LayoutTemplate[]) => {
        const newSpreads = deepClone(spreads);
        const spread = newSpreads[currentSpreadIndex];
        const pageKey = activePageSide === 'left' ? 'leftPage' : 'rightPage';
        if (currentSpreadIndex === 0 && activePageSide === 'left') return;
        if (spread[pageKey].type === 'flyleaf') return;

        spread[pageKey].layoutId = layoutId;
        const layout = layouts.find(l => l.id === layoutId);
        const { content, slotSettings } = buildPageFromLayout(layout);
        spread[pageKey].content = content;
        spread[pageKey].slotSettings = slotSettings;

        setSelectedSlot(null);
        updateSpreads(newSpreads);
    }, [spreads, currentSpreadIndex, activePageSide, updateSpreads]);

    const handleBackgroundSelect = useCallback((color: string) => {
        const newSpreads = deepClone(spreads);
        const spread = newSpreads[currentSpreadIndex];
        const pageKey = activePageSide === 'left' ? 'leftPage' : 'rightPage';
        if (spread[pageKey].type === 'flyleaf') return;
        spread[pageKey].backgroundColor = color;
        updateSpreads(newSpreads);
    }, [spreads, currentSpreadIndex, activePageSide, updateSpreads]);

    const addPages = useCallback(() => {
        if (totalPages >= 32) return;
        const newSpreads = [...spreads];
        const insertIndex = newSpreads.length - 1;
        newSpreads.splice(insertIndex, 0, createSpread('content', 'content'));
        newSpreads.splice(insertIndex, 0, createSpread('content', 'content'));
        updateSpreads(newSpreads);
        setCurrentSpreadIndex(insertIndex);
        setSelectedSlot(null);
    }, [spreads, totalPages, updateSpreads]);

    const handleClearAllPages = useCallback(() => {
        if (window.confirm('Очистить все?')) {
            const newSpreads = deepClone(spreads);
            newSpreads.forEach((s: Spread) => {
                if (s.leftPage.type !== 'flyleaf') { s.leftPage.content = {}; s.leftPage.slotSettings = {}; }
                if (s.rightPage.type !== 'flyleaf') { s.rightPage.content = {}; s.rightPage.slotSettings = {}; }
            });
            updateSpreads(newSpreads);
            setSelectedSlot(null);
        }
    }, [spreads, updateSpreads]);

    const initEditor = useCallback((initialSpreads: Spread[]) => {
        spreadsHistory.set(initialSpreads);
        setCurrentSpreadIndex(0);
        setActivePageSide('right');
        setSelectedSlot(null);
    }, [spreadsHistory]);

    return {
        spreads,
        spreadsHistory,
        totalPages,
        currentSpreadIndex,
        setCurrentSpreadIndex,
        activePageSide,
        setActivePageSide,
        selectedSlot,
        setSelectedSlot,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        isMobilePagesOpen,
        setIsMobilePagesOpen,
        isRightPanelOpen,
        setIsRightPanelOpen,
        updatePageContent,
        updatePageSettings,
        handleLayoutSelect,
        handleBackgroundSelect,
        addPages,
        handleClearAllPages,
        initEditor,
    };
}
