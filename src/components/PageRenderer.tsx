import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PageData, SlotType, LayoutTemplate, SlotSettings, ThemeConfig } from '../types';
import { Icons } from './IconComponents';
import { calculatePrintQuality, QualityInfo } from '../services/imageQualityService';
import { PhotoEditorModal } from './PhotoEditorModal';

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
  // --- FLYLEAF (FORZATS) RENDERING ---
  if (pageData.type === 'flyleaf') {
    return (
      <div
        onClick={!readOnly ? onSelect : undefined}
        className={`w-full h-full bg-white shadow-sm relative overflow-hidden flex items-center justify-center
             ${readOnly ? '' : (isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-100' : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 hover:ring-offset-gray-100')}
            `}
      >
        <div className="w-full h-full bg-gray-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <span className="absolute text-gray-300 text-sm font-medium uppercase tracking-widest rotate-45 select-none">Форзац</span>

        {/* Page Side Indicator - bottom so it doesn't go under navbar */}
        {!readOnly && (
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity duration-200 ${isSelected ? 'opacity-100 text-blue-600' : 'opacity-0'}`}>
            <span className="bg-blue-50 px-3 py-1 rounded-full shadow-sm border border-blue-100">Форзац</span>
          </div>
        )}
      </div>
    );
  }

  // --- STANDARD PAGE RENDERING ---

  const layout = customLayouts.find((l) => l.id === pageData.layoutId);

  // Fallback if layout not found (should not happen in prod)
  if (!layout) return <div className="w-full h-full bg-red-100 flex items-center justify-center text-xs text-red-500">Layout Missing</div>;

  const [croppingSlotId, setCroppingSlotId] = useState<string | null>(null);
  const [photoEditorSlot, setPhotoEditorSlot] = useState<{ slotId: string; imageUrl: string; slotW: number; slotH: number } | null>(null);

  // Crop Logic
  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number; width: number; height: number; } | null>(null);

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

  const handleCropMouseMove = (e: MouseEvent) => {
    if (readOnly || !dragRef.current || !croppingSlotId) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Calculate percentage change based on container size
    // We invert delta because dragging LEFT (negative) should increase percentage (move view right)
    // Factor 1.5 for slightly faster feel than 1:1 which might feel sluggish for large images
    const deltaPctX = (deltaX / dragRef.current.width) * 100 * -1;
    const deltaPctY = (deltaY / dragRef.current.height) * 100 * -1;

    const newX = Math.min(100, Math.max(0, dragRef.current.startCropX + deltaPctX));
    const newY = Math.min(100, Math.max(0, dragRef.current.startCropY + deltaPctY));

    onUpdateSettings(croppingSlotId, { cropX: newX, cropY: newY });
  };

  const handleCropMouseUp = () => {
    dragRef.current = null;
  };

  useEffect(() => {
    if (croppingSlotId && !readOnly) {
      const onMouseMove = (e: MouseEvent) => handleCropMouseMove(e);
      const onMouseUp = () => handleCropMouseUp();
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [croppingSlotId, readOnly]);


  return (
    <div
      onClick={!readOnly ? onSelect : undefined}
      className={`relative w-full h-full shadow-sm transition-all duration-200 overflow-visible bg-white
        ${readOnly ? '' : (isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-100' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:ring-offset-gray-100')}
      `}
      style={{
        aspectRatio: '1 / 1.414',
        backgroundColor: pageData.backgroundColor || theme.colors.background,
        ...(isExporting ? {} : { containerType: 'inline-size' as any }),
      }}
    >
      {/* Background Image for Custom Layouts */}
      {layout.backgroundImage && (
        <img src={layout.backgroundImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Background" />
      )}

      {/* Container: use absolute positioning if any slot has rect, otherwise CSS grid */}
      {(() => {
        const useAbsoluteLayout = layout.slots.some(s => s.rect);
        const containerClass = useAbsoluteLayout ? 'relative' : (layout.gridConfig || 'relative');

        return (
          <div className={`w-full h-full ${containerClass}`}>
            {layout.slots.map((slot) => {
              const content = pageData.content[slot.id];
              const settings = pageData.slotSettings?.[slot.id] || {};

              const fitMode = settings.fit || 'cover';
              const alignMode = settings.align || 'left';
              const filterMode = settings.filter || 'none';
              const cropX = settings.cropX ?? 50;
              const cropY = settings.cropY ?? 50;

              const isRounded = slot.className.includes('rounded-full');
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

              if (slot.type === SlotType.IMAGE) {
                return (
                  <div
                    key={slot.id}
                    className={`relative bg-black/5 group overflow-hidden ${slot.className} ${isRounded ? 'rounded-full' : ''} transition-colors ring-2 hover:z-10 
                      ${readOnly ? 'ring-transparent' : (isSlotSelected ? 'ring-blue-500 z-10' : 'ring-transparent hover:ring-blue-300 z-0')}`}
                    onDrop={(e) => handleDrop(e, slot.id)}
                    onDragOver={handleDragOver}
                    onClick={(e) => !readOnly && e.stopPropagation()}
                    onMouseDown={(e) => {
                      if (readOnly) return;
                      // If cropping, don't select, handle crop
                      if (isCropping) {
                        handleCropMouseDown(e, slot.id, cropX, cropY);
                      } else {
                        // Select slot
                        onSelectSlot(slot.id, SlotType.IMAGE);
                      }
                    }}
                    style={{ ...style, cursor: readOnly ? 'default' : (isCropping ? 'move' : 'default') }}
                  >
                    {content ? (
                      <>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {isExporting && fitMode === 'cover' ? (
                            <img
                              src={content}
                              alt="Slot Export"
                              className="absolute max-w-none"
                              style={{
                                left: `${cropX}%`,
                                top: `${cropY}%`,
                                minWidth: '100%',
                                minHeight: '100%',
                                width: 'auto',
                                height: 'auto',
                                transform: `translate(-${cropX}%, -${cropY}%)`,
                                filter: filterMode === 'grayscale' ? 'grayscale(100%)' : filterMode === 'sepia' ? 'sepia(100%)' : filterMode === 'contrast' ? 'contrast(150%)' : 'none'
                              }}
                            />
                          ) : (
                            <img
                              src={content}
                              alt="Slot"
                              className={`absolute max-w-none transition-all duration-75 ${fitMode === 'contain' ? 'object-contain p-2 w-full h-full' : ''}`}
                              style={
                                fitMode === 'contain'
                                  ? { filter: filterMode === 'grayscale' ? 'grayscale(100%)' : filterMode === 'sepia' ? 'sepia(100%)' : filterMode === 'contrast' ? 'contrast(150%)' : 'none' }
                                  : {
                                    // html2canvas doesn't support object-fit: cover well natively
                                    // This branch is mainly for the editor visual now
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: `${cropX}% ${cropY}%`,
                                    filter: filterMode === 'grayscale' ? 'grayscale(100%)' : filterMode === 'sepia' ? 'sepia(100%)' : filterMode === 'contrast' ? 'contrast(150%)' : 'none'
                                  }
                              }
                            />
                          )}
                        </div>

                        {isCropping && !readOnly && (
                          <div className="absolute inset-0 border-2 border-blue-500 bg-black/10 pointer-events-none flex items-center justify-center">
                            <span className="text-white bg-black/50 px-2 py-1 text-xs rounded">Перемещайте</span>
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
                              style={{ backgroundColor: q.color }}
                              title={`${q.label} — нажмите для подробностей`}
                            >
                              <span className="text-white text-[10px] font-bold leading-none">!</span>
                            </button>
                          );
                        })()}

                        {!isCropping && !readOnly && (
                          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
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
                          >
                            <Icons.Check size={12} />
                            Готово
                          </button>
                        )}
                      </>
                    ) : (
                      !readOnly ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                          <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mb-1">
                            <Icons.Plus size={20} />
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                );
              } else {
                // --- TEXT SLOT ---

                // Text Styles
                const defaultCqw = 3.5; // Roughly equal to text-sm in a 400px container
                const effectiveCqw = settings.fontSize ? (settings.fontSize / 5.2) : defaultCqw;

                // For PDF Export, since the canvas is 1200px wide, calculate exact font size
                // 1 cqw = 1% of container width. 1200px * 1% = 12px
                const exportFontSize = (1200 * (effectiveCqw / 100)).toFixed(2);

                const textStyle: React.CSSProperties = {
                  fontFamily: settings.fontFamily || (slot.className.includes('handwriting') ? theme.fonts.heading : theme.fonts.body),
                  // Emulate cqw in standard px units if exporting
                  fontSize: isExporting ? `${exportFontSize}px` : `${effectiveCqw}cqw`,
                  fontWeight: settings.fontWeight || 'normal',
                  fontStyle: settings.fontStyle || 'normal',
                  lineHeight: settings.lineHeight || 1.4,
                  // If exporting, use absolute pixels for letter spacing to avoid kerning drift
                  // +0.1px crutch slightly expands the html2canvas vector measuring engine which measures WebFonts narrower than raw Blink
                  letterSpacing: isExporting
                    ? (settings.letterSpacing ? `${(settings.letterSpacing * parseFloat(exportFontSize)) + 0.1}px` : '0.1px')
                    : (settings.letterSpacing ? `${settings.letterSpacing}em` : 'normal'),
                  color: settings.color || theme.colors.text,
                  textAlign: alignMode,
                  textTransform: settings.uppercase ? 'uppercase' : 'none',
                  whiteSpace: 'pre-wrap', // Always pre-wrap for text slots
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  padding: isExporting ? '2%' : '2cqw', // use % in export to match container
                };

                return (
                  <div
                    key={slot.id}
                    className={`relative group text-slot-container ${slot.className} ${!readOnly && isSlotSelected ? 'z-20' : 'z-10'}`}
                    style={style}
                  >
                    {readOnly ? (
                      <div
                        className={`w-full h-full bg-transparent overflow-hidden border border-transparent`}
                        style={textStyle}
                      >
                        {content}
                      </div>
                    ) : (
                      <textarea
                        className={`w-full h-full bg-transparent resize-none outline-none border transition-colors overflow-hidden
                      ${isSlotSelected ? 'border-blue-400 bg-white/10' : 'border-dashed border-gray-300/50 hover:border-blue-300'}
                    `}
                        placeholder={slot.placeholder}
                        value={content || ''}
                        onChange={(e) => onUpdateContent(slot.id, e.target.value)}
                        onClick={(e) => { e.stopPropagation(); onSelectSlot(slot.id, SlotType.TEXT); }}
                        style={textStyle}
                      />
                    )}
                  </div>
                );
              }
            })}
          </div>
        );
      })()}

      {/* Page Side Indicator - bottom so it doesn't go under navbar */}
      {!readOnly && (
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity duration-200 ${isSelected ? 'opacity-100 text-blue-600' : 'opacity-0'}`}>
          <span className="bg-blue-50 px-3 py-1 rounded-full shadow-sm border border-blue-100">Выбрано</span>
        </div>
      )}

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
    </div>
  );
};