import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageRenderer } from './components/PageRenderer';
import { RightSidebar } from './components/RightSidebar';
import { ThemeSelection } from './components/ThemeSelection';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Icons } from './components/IconComponents';
import { LayoutTemplate, SlotType } from './types';
import { LAYOUTS as STATIC_LAYOUTS } from './constants';
import { normalizeLayoutRects } from './utils';
import PDFExporter from './components/PDFExporter';

// Hooks
import { useProjects } from './hooks/useProjects';
import { useImages } from './hooks/useImages';
import { useEditor } from './hooks/useEditor';

const App: React.FC = () => {
  // --- Hooks ---
  const projects = useProjects();
  const images = useImages();

  const editor = useEditor({
    onSpreadsChange: useCallback((newSpreads, newTotalPages) => {
      images.recalculateUsage(newSpreads);
      if (projects.activeProjectId) {
        projects.updateProject(projects.activeProjectId, {
          spreads: newSpreads,
          pageCount: newTotalPages,
          updatedAt: new Date(),
        });
      }
    }, [images, projects]),
  });

  // --- Layouts (persisted) ---
  const [availableLayouts, setAvailableLayouts] = useState<LayoutTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('periodica_layouts');
      const list: LayoutTemplate[] = saved ? JSON.parse(saved) : STATIC_LAYOUTS;
      return list.map(l => normalizeLayoutRects(l));
    } catch (e) {
      return STATIC_LAYOUTS.map(l => normalizeLayoutRects(l));
    }
  });

  useEffect(() => {
    localStorage.setItem('periodica_layouts', JSON.stringify(availableLayouts));
  }, [availableLayouts]);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isExporting, setIsExporting] = useState(false);

  const handleAdminSaveLayout = (newLayout: LayoutTemplate) => {
    const normalized = normalizeLayoutRects(newLayout);
    setAvailableLayouts(prev => {
      const exists = prev.find(l => l.id === normalized.id);
      return exists ? prev.map(l => l.id === normalized.id ? normalized : l) : [...prev, normalized];
    });
  };

  const handleDeleteLayout = (layoutId: string) => {
    setAvailableLayouts(prev => prev.filter(l => l.id !== layoutId));
  };

  // --- Orchestration (connecting hooks) ---
  const handleStartNewProject = (theme: typeof projects.currentTheme & {}) => {
    const { spreads } = projects.startNewProject(theme);
    editor.initEditor(spreads);
  };

  const handleOpenProject = (project: Parameters<typeof projects.openProject>[0]) => {
    const { spreads } = projects.openProject(project);
    editor.initEditor(spreads);
  };

  // --- Routing ---
  if (editor.viewMode === 'admin') {
    return (
      <AdminPanel
        layouts={availableLayouts}
        onSaveLayout={handleAdminSaveLayout}
        onDeleteLayout={handleDeleteLayout}
        onClose={() => editor.setViewMode('editor')}
      />
    );
  }

  if (projects.currentView === 'dashboard') {
    return (
      <Dashboard
        projects={projects.projects}
        onCreateProject={() => projects.setCurrentView('theme_selection')}
        onEditProject={(p) => handleOpenProject(p)}
      />
    );
  }

  if (projects.currentView === 'theme_selection') {
    return (
      <ThemeSelection
        onSelectTheme={handleStartNewProject}
        onBack={() => projects.setCurrentView('dashboard')}
      />
    );
  }

  if (!projects.currentTheme) return null;

  // --- Editor View ---
  const safeSpreadIndex = Math.min(editor.currentSpreadIndex, editor.spreads.length - 1);
  const currentSpread = editor.spreads[safeSpreadIndex];
  const isPreview = editor.viewMode === 'preview';
  const isCover = editor.currentSpreadIndex === 0;

  let leftPageNumber = null, rightPageNumber = null;
  if (editor.currentSpreadIndex > 0) {
    const startPage = (editor.currentSpreadIndex - 1) * 2;
    if (currentSpread.leftPage.type !== 'flyleaf') leftPageNumber = startPage.toString();
    if (currentSpread.rightPage.type !== 'flyleaf') rightPageNumber = (startPage + 1).toString();
  }

  if (!currentSpread) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
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
            theme={projects.currentTheme}
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
          />
          {/* Left sidebar toggle — desktop only */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="hidden lg:flex items-center justify-center w-5 h-14 bg-white border border-gray-200 rounded-r-md text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors self-center shrink-0 -ml-px z-10"
          >
            {isLeftPanelOpen ? <Icons.ChevronLeft size={13} /> : <Icons.ChevronRight size={13} />}
          </button>
        </>
      )}

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* ─── HEADER ─── */}
        <header className="h-12 sm:h-14 bg-white border-b border-gray-200 flex items-center px-3 sm:px-5 gap-2 z-20 flex-shrink-0">
          {/* Left: back */}
          <button onClick={() => projects.setCurrentView('dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors shrink-0 mr-1">
            <Icons.Back size={18} />
            <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wide">Проекты</span>
          </button>
          <div className="w-px h-6 bg-gray-200 hidden sm:block shrink-0" />

          {/* Center: title */}
          <div className="flex-1 min-w-0 text-center px-2">
            <h1 className="text-gray-600 font-medium text-sm truncate">
              {projects.projects.find(p => p.id === projects.activeProjectId)?.name || 'Новый проект'}
            </h1>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={() => editor.setViewMode('admin')} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0" title="Админ-панель">
              <Icons.Settings size={15} />
            </button>
            <button
              onClick={() => editor.setViewMode(isPreview ? 'editor' : 'preview')}
              className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium shrink-0"
            >
              {isPreview ? <Icons.Edit size={15} /> : <Icons.Eye size={15} />}
              <span className="hidden md:inline">{isPreview ? 'Редактор' : 'Просмотр'}</span>
            </button>
            <button
              onClick={() => setIsExporting(true)}
              disabled={isExporting}
              className="hidden sm:flex items-center justify-center h-8 bg-[#FFEDEF] hover:bg-[#ffe0e3] text-gray-800 px-4 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button className="flex items-center justify-center h-8 bg-[#F9C2C6] hover:bg-[#f5b0b5] text-gray-800 px-3 sm:px-4 rounded-lg text-xs font-medium transition-colors">
              <span className="hidden sm:inline">В корзину</span>
              <Icons.Cart size={15} className="sm:hidden" />
            </button>
          </div>
        </header>

        {/* ─── CANVAS WORKSPACE ─── */}
        <div className="flex-1 relative bg-[#F3F4F6] overflow-hidden flex flex-col">
          {/* Floating toolbar: undo/redo + mobile pages */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex gap-1.5 pointer-events-auto">
              <button onClick={editor.spreadsHistory.undo} disabled={!editor.spreadsHistory.canUndo} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors">
                <Icons.Undo size={14} />
              </button>
              <button onClick={editor.spreadsHistory.redo} disabled={!editor.spreadsHistory.canRedo} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors">
                <Icons.Redo size={14} />
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
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-gray-200 shadow-sm rounded-full disabled:opacity-20 transition-all shrink-0"
              >
                <Icons.ChevronLeft size={16} />
              </button>

              {/* Pages */}
              <div className="flex flex-col items-center">
                <div className={`flex flex-col lg:flex-row shadow-xl relative w-fit mx-auto rounded-sm overflow-hidden transition-transform duration-500 ${isPreview ? 'scale-[1.02]' : 'scale-100'}`}>
                  {!isCover && (
                    <div
                      className={`shrink-0 w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[40vh] xl:w-[48vh] 2xl:w-[56vh] bg-white relative border-b lg:border-b-0 lg:border-r border-gray-100 cursor-pointer ${!isPreview && editor.activePageSide === 'left' ? 'ring-2 ring-blue-400 z-10' : 'z-0'}`}
                      style={{ aspectRatio: '1 / 1.414' }}
                    >
                      <PageRenderer pageData={currentSpread.leftPage} isSelected={!isPreview && editor.activePageSide === 'left'} onSelect={() => { editor.setActivePageSide('left'); editor.setSelectedSlot(null); }} selectedSlotId={editor.selectedSlot?.side === 'left' ? editor.selectedSlot.id : null} onSelectSlot={(id, type) => { editor.setSelectedSlot({ id, side: 'left', type }); editor.setActivePageSide('left'); if (type === SlotType.TEXT) editor.setActiveTab('text'); }} onUpdateContent={(slotId, content) => editor.updatePageContent('left', slotId, content)} onUpdateSettings={(slotId, settings) => editor.updatePageSettings('left', slotId, settings)} theme={projects.currentTheme} customLayouts={availableLayouts} getImageDimsByUrl={images.getImageDimsByUrl} readOnly={isPreview} />
                    </div>
                  )}
                  <div
                    className={`shrink-0 w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[40vh] xl:w-[48vh] 2xl:w-[56vh] bg-white relative cursor-pointer ${!isPreview && editor.activePageSide === 'right' ? 'ring-2 ring-blue-400 z-10' : 'z-0'}`}
                    style={{ aspectRatio: '1 / 1.414' }}
                  >
                    <PageRenderer pageData={currentSpread.rightPage} isSelected={!isPreview && editor.activePageSide === 'right'} onSelect={() => { editor.setActivePageSide('right'); editor.setSelectedSlot(null); }} selectedSlotId={editor.selectedSlot?.side === 'right' ? editor.selectedSlot.id : null} onSelectSlot={(id, type) => { editor.setSelectedSlot({ id, side: 'right', type }); editor.setActivePageSide('right'); if (type === SlotType.TEXT) editor.setActiveTab('text'); }} onUpdateContent={(slotId, content) => editor.updatePageContent('right', slotId, content)} onUpdateSettings={(slotId, settings) => editor.updatePageSettings('right', slotId, settings)} theme={projects.currentTheme} customLayouts={availableLayouts} getImageDimsByUrl={images.getImageDimsByUrl} readOnly={isPreview} />
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
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-gray-200 shadow-sm rounded-full disabled:opacity-20 transition-all shrink-0"
              >
                <Icons.ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDEBAR (Pages) ─── */}
      {!isPreview && (
        <>
          {/* Desktop toggle — always visible, sits outside the panel */}
          <button
            onClick={() => editor.setIsRightPanelOpen(!editor.isRightPanelOpen)}
            className="hidden lg:flex items-center justify-center w-5 h-14 bg-white border border-gray-200 rounded-l-md text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors self-center shrink-0 -mr-px z-10"
          >
            {editor.isRightPanelOpen ? <Icons.ChevronRight size={13} /> : <Icons.ChevronLeft size={13} />}
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
              <RightSidebar spreads={editor.spreads} currentSpreadIndex={editor.currentSpreadIndex} onSelectSpread={(idx) => { editor.setCurrentSpreadIndex(idx); editor.setIsMobilePagesOpen(false); }} onAddPages={editor.addPages} onClearAll={editor.handleClearAllPages} totalPages={editor.totalPages} maxPages={32} layouts={availableLayouts} />
            </div>
          </div>
        </>
      )}
      {/* PDF Export Overlay */}
      {isExporting && (
        <PDFExporter
          pages={editor.spreads.flatMap(s => [s.leftPage, s.rightPage])}
          customLayouts={availableLayouts}
          theme={projects.currentTheme}
          getImageDimsByUrl={images.getImageDimsByUrl}
          onComplete={() => setIsExporting(false)}
          onError={(err: any) => {
            console.error(err);
            alert('Ошибка при сохранении PDF');
            setIsExporting(false);
          }}
        />
      )}
    </div>
  );
};

export default App;