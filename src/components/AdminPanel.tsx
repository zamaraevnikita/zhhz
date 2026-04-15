import React, { useEffect } from 'react';
import { LayoutTemplate } from '../types';
import { useAdminPanel } from '../hooks/useAdminPanel';
import { useOrders } from '../hooks/useOrders';
import { useImages } from '../hooks/useImages';
import { Project } from '../types';
import PDFExporter from './PDFExporter';
import { THEMES } from '../themes';
import { LayoutGrid, Trash2 } from 'lucide-react';
import { AdminTopBar } from './admin/AdminTopBar';
import { AdminOrders } from './admin/AdminOrders';
import { AdminLayoutSidebar } from './admin/AdminLayoutSidebar';
import { AdminPanelLayoutArea } from './admin/AdminPanelLayoutArea';
import { AdminPanelProperties } from './admin/AdminPanelProperties';
import { AdminDesignTemplates } from './admin/AdminDesignTemplates';

interface AdminPanelProps {
    layouts: LayoutTemplate[];
    onSaveLayout: (layout: LayoutTemplate) => void;
    onDeleteLayout: (layoutId: string) => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ layouts, onSaveLayout, onDeleteLayout, onClose }) => {
    const admin = useAdminPanel(layouts);
    const { editingLayout, activeSlot, activeSlotId } = admin;
    const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
    const [adminTab, setAdminTab] = React.useState<'layouts' | 'orders' | 'design_templates'>('layouts');

    const { orders } = useOrders();
    const { getImageDimsByUrl } = useImages();
    const [exportProject, setExportProject] = React.useState<Project | null>(null);

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
    }, [admin, activeSlot, activeSlotId, adminTab]);

    return (
        <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col text-gray-100 font-sans overflow-hidden">
            <AdminTopBar adminTab={adminTab} setAdminTab={setAdminTab} onClose={onClose} />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {adminTab === 'orders' && (
                    <AdminOrders orders={orders} setExportProject={setExportProject} />
                )}

                {adminTab === 'design_templates' && (
                    <AdminDesignTemplates />
                )}

                {/* ===== LAYOUTS BUILDER ===== */}
                {adminTab === 'layouts' && (
                    <>
                        <AdminLayoutSidebar
                            admin={admin}
                            editingLayout={editingLayout}
                            activeSlotId={activeSlotId}
                            onSaveLayout={onSaveLayout}
                            onClose={onClose}
                        />

                        <AdminPanelLayoutArea
                            admin={admin}
                            editingLayout={editingLayout}
                            activeSlotId={activeSlotId}
                            activeSlot={activeSlot}
                        />

                        <AdminPanelProperties
                            activeSlot={activeSlot}
                            admin={admin}
                        />

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
                    </>
                )}
            </div>

            {/* PDF Export Overlay */}
            {exportProject && (() => {
                const theme = THEMES.find(t => t.id === exportProject.themeId) ?? THEMES[0];
                return (
                    <PDFExporter
                        pages={exportProject.spreads.flatMap((s, i) => i === 0 ? [s.rightPage] : [s.leftPage, s.rightPage])}
                        theme={theme}
                        customLayouts={layouts}
                        getImageDimsByUrl={getImageDimsByUrl}
                        onComplete={() => setExportProject(null)}
                        onError={(err: any) => {
                            console.error('Export failed', err);
                            alert('Ошибка экспорта заказа.');
                            setExportProject(null);
                        }}
                    />
                );
            })()}
        </div>
    );
};