import React, { useState, useRef, useEffect } from 'react';
import { PageData, SlotType, LayoutTemplate, ThemeConfig, SlotSettings } from '../types';
import { Icons } from './IconComponents';
import { calculatePrintQuality } from '../services/imageQualityService';
import { PhotoEditorModal } from './PhotoEditorModal';
import { SlotRenderer } from './SlotRenderer';

interface PageRendererProps {
  pageData: PageData;
  isSelected: boolean;
  onSelect: () => void;
  // Selection handling for slots
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, type: SlotType) => void;
  // Updates
  onUpdateContent: (slotId: string, content: string) => void;
  onUpdateSettings: (slotId: string, settings: Partial<SlotSettings>) => void;
  theme: ThemeConfig;
  customLayouts?: LayoutTemplate[];
  getImageDimsByUrl?: (url: string) => { width: number; height: number } | null;
  readOnly?: boolean;
  isExporting?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pageData,
  isSelected,
  onSelect,
  selectedSlotId,
  onSelectSlot,
  onUpdateContent,
  onUpdateSettings,
  theme,
  customLayouts = [],
  getImageDimsByUrl,
  readOnly = false,
  isExporting = false,
}) => {
  const [croppingSlotId, setCroppingSlotId] = useState<string | null>(null);
  const [photoEditorSlot, setPhotoEditorSlot] = useState<{ slotId: string; imageUrl: string; slotW: number; slotH: number } | null>(null);

  // Master Canvas Scaling Logic guarantees 100% bounds parity
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isExporting || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setScale(entry.contentRect.width / 1200);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isExporting]);

  // --- CROP LOGIC (Top level to respect rules of hooks) ---
  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number; width: number; height: number; currentCropX?: number; currentCropY?: number; } | null>(null);

  useEffect(() => {
    if (croppingSlotId && !readOnly) {
      const handleCropMouseMove = (e: MouseEvent) => {
        if (!dragRef.current || !croppingSlotId) return;
        e.preventDefault();
        e.stopPropagation();

        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        const deltaPctX = (deltaX / dragRef.current.width) * 100 * -1;
        const deltaPctY = (deltaY / dragRef.current.height) * 100 * -1;

        const newX = Math.min(100, Math.max(0, dragRef.current.startCropX + deltaPctX));
        const newY = Math.min(100, Math.max(0, dragRef.current.startCropY + deltaPctY));

        dragRef.current.currentCropX = newX;
        dragRef.current.currentCropY = newY;

        if (containerRef.current) {
          const slotEl = containerRef.current.querySelector(`[data-slot-id="${croppingSlotId}"]`);
          if (slotEl) {
            const img = slotEl.querySelector('img');
            if (img) img.style.objectPosition = `${newX}% ${newY}%`;
          }
        }
      };

      const handleCropMouseUp = () => {
        if (dragRef.current && croppingSlotId && dragRef.current.currentCropX !== undefined) {
          onUpdateSettings(croppingSlotId, {
            cropX: dragRef.current.currentCropX,
            cropY: dragRef.current.currentCropY
          });
        }
        dragRef.current = null;
      };

      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [croppingSlotId, readOnly, onUpdateSettings]);

  // --- FLYLEAF (FORZATS) RENDERING ---
  const renderFlyleaf = () => (
    <div
      className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center"
    >
      <div className="w-full h-full bg-gray-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <span className="absolute text-gray-300 text-sm font-medium uppercase tracking-widest rotate-45 select-none">Форзац</span>
    </div>
  );

  // --- STANDARD PAGE RENDERING ---
  const renderStandardPage = () => {
    const layout = customLayouts.find((l) => l.id === pageData.layoutId);

    // Fallback if layout not found (should not happen in prod)
    if (!layout) return <div className="w-full h-full bg-red-100 flex items-center justify-center text-xs text-red-500">Layout Missing</div>;

    const handleCropMouseDown = (e: React.MouseEvent, slotId: string, currentX: number, currentY: number) => {
      if (readOnly || croppingSlotId !== slotId) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startCropX: currentX,
        startCropY: currentY,
        width: rect.width,
        height: rect.height
      };
    };

    const handleDrop = (e: React.DragEvent, slotId: string) => {
      if (readOnly) return;
      e.preventDefault();
      e.stopPropagation();

      const type = e.dataTransfer.getData('type');
      const content = e.dataTransfer.getData('content');

      if (type === 'image' && content) {
        onUpdateContent(slotId, content);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();
    };

    return (
      <>
        {/* Background Image for Custom Layouts */}
        {layout.backgroundImage && (
          <img src={layout.backgroundImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Background" />
        )}

        {/* Container: use absolute positioning if any slot has rect, otherwise CSS grid */}
        {(() => {
          const useAbsoluteLayout = layout.slots.some(s => s.rect);
          const containerClass = useAbsoluteLayout ? 'relative' : (layout.gridConfig || 'relative');
          const invScale = isExporting ? 1 : (1 / scale);

          return (
            <div className={`w-full h-full ${containerClass}`}>
              {layout.slots.map((slot) => {
                const content = pageData.content[slot.id];
                const settings = pageData.slotSettings?.[slot.id] || {};
                const isRounded = (slot.className || '').includes('rounded-full');
                const isCropping = croppingSlotId === slot.id;
                const isSlotSelected = selectedSlotId === slot.id;

                // Style construction: absolute if slot has rect, otherwise let CSS grid handle it
                let style: React.CSSProperties = {};
                if (slot.rect) {
                  style = {
                    position: 'absolute',
                    left: `${slot.rect.x}%`,
                    top: `${slot.rect.y}%`,
                    width: `${slot.rect.w}%`,
                    height: `${slot.rect.h}%`,
                    transform: `rotate(${slot.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    opacity: slot.opacity ?? 1,
                    borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : undefined,
                  };
                }

                // Shared props for SlotRenderer
                const rendererProps = {
                  slot,
                  content,
                  settings,
                  theme,
                  isExporting
                };

                if (slot.type === SlotType.IMAGE) {
                  return (
                    <div
                      key={slot.id}
                      className={`group hover:z-10 transition-colors ring-2 ${slot.className || ''} ${isRounded ? 'rounded-full' : ''} ${readOnly ? 'ring-transparent' : (isSlotSelected ? 'ring-blue-500 z-10' : 'ring-transparent hover:ring-blue-300 z-0')}`}
                      onDrop={(e) => handleDrop(e, slot.id)}
                      onDragOver={handleDragOver}
                      onClick={(e) => !readOnly && e.stopPropagation()}
                      onMouseDown={(e) => {
                        if (readOnly) return;
                        if (isCropping) handleCropMouseDown(e, slot.id, settings.cropX ?? 50, settings.cropY ?? 50);
                        else onSelectSlot(slot.id, SlotType.IMAGE);
                      }}
                      style={{ ...style, cursor: readOnly ? 'default' : (isCropping ? 'move' : 'default') }}
                    >
                      <SlotRenderer {...rendererProps} />

                      {content ? (
                        <>
                          {isCropping && !readOnly && (
                            <div className="absolute inset-0 border-2 border-blue-500 bg-black/10 pointer-events-none flex items-center justify-center z-10">
                              <span className="text-white bg-black/50 px-2 py-1 text-xs rounded" style={{ transform: `scale(${invScale})` }}>Перемещайте</span>
                            </div>
                          )}

                          {/* Quality Warning Badge */}
                          {!isCropping && !readOnly && (() => {
                            const dims = getImageDimsByUrl?.(content);
                            if (!dims) return null;
                            const slotW = slot.rect?.w ?? 50;
                            const slotH = slot.rect?.h ?? 50;
                            const q = calculatePrintQuality(dims.width, dims.height, slotW, slotH);
                            if (q.level >= 3) return null;
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); setPhotoEditorSlot({ slotId: slot.id, imageUrl: content, slotW, slotH }); }}
                                className="absolute top-1.5 left-1.5 z-20 flex items-center justify-center w-5 h-5 rounded-full shadow-md transition-transform hover:scale-110"
                                style={{ backgroundColor: q.color, transform: `scale(${invScale})`, transformOrigin: 'top left' }}
                                title={`${q.label} — нажмите для подробностей`}
                              >
                                <span className="text-white text-[10px] font-bold leading-none">!</span>
                              </button>
                            );
                          })()}

                          {!isCropping && !readOnly && (
                            <div
                              className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10"
                              style={{ transform: `scale(${invScale})`, transformOrigin: 'top right' }}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); setPhotoEditorSlot({ slotId: slot.id, imageUrl: content, slotW: slot.rect?.w ?? 50, slotH: slot.rect?.h ?? 50 }); }}
                                className="p-1.5 bg-white/90 rounded-md hover:bg-white text-gray-700 shadow-sm"
                                title="Редактировать"
                              >
                                <Icons.Edit size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateContent(slot.id, ''); }}
                                className="p-1.5 bg-white/90 rounded-md hover:bg-white text-red-500 shadow-sm"
                                title="Удалить"
                              >
                                <Icons.Trash size={14} />
                              </button>
                            </div>
                          )}

                          {isCropping && !readOnly && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setCroppingSlotId(null); }}
                              className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1 hover:bg-blue-700 z-20 cursor-pointer"
                              style={{ transform: `scale(${invScale})`, transformOrigin: 'bottom right' }}
                            >
                              <Icons.Check size={12} />
                              Готово
                            </button>
                          )}
                        </>
                      ) : (
                        // Empty slot state
                        !readOnly && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-all">
                              <Icons.Upload size={18} />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 mt-2 bg-white/90 px-2 py-0.5 rounded shadow-sm">
                              Перетащите фото
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  );
                } else if (slot.type === SlotType.TEXT) {
                  return (
                    <div
                      key={slot.id}
                      className={`group ${slot.className} ${!readOnly && isSlotSelected ? 'z-20' : 'z-10'}`}
                      style={style}
                    >
                      {readOnly ? (
                        <SlotRenderer {...rendererProps} className="border border-transparent" />
                      ) : (
                        <div
                          className={`w-full h-full border transition-colors relative ${isSlotSelected ? 'border-blue-400 bg-blue-50/10' : 'border-transparent hover:border-blue-200'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSlot(slot.id, SlotType.TEXT);
                          }}
                        >
                          <div className="absolute top-0 right-0 -translate-y-full -mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            <button
                              onClick={(e) => { e.stopPropagation(); onUpdateContent(slot.id, ''); }}
                              className="bg-white text-red-500 p-1 rounded-md shadow-sm border border-gray-100 hover:bg-red-50"
                              title="Очистить текст"
                              style={{ transform: `scale(${invScale})`, transformOrigin: 'bottom right' }}
                            >
                              <Icons.Trash size={12} />
                            </button>
                          </div>
                          <div className="absolute inset-0 pointer-events-none z-0">
                            <SlotRenderer {...rendererProps} content={content || (isSlotSelected ? '' : 'Введите текст...')} />
                          </div>
                          <textarea
                            value={content || ''}
                            onChange={(e) => onUpdateContent(slot.id, e.target.value)}
                            onFocus={(e) => {
                              onSelectSlot(slot.id, SlotType.TEXT);
                              const target = e.target;
                              setTimeout(() => {
                                target.selectionStart = target.value.length;
                                target.selectionEnd = target.value.length;
                              }, 0);
                            }}
                            className="absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none z-10 m-0"
                            style={{
                              fontFamily: settings.fontFamily || ((slot.className || '').includes('handwriting') ? theme.fonts.heading : theme.fonts.body),
                              fontSize: settings.fontSize ? `${(settings.fontSize / 5.2) * 12}px` : '36px',
                              fontWeight: settings.fontWeight || 'normal',
                              fontStyle: settings.fontStyle || 'normal',
                              lineHeight: settings.lineHeight || 1.4,
                              letterSpacing: settings.letterSpacing ? `${settings.letterSpacing}em` : 'normal',
                              textAlign: (settings.align as any) || 'left',
                              textTransform: settings.uppercase ? 'uppercase' : 'none',
                              padding: '24px',
                              color: 'transparent',
                              caretColor: isSlotSelected ? theme.colors.primary : 'transparent',
                            }}
                            placeholder={isSlotSelected ? "Введите текст..." : ""}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          );
        })()}

        {/* Photo Editor Modal */}
        {!readOnly && photoEditorSlot && (
          <PhotoEditorModal
            imageUrl={photoEditorSlot.imageUrl}
            slotWidthPercent={photoEditorSlot.slotW}
            slotHeightPercent={photoEditorSlot.slotH}
            settings={pageData.slotSettings?.[photoEditorSlot.slotId] || {}}
            onUpdateSettings={(s) => onUpdateSettings(photoEditorSlot.slotId, s)}
            onClose={() => setPhotoEditorSlot(null)}
            onRemoveImage={() => { onUpdateContent(photoEditorSlot.slotId, ''); setPhotoEditorSlot(null); }}
          />
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={!readOnly ? onSelect : undefined}
      className={`relative w-full h-full shadow-sm transition-all duration-200 overflow-hidden bg-white
        ${readOnly ? '' : (isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-100' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:ring-offset-gray-100')}
      `}
      style={{
        aspectRatio: '1 / 1.414',
        backgroundColor: pageData.backgroundColor || theme?.colors?.background || '#ffffff',
      }}
    >
      {/* 1200px Absolute Master Canvas */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: '1200px',
          height: '1696.8px', // 1200 * 1.414
          transform: isExporting ? 'none' : `scale(${scale})`
        }}
      >
        {pageData.type === 'flyleaf' ? renderFlyleaf() : renderStandardPage()}
      </div>

      {/* Page Side Indicator - bottom so it doesn't go under navbar */}
      {
        !readOnly && (
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-medium transition-opacity duration-200 ${isSelected ? 'opacity-100 text-blue-600' : 'opacity-0'}`}>
            <span className="bg-blue-50/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-blue-100">{pageData.type === 'flyleaf' ? 'Форзац' : 'Выбрано'}</span>
          </div>
        )
      }
    </div>
  );
};
