import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PageRenderer } from './PageRenderer';
import { RightSidebar } from './RightSidebar';
import { Icons } from './IconComponents';
import { SlotType } from '../types';
import PDFExporter from './PDFExporter';
import { THEMES } from '../themes';

// Hooks
import { useProjects } from '../hooks/useProjects';
import { useImages } from '../hooks/useImages';
import { useEditor } from '../hooks/useEditor';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useLayouts } from '../hooks/useLayouts';

export const EditorView: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const projects = useProjects();
    const images = useImages();
    const { addToCart, cartItemCount } = useCart();
    const { role } = useAuth();
    const { layouts: availableLayouts } = useLayouts();

    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const activeProject = projects.projects.find(p => p.id === projectId);
    const currentTheme = activeProject ? (THEMES.find(t => t.id === activeProject.themeId) || THEMES[0]) : null;

    useEffect(() => {
        if (!activeProject && projectId && !fetchError) {
            projects.loadProjectById(projectId).catch((err) => {
                console.error("Project not found", err);
                setFetchError(true);
            });
        }
    }, [activeProject, projectId, fetchError, projects]);

    const editor = useEditor({
        onSpreadsChange: useCallback((newSpreads, newTotalPages) => {
            images.recalculateUsage(newSpreads);
            if (projectId) {
                projects.updateProject(projectId, {
                    spreads: newSpreads,
                    pageCount: newTotalPages,
                    updatedAt: new Date(),
                }).catch(err => console.error("Auto-save failed", err));
            }
        }, [images, projects, projectId]),
    });

    // Initialize editor with project data once loaded
    useEffect(() => {
        if (activeProject && !isInitialized) {
            if (activeProject.spreads && activeProject.spreads.length > 0) {
                editor.initEditor(activeProject.spreads);
            }
            setIsInitialized(true);
        }
    }, [activeProject, isInitialized]); // Removed editor from deps to avoid loop

    // Theme Font Loading
    useEffect(() => {
        if (currentTheme) {
            const linkId = 'theme-fonts';
            let link = document.getElementById(linkId) as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            let fontQuery = 'family=Inter:wght@300;400;600';
            if (currentTheme.id === 'lookbook') fontQuery = 'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600';
            if (currentTheme.id === 'valentine') fontQuery = 'family=Great+Vibes&family=Lato:wght@300;400;700';
            if (currentTheme.id === 'astrology') fontQuery = 'family=Cinzel:wght@400;700&family=Montserrat:wght@300;400';
            if (currentTheme.id === 'memories') fontQuery = 'family=Courier+Prime:wght@400;700&family=Merriweather:wght@300;400';
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
        }
    }, [currentTheme]);

    if (fetchError) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-50 text-gray-500 gap-4">
                <Icons.Eye className="text-red-400" size={48} />
                <h2 className="text-xl font-bold text-gray-800">Проект не найден</h2>
                <p>Возможно, он был удален или у вас нет доступа.</p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-bold">На главную</button>
            </div>
        );
    }

    if (!activeProject || !currentTheme || !isInitialized) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-50 text-gray-500 gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin"></div>
                Загрузка проекта...
            </div>
        );
    }

    const safeSpreadIndex = Math.min(editor.currentSpreadIndex, editor.spreads.length - 1);
    const currentSpread = editor.spreads[safeSpreadIndex];

    if (!currentSpread) return null;

    const isPreview = editor.viewMode === 'preview';
    const isCover = editor.currentSpreadIndex === 0;

    let leftPageNumber = null, rightPageNumber = null;
    if (editor.currentSpreadIndex > 0) {
        const startPage = (editor.currentSpreadIndex - 1) * 2;
        if (currentSpread.leftPage.type !== 'flyleaf') leftPageNumber = startPage.toString();
        if (currentSpread.rightPage.type !== 'flyleaf') rightPageNumber = (startPage + 1).toString();
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-900">
            {!isPreview && (
                <>
                    <Sidebar
                        activeTab={editor.activeTab}
                        setActiveTab={editor.setActiveTab}
                        uploadedImages={images.uploadedImages}
                        onUpload={images.handleFileUpload}
                        onLayoutSelect={(layoutId) => editor.handleLayoutSelect(layoutId, availableLayouts)}
                        onBackgroundSelect={editor.handleBackgroundSelect}
                        isLeftPageSelected={editor.activePageSide === 'left'}
                        theme={currentTheme}
                        layouts={availableLayouts}
                        onClearPhotos={images.clearAll}
                        selectedSlotId={editor.selectedSlot?.id || null}
                        selectedSlotSide={editor.selectedSlot?.side || null}
                        selectedSlotType={editor.selectedSlot?.type || null}
                        onPlaceImage={(side, slotId, url) => editor.updatePageContent(side, slotId, url)}
                        onUpdateSettings={editor.updatePageSettings}
                        currentSpread={currentSpread}
                        isPanelOpen={isLeftPanelOpen}
                        onTogglePanel={setIsLeftPanelOpen}
                        onAutoFill={() => {
                            const count = editor.autoFillPhotos(images.uploadedImages, availableLayouts);
                            if (count > 0) {
                                // Быстрый toast-уведомление
                                const toast = document.createElement('div');
                                toast.textContent = `✨ Заполнено ${count} слотов`;
                                toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-bounce';
                                document.body.appendChild(toast);
                                setTimeout(() => toast.remove(), 2500);
                            } else {
                                const toast = document.createElement('div');
                                toast.textContent = 'Все слоты уже заполнены';
                                toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50';
                                document.body.appendChild(toast);
                                setTimeout(() => toast.remove(), 2500);
                            }
                        }}
                        onApplyTemplate={(tmpl) => {
                            const count = editor.applyDesignTemplate(tmpl, availableLayouts, images.uploadedImages);
                            const toast = document.createElement('div');
                            toast.textContent = `🎨 Шаблон применен (сохранено ${count} фото)`;
                            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-bounce';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 3000);
                        }}
                    />
                    {/* Left sidebar toggle — desktop only */}
                    <button
                        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                        className="hidden lg:flex items-center justify-center w-5 h-16 bg-white/60 backdrop-blur-xl border border-white/60 rounded-r-xl shadow-lg hover:shadow-xl hover:bg-white text-gray-400 hover:text-gray-900 transition-all self-center shrink-0 -ml-px z-30"
                    >
                        {isLeftPanelOpen ? <Icons.ChevronLeft size={14} strokeWidth={2.5} /> : <Icons.ChevronRight size={14} strokeWidth={2.5} />}
                    </button>
                </>
            )}

            {/* MAIN COLUMN */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                {/* ─── HEADER ─── */}
                <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-2xl border-b border-black/5 flex items-center px-3 sm:px-6 gap-2 z-20 flex-shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    {/* Left: back */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors shrink-0 mr-1">
                        <Icons.Back size={18} />
                        <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wide">Проекты</span>
                    </button>
                    <div className="w-px h-6 bg-gray-200 hidden sm:block shrink-0" />

                    {/* Center: title */}
                    <div className="flex-1 min-w-0 text-center px-2">
                        <h1 className="text-gray-600 font-medium text-sm truncate">
                            {activeProject.name}
                        </h1>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {role === 'ADMIN' && (
                            <button onClick={() => navigate('/admin')} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0" title="Админ-панель">
                                <Icons.Settings size={15} />
                            </button>
                        )}
                        <button
                            onClick={() => editor.setViewMode(isPreview ? 'editor' : 'preview')}
                            className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium shrink-0"
                        >
                            {isPreview ? <Icons.Edit size={15} /> : <Icons.Eye size={15} />}
                            <span className="hidden md:inline">{isPreview ? 'Редактор' : 'Просмотр'}</span>
                        </button>
                        {role === 'ADMIN' ? (
                            <button
                                onClick={() => setIsExporting(true)}
                                disabled={isExporting}
                                className="hidden sm:flex items-center justify-center h-8 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-800 px-4 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                                {isExporting ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    try {
                                        setIsSaving(true);
                                        // Force save the actual active project first
                                        if (projectId) {
                                            await projects.updateProject(projectId, {
                                                spreads: editor.spreadsHistory.current
                                            });
                                        }

                                        // Add it to cart and redirect
                                        addToCart(activeProject);
                                        navigate('/cart');
                                    } catch (e) {
                                        console.error("Failed to add to cart", e);
                                        alert("Ошибка при сохранении в корзину.");
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className="hidden sm:flex items-center justify-center gap-1.5 h-8 bg-gray-900 border hover:bg-black text-white px-4 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'ОБРАБОТКА...' : <>В КОРЗИНУ <Icons.Cart size={14} /></>}
                            </button>
                        )}
                        <button onClick={() => navigate('/cart')} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0 relative" title="Корзина">
                            <Icons.Cart size={15} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* ─── CANVAS WORKSPACE ─── */}
                <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex flex-col">
                    {/* Floating toolbar: undo/redo + mobile pages */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                        <div className="flex gap-2 pointer-events-auto">
                            <button onClick={editor.spreadsHistory.undo} disabled={!editor.spreadsHistory.canUndo} className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded-xl disabled:opacity-40 hover:bg-white hover:scale-105 active:scale-95 transition-all text-gray-600">
                                <Icons.Undo size={16} />
                            </button>
                            <button onClick={editor.spreadsHistory.redo} disabled={!editor.spreadsHistory.canRedo} className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded-xl disabled:opacity-40 hover:bg-white hover:scale-105 active:scale-95 transition-all text-gray-600">
                                <Icons.Redo size={16} />
                            </button>
                        </div>
                        {!isPreview && (
                            <button onClick={() => editor.setIsMobilePagesOpen(true)} className="lg:hidden flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-bold uppercase text-gray-600 pointer-events-auto hover:bg-gray-50 transition-colors">
                                <Icons.Layout size={13} />
                                Стр.
                            </button>
                        )}
                    </div>

                    {/* Canvas + navigation: на узких экранах — прижатие к верху, чтобы страницу было видно сверху */}
                    <div className="flex-1 flex items-start lg:items-center justify-center overflow-auto custom-scrollbar min-h-0">
                        <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 lg:p-10 relative flex-shrink-0">
                            {/* Prev spread */}
                            <button
                                onClick={() => editor.setCurrentSpreadIndex(Math.max(0, editor.currentSpreadIndex - 1))}
                                disabled={editor.currentSpreadIndex === 0}
                                className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 border border-white/60 shadow-xl rounded-full disabled:opacity-30 disabled:hover:scale-100 transition-all shrink-0 text-gray-500"
                            >
                                <Icons.ChevronLeft size={18} strokeWidth={2.5} />
                            </button>

                            {/* Pages */}
                            <div className="flex flex-col items-center">
                                <div className={`flex flex-col lg:flex-row shadow-2xl shadow-black/10 ring-1 ring-black/5 relative w-fit mx-auto rounded-sm overflow-hidden transition-transform duration-500 ${isPreview ? 'scale-[1.03]' : 'scale-100'}`}>
                                    {!isCover && (
                                        <div
                                            className={`shrink-0 w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[40vh] xl:w-[48vh] 2xl:w-[56vh] bg-white relative border-b lg:border-b-0 lg:border-r border-gray-100 cursor-pointer ${!isPreview && editor.activePageSide === 'left' ? 'ring-2 ring-blue-400 z-10' : 'z-0'}`}
                                        >
                                            <PageRenderer pageData={currentSpread.leftPage} isSelected={!isPreview && editor.activePageSide === 'left'} onSelect={() => { editor.setActivePageSide('left'); editor.setSelectedSlot(null); }} selectedSlotId={editor.selectedSlot?.side === 'left' ? editor.selectedSlot.id : null} onSelectSlot={(id, type) => { editor.setSelectedSlot({ id, side: 'left', type }); editor.setActivePageSide('left'); if (type === SlotType.TEXT) editor.setActiveTab('text'); }} onUpdateContent={(slotId, content) => editor.updatePageContent('left', slotId, content)} onUpdateSettings={(slotId, settings) => editor.updatePageSettings('left', slotId, settings)} theme={currentTheme} customLayouts={availableLayouts} getImageDimsByUrl={images.getImageDimsByUrl} readOnly={isPreview} />
                                        </div>
                                    )}
                                    <div
                                        className={`shrink-0 w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[40vh] xl:w-[48vh] 2xl:w-[56vh] bg-white relative cursor-pointer ${!isPreview && editor.activePageSide === 'right' ? 'ring-2 ring-blue-400 z-10' : 'z-0'}`}
                                    >
                                        <PageRenderer pageData={currentSpread.rightPage} isSelected={!isPreview && editor.activePageSide === 'right'} onSelect={() => { editor.setActivePageSide('right'); editor.setSelectedSlot(null); }} selectedSlotId={editor.selectedSlot?.side === 'right' ? editor.selectedSlot.id : null} onSelectSlot={(id, type) => { editor.setSelectedSlot({ id, side: 'right', type }); editor.setActivePageSide('right'); if (type === SlotType.TEXT) editor.setActiveTab('text'); }} onUpdateContent={(slotId, content) => editor.updatePageContent('right', slotId, content)} onUpdateSettings={(slotId, settings) => editor.updatePageSettings('right', slotId, settings)} theme={currentTheme} customLayouts={availableLayouts} getImageDimsByUrl={images.getImageDimsByUrl} readOnly={isPreview} />
                                    </div>
                                </div>

                                {/* Page numbers */}
                                <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-400 font-medium">
                                    {isCover ? (
                                        <span>Обложка</span>
                                    ) : (
                                        <>
                                            {leftPageNumber && <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">{leftPageNumber}</span>}
                                            {rightPageNumber && <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">{rightPageNumber}</span>}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Next spread */}
                            <button
                                onClick={() => editor.setCurrentSpreadIndex(Math.min(editor.spreads.length - 1, editor.currentSpreadIndex + 1))}
                                disabled={editor.currentSpreadIndex >= editor.spreads.length - 1}
                                className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 border border-white/60 shadow-xl rounded-full disabled:opacity-30 disabled:hover:scale-100 transition-all shrink-0 text-gray-500"
                            >
                                <Icons.ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* ─── RIGHT SIDEBAR (Pages) ─── */}
            {
                !isPreview && (
                    <>
                        {/* Desktop toggle — always visible, sits outside the panel */}
                        <button
                            onClick={() => editor.setIsRightPanelOpen(!editor.isRightPanelOpen)}
                            className="hidden lg:flex flex-col gap-1 items-center justify-center w-6 h-16 bg-white/60 backdrop-blur-xl border border-white/60 rounded-l-xl shadow-lg hover:shadow-xl hover:bg-white text-gray-400 hover:text-gray-900 transition-all self-center shrink-0 -mr-px z-30"
                        >
                            {editor.isRightPanelOpen ? <Icons.ChevronRight size={14} strokeWidth={2.5} /> : <Icons.ChevronLeft size={14} strokeWidth={2.5} />}
                        </button>

                        {/* Panel wrapper */}
                        <div className={`
              transition-all duration-300 overflow-hidden shrink-0
              ${editor.isRightPanelOpen ? 'lg:w-56 xl:w-64' : 'lg:w-0'}
              fixed lg:static inset-0 z-50 lg:z-10
              ${editor.isMobilePagesOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
           `}>
                            {/* Mobile backdrop */}
                            <div className={`lg:hidden absolute inset-0 bg-black/10 transition-opacity ${editor.isMobilePagesOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => editor.setIsMobilePagesOpen(false)} />

                            <div className={`
                  absolute lg:relative right-0 lg:right-auto top-0 bottom-0 w-[280px] lg:w-full bg-white shadow-xl lg:shadow-none h-full transition-all duration-300
               `}>
                                {/* Mobile header */}
                                <div className="lg:hidden flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Страницы</span>
                                    <button onClick={() => editor.setIsMobilePagesOpen(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                        <Icons.Close size={16} />
                                    </button>
                                </div>
                                <RightSidebar
                                    spreads={editor.spreads}
                                    currentSpreadIndex={editor.currentSpreadIndex}
                                    activePageSide={editor.activePageSide}
                                    onSelectSpread={(idx, side) => {
                                        editor.setCurrentSpreadIndex(idx);
                                        if (side) editor.setActivePageSide(side);
                                        editor.setIsMobilePagesOpen(false);
                                    }}
                                    onAddPages={editor.addPages}
                                    onClearAll={editor.handleClearAllPages}
                                    totalPages={editor.totalPages}
                                    maxPages={32}
                                    layouts={availableLayouts}
                                    theme={currentTheme}
                                    onReorderSpreads={editor.reorderSpreads}
                                />
                            </div>
                        </div>
                    </>
                )
            }
            {/* PDF Export Overlay */}
            {
                isExporting && (
                    <PDFExporter
                        pages={editor.spreads.flatMap((s, i) => i === 0 ? [s.rightPage] : [s.leftPage, s.rightPage])}
                        theme={currentTheme}
                        customLayouts={availableLayouts}
                        getImageDimsByUrl={images.getImageDimsByUrl}
                        onComplete={() => setIsExporting(false)}
                        onError={(err: any) => {
                            console.error(err);
                            alert('Ошибка при сохранении PDF');
                            setIsExporting(false);
                        }}
                    />
                )
            }
        </div >
    );
};
