import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageRenderer } from './components/PageRenderer';
import { RightSidebar } from './components/RightSidebar';
import { ThemeSelection } from './components/ThemeSelection';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Icons } from './components/IconComponents';
import { Spread, PageData, PageContent, SidebarTab, UploadedImage, SlotSettings, ThemeConfig, PageType, LayoutTemplate, SlotType, AppView, Project } from './types';
import { LAYOUTS as STATIC_LAYOUTS } from './constants';
import { THEMES } from './themes';
import { generateId, deepClone, normalizeLayoutRects } from './utils';

const createPage = (type: PageType = 'content', layoutId = 'full_photo'): PageData => ({
  id: generateId(),
  layoutId,
  type,
  content: {},
  slotSettings: {}
});

const createSpread = (leftType: PageType, rightType: PageType): Spread => ({
  id: generateId(),
  leftPage: createPage(leftType),
  rightPage: createPage(rightType),
});

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('gallery');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; side: 'left' | 'right'; type: SlotType } | null>(null);
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
  
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [history, setHistory] = useState<Spread[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [activePageSide, setActivePageSide] = useState<'left' | 'right'>('right'); 
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'admin'>('editor');
  const [isMobilePagesOpen, setIsMobilePagesOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  useEffect(() => {
    if (projects.length === 0) {
        const demoTheme = THEMES[2]; 
        const demoProject: Project = {
            id: 'demo-1',
            name: 'Твое Портфолио',
            themeId: demoTheme.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            previewUrl: demoTheme.previewImage,
            spreads: [],
            pageCount: 24,
            price: '2000 ₽'
        };
        setProjects([demoProject]);
    }
  }, []);

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
        let fontQuery = '';
        if (currentTheme.id === 'lookbook') fontQuery = 'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600';
        if (currentTheme.id === 'valentine') fontQuery = 'family=Great+Vibes&family=Lato:wght@300;400;700';
        if (currentTheme.id === 'astrology') fontQuery = 'family=Cinzel:wght@400;700&family=Montserrat:wght@300;400';
        if (currentTheme.id === 'memories') fontQuery = 'family=Courier+Prime:wght@400;700&family=Merriweather:wght@300;400';
        if (!fontQuery) fontQuery = 'family=Inter:wght@300;400;600';
        link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
    }
  }, [currentTheme]);

  const addToHistory = useCallback((newSpreads: Spread[]) => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(deepClone(newSpreads));
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 20)); 
  }, [historyIndex]);

  useEffect(() => {
    setHistoryIndex(prev => Math.min(prev, history.length - 1));
  }, [history.length]);

  const undo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(prev => prev - 1);
          setSpreads(deepClone(history[historyIndex - 1]));
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(prev => prev + 1);
          setSpreads(deepClone(history[historyIndex + 1]));
      }
  };

  const updateSpreadsWithHistory = (newSpreads: Spread[]) => {
      setSpreads(newSpreads);
      setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(deepClone(newSpreads));
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      calculateImageUsage(newSpreads);
      setTotalPages((newSpreads.length - 2) * 2);
      if (activeProjectId) {
          setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, spreads: newSpreads, pageCount: (newSpreads.length - 2) * 2, updatedAt: new Date() } : p));
      }
  };

  const calculateImageUsage = (currentSpreads: Spread[]) => {
      const usageMap: {[url: string]: number} = {};
      currentSpreads.forEach(spread => {
          Object.values(spread.leftPage.content).forEach(val => { if(val) usageMap[val] = (usageMap[val] || 0) + 1; });
          Object.values(spread.rightPage.content).forEach(val => { if(val) usageMap[val] = (usageMap[val] || 0) + 1; });
      });
      setUploadedImages(prev => prev.map(img => ({ ...img, usedCount: usageMap[img.url] || 0 })));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: UploadedImage[] = Array.from(e.target.files).map(file => ({ id: generateId(), url: URL.createObjectURL(file as File), usedCount: 0 }));
      setUploadedImages(prev => [...newImages, ...prev]);
    }
  };

  const updatePageContent = (side: 'left' | 'right', slotId: string, content: string) => {
    const newSpreads = deepClone(spreads); 
    const spread = newSpreads[currentSpreadIndex];
    const pageKey = side === 'left' ? 'leftPage' : 'rightPage';
    if (spread[pageKey].type === 'flyleaf') return;
    spread[pageKey].content[slotId] = content;
    updateSpreadsWithHistory(newSpreads);
  };

  const updatePageSettings = (side: 'left' | 'right', slotId: string, settings: Partial<SlotSettings>) => {
    const newSpreads = deepClone(spreads);
    const spread = newSpreads[currentSpreadIndex]; 
    const pageKey = side === 'left' ? 'leftPage' : 'rightPage';
    if (spread[pageKey].type === 'flyleaf') return;
    const currentSettings = spread[pageKey].slotSettings[slotId] || {};
    spread[pageKey].slotSettings[slotId] = { ...currentSettings, ...settings };
    updateSpreadsWithHistory(newSpreads);
  };

  const handleLayoutSelect = (layoutId: string) => {
    const newSpreads = deepClone(spreads);
    const spread = newSpreads[currentSpreadIndex];
    const pageKey = activePageSide === 'left' ? 'leftPage' : 'rightPage';
    if (currentSpreadIndex === 0 && activePageSide === 'left') return;
    if (spread[pageKey].type === 'flyleaf') return;
    spread[pageKey].layoutId = layoutId;
    const layout = availableLayouts.find(l => l.id === layoutId);
    const content: PageContent = {};
    const slotSettings: { [slotId: string]: SlotSettings } = {};
    if (layout?.slots) {
      for (const slot of layout.slots) {
        if (slot.defaultContent) content[slot.id] = slot.defaultContent;
        if (slot.type === SlotType.IMAGE) {
          slotSettings[slot.id] = {
            fit: 'cover',
            cropX: slot.defaultContentPosition?.x ?? 50,
            cropY: slot.defaultContentPosition?.y ?? 50
          };
        }
      }
    }
    spread[pageKey].content = content;
    spread[pageKey].slotSettings = slotSettings;
    setSelectedSlot(null);
    updateSpreadsWithHistory(newSpreads);
  };

  const handleBackgroundSelect = (color: string) => {
    const newSpreads = deepClone(spreads);
    const spread = newSpreads[currentSpreadIndex];
    const pageKey = activePageSide === 'left' ? 'leftPage' : 'rightPage';
    if (spread[pageKey].type === 'flyleaf') return; 
    spread[pageKey].backgroundColor = color;
    updateSpreadsWithHistory(newSpreads);
  }

  const addPages = () => {
      if (totalPages >= 32) return;
      const newSpreads = [...spreads];
      const insertIndex = newSpreads.length - 1;
      newSpreads.splice(insertIndex, 0, createSpread('content', 'content'));
      newSpreads.splice(insertIndex, 0, createSpread('content', 'content'));
      updateSpreadsWithHistory(newSpreads);
      setCurrentSpreadIndex(insertIndex); 
      setSelectedSlot(null);
  };

  const handleClearAllPhotos = () => { if (window.confirm("Удалить фото?")) setUploadedImages([]); }
  const handleClearAllPages = () => {
    if (window.confirm("Очистить все?")) {
        const newSpreads = deepClone(spreads);
        newSpreads.forEach((s: Spread) => { 
            if (s.leftPage.type !== 'flyleaf') { s.leftPage.content = {}; s.leftPage.slotSettings = {}; }
            if (s.rightPage.type !== 'flyleaf') { s.rightPage.content = {}; s.rightPage.slotSettings = {}; }
        });
        updateSpreadsWithHistory(newSpreads);
        setSelectedSlot(null);
    }
  }

  const handleAdminSaveLayout = (newLayout: LayoutTemplate) => {
      const normalized = normalizeLayoutRects(newLayout);
      setAvailableLayouts(prev => {
          const exists = prev.find(l => l.id === normalized.id);
          return exists ? prev.map(l => l.id === normalized.id ? normalized : l) : [...prev, normalized];
      });
  };

  const generateSpreads = () => {
      const coverSpread = createSpread('cover', 'content'); 
      const frontFlyleafSpread = createSpread('flyleaf', 'content');
      const contentSpreads = Array.from({length: 8}, () => createSpread('content', 'content'));
      const backFlyleafSpread = createSpread('content', 'flyleaf');
      return [coverSpread, frontFlyleafSpread, ...contentSpreads, backFlyleafSpread];
  }

  const startNewProject = (theme: ThemeConfig) => {
      const newSpreads = generateSpreads();
      const newProject = { id: generateId(), name: 'Новый проект', themeId: theme.id, createdAt: new Date(), updatedAt: new Date(), previewUrl: theme.previewImage, spreads: newSpreads, pageCount: 20, price: theme.price };
      setProjects(prev => [...prev, newProject]);
      openProject(newProject, theme);
  };

  const openProject = (project: Project, theme?: ThemeConfig) => {
      const pTheme = theme || THEMES.find(t => t.id === project.themeId) || THEMES[0];
      setCurrentTheme(pTheme);
      setActiveProjectId(project.id);
      const initialSpreads = project.spreads.length > 0 ? project.spreads : generateSpreads();
      setSpreads(initialSpreads);
      setHistory([deepClone(initialSpreads)]);
      setHistoryIndex(0);
      setCurrentSpreadIndex(0);
      setTotalPages((initialSpreads.length - 2) * 2);
      setActivePageSide('right'); 
      setSelectedSlot(null);
      setCurrentView('editor');
  };

  if (viewMode === 'admin') return <AdminPanel layouts={availableLayouts} onSaveLayout={handleAdminSaveLayout} onClose={() => setViewMode('editor')} />;
  if (currentView === 'dashboard') return <Dashboard projects={projects} onCreateProject={() => setCurrentView('theme_selection')} onEditProject={(p) => openProject(p)} />;
  if (currentView === 'theme_selection') return <ThemeSelection onSelectTheme={startNewProject} onBack={() => setCurrentView('dashboard')} />;
  if (!currentTheme) return null; 

  const safeSpreadIndex = Math.min(currentSpreadIndex, spreads.length - 1);
  const currentSpread = spreads[safeSpreadIndex];
  const isPreview = viewMode === 'preview';
  const isCover = currentSpreadIndex === 0;

  let leftPageNumber = null, rightPageNumber = null;
  if (currentSpreadIndex > 0) {
      const startPage = (currentSpreadIndex - 1) * 2; 
      if (currentSpread.leftPage.type !== 'flyleaf') leftPageNumber = startPage.toString();
      if (currentSpread.rightPage.type !== 'flyleaf') rightPageNumber = (startPage + 1).toString();
  }

  if (!currentSpread) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      {!isPreview && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          uploadedImages={uploadedImages}
          onUpload={handleFileUpload}
          onLayoutSelect={handleLayoutSelect}
          onBackgroundSelect={handleBackgroundSelect}
          isLeftPageSelected={activePageSide === 'left'}
          theme={currentTheme}
          layouts={availableLayouts}
          onClearPhotos={handleClearAllPhotos}
          selectedSlotId={selectedSlot?.id || null}
          selectedSlotSide={selectedSlot?.side || null}
          selectedSlotType={selectedSlot?.type || null}
          onPlaceImage={(side, slotId, url) => updatePageContent(side, slotId, url)}
          onUpdateSettings={updatePageSettings}
          currentSpread={currentSpread}
        />
      )}

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        <div className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center gap-2 w-1/4">
            <button onClick={() => setCurrentView('dashboard')} className="text-gray-400 hover:text-gray-900 flex items-center gap-1"><Icons.Back size={18} /><span className="hidden sm:inline text-[10px] uppercase font-bold">Проекты</span></button>
          </div>
          <div className="flex-1 text-center truncate px-2"><h1 className="text-gray-600 font-medium text-sm sm:text-base truncate">{projects.find(p => p.id === activeProjectId)?.name || 'Новый проект'}</h1></div>
          <div className="flex items-center justify-end gap-1.5 w-1/4">
            <button onClick={() => setViewMode('admin')} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-700 rounded-full shrink-0" title="Админ-панель"><Icons.Settings size={16} /></button>
            <button onClick={() => setViewMode(isPreview ? 'editor' : 'preview')} className="text-gray-500 hover:text-gray-900 p-1.5 text-xs font-medium flex items-center gap-1">{isPreview ? <Icons.Edit size={18} /> : <Icons.Eye size={18} />}<span className="hidden md:inline">{isPreview ? 'Редактор' : 'Просмотр'}</span></button>
            <button className="hidden sm:flex items-center justify-center min-w-[7rem] h-9 bg-[#FFEDEF] text-gray-900 px-4 py-2 rounded-sm text-xs font-medium">Сохранить</button>
            <button className="flex items-center justify-center min-w-[7rem] h-9 bg-[#F9C2C6] text-gray-900 px-4 py-2 rounded-sm text-xs font-medium">{window.innerWidth < 640 ? <Icons.Cart size={16} /> : 'В корзину'}</button>
          </div>
        </div>

        <div className="flex-1 relative bg-[#F9F9F9] overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
               <button onClick={undo} disabled={historyIndex <= 0} className="p-2 bg-white border border-gray-200 shadow-sm rounded-md disabled:opacity-50"><Icons.Undo size={16} /></button>
               <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 bg-white border border-gray-200 shadow-sm rounded-md disabled:opacity-50"><Icons.Redo size={16} /></button>
          </div>
          {!isPreview && (
              <button onClick={() => setIsMobilePagesOpen(true)} className="lg:hidden absolute top-4 right-4 z-20 p-2 bg-white border border-gray-200 shadow-sm rounded-md flex items-center gap-2"><Icons.Layout size={16} /><span className="text-[10px] font-bold uppercase">Страницы</span></button>
          )}

          <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-4 sm:p-10 overflow-auto custom-scrollbar" onClick={() => setSelectedSlot(null)}>
            <div className={`flex flex-col items-center transition-transform duration-500 ${isPreview ? 'scale-[1.02] sm:scale-105' : 'scale-100'} w-full max-w-5xl mx-auto pb-40 lg:pb-0`}>
              <div className="flex flex-col lg:flex-row shadow-2xl relative w-fit mx-auto">
                  {!isCover && (
                      <div className={`w-[85vw] sm:w-[60vw] lg:w-[35vh] xl:w-[40vh] bg-white relative border-b lg:border-b-0 lg:border-r border-gray-100 ${!isPreview && activePageSide === 'left' ? 'z-10 ring-2 ring-blue-400' : 'z-0'}`} style={{ aspectRatio: '1 / 1.414' }}>
                        <PageRenderer pageData={currentSpread.leftPage} isSelected={!isPreview && activePageSide === 'left'} onSelect={() => { setActivePageSide('left'); setSelectedSlot(null); }} selectedSlotId={selectedSlot?.side === 'left' ? selectedSlot.id : null} onSelectSlot={(id, type) => { setSelectedSlot({ id, side: 'left', type }); setActivePageSide('left'); if (type === SlotType.TEXT) setActiveTab('text'); }} onUpdateContent={(slotId, content) => updatePageContent('left', slotId, content)} onUpdateSettings={(slotId, settings) => updatePageSettings('left', slotId, settings)} theme={currentTheme} customLayouts={availableLayouts} />
                      </div>
                  )}
                  <div className={`w-[85vw] sm:w-[60vw] lg:w-[35vh] xl:w-[40vh] bg-white relative border-gray-100 ${!isPreview && activePageSide === 'right' ? 'z-10 ring-2 ring-blue-400' : 'z-0'}`} style={{ aspectRatio: '1 / 1.414' }}>
                    <PageRenderer pageData={currentSpread.rightPage} isSelected={!isPreview && activePageSide === 'right'} onSelect={() => { setActivePageSide('right'); setSelectedSlot(null); }} selectedSlotId={selectedSlot?.side === 'right' ? selectedSlot.id : null} onSelectSlot={(id, type) => { setSelectedSlot({ id, side: 'right', type }); setActivePageSide('right'); if (type === SlotType.TEXT) setActiveTab('text'); }} onUpdateContent={(slotId, content) => updatePageContent('right', slotId, content)} onUpdateSettings={(slotId, settings) => updatePageSettings('right', slotId, settings)} theme={currentTheme} customLayouts={availableLayouts} />
                  </div>
              </div>
              <div className="flex w-full mt-6 sm:mt-10 px-4">{isCover ? <span className="w-full text-center text-gray-300 font-medium text-xs">Обложка</span> : <><div className="flex-1 flex justify-center">{leftPageNumber && <span className="text-gray-400 font-medium text-xs border-b border-gray-200 pb-0.5 px-2">{leftPageNumber}</span>}</div><div className="flex-1 flex justify-center">{rightPageNumber && <span className="text-gray-400 font-medium text-xs border-b border-gray-200 pb-0.5 px-2">{rightPageNumber}</span>}</div></>}</div>
            </div>
          </div>
        </div>
      </div>

      {!isPreview && (
         <div className={`
            fixed lg:static inset-0 z-50 lg:z-10 transition-all duration-300 flex
            ${isMobilePagesOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            ${isRightPanelOpen ? 'lg:w-72' : 'lg:w-0'}
         `}>
             <div className="lg:hidden absolute inset-0" onClick={() => setIsMobilePagesOpen(false)} />
             
             {/* TOGGLE BUTTON DESKTOP (Always clickable) */}
             <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="hidden lg:flex absolute lg:static left-0 lg:-ml-8 top-1/2 -translate-y-1/2 bg-white border border-r-0 border-gray-200 p-1.5 rounded-l-md text-gray-400 hover:text-gray-900 shadow-md z-[60] transition-colors self-center"
                style={{ pointerEvents: 'auto' }}
             >
                {isRightPanelOpen ? <Icons.ChevronRight size={16} /> : <Icons.ChevronLeft size={16} />}
             </button>

             <div className={`
                absolute lg:relative right-0 lg:right-auto top-0 bottom-0 w-72 sm:w-80 lg:w-full bg-white shadow-xl lg:shadow-none h-full border-l border-gray-200 transition-all duration-300
                ${!isRightPanelOpen && 'lg:opacity-0 lg:pointer-events-none'}
             `}>
                <div className="lg:hidden flex items-center justify-between p-4 border-b">
                    <span className="font-bold text-sm uppercase">Страницы</span>
                    <button onClick={() => setIsMobilePagesOpen(false)} className="p-2 text-gray-400"><Icons.Close size={20} /></button>
                </div>
                <RightSidebar spreads={spreads} currentSpreadIndex={currentSpreadIndex} onSelectSpread={(idx) => { setCurrentSpreadIndex(idx); setIsMobilePagesOpen(false); }} onAddPages={addPages} onClearAll={handleClearAllPages} totalPages={totalPages} maxPages={32} layouts={availableLayouts} />
             </div>
         </div>
      )}
    </div>
  );
};

export default App;