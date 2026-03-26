import React from 'react';
import { PageData, LayoutTemplate, ThemeConfig } from '../types';
import { calculatePrintQuality } from '../services/imageQualityService';

interface StaticPageRendererProps {
  pageData: PageData;
  theme: ThemeConfig;
  customLayouts?: LayoutTemplate[];
}

/**
 * A purely static version of PageRenderer used ONLY for DragOverlay.
 * Contains no hooks, no DnD contexts, no refs, and no interaction logic.
 */
export const StaticPageRenderer: React.FC<StaticPageRendererProps> = ({
  pageData,
  theme,
  customLayouts = []
}) => {
  // --- FLYLEAF (FORZATS) RENDERING ---
  if (pageData.type === 'flyleaf') {
    return (
      <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
        <div className="w-full h-full bg-gray-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <span className="absolute text-gray-300 text-sm font-medium uppercase tracking-widest rotate-45 select-none">Форзац</span>
      </div>
    );
  }

  // --- STANDARD PAGE RENDERING ---
  const layout = customLayouts.find((l) => l.id === pageData.layoutId);

  if (!layout) {
    return <div className="w-full h-full bg-red-100 flex items-center justify-center text-xs text-red-500">Layout Missing</div>;
  }

  return (
    <div
      className="w-full h-full relative"
      style={{ backgroundColor: pageData.backgroundColor || theme?.colors?.paper || '#ffffff' }}
  >
    {/* Slots */}
    {(layout.slots || []).map((slot) => {
        const content = pageData.content[slot.id];
        const slotStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${(slot.x / layout.width) * 100}%`,
          top: `${(slot.y / layout.height) * 100}%`,
          width: `${(slot.width / layout.width) * 100}%`,
          height: `${(slot.height / layout.height) * 100}%`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: content ? 'transparent' : 'rgba(0,0,0,0.03)'
        };

        if (slot.type === 'photo') {
          return (
            <div key={slot.id} style={slotStyle} className="border border-dashed border-gray-200">
              {content ? (
                <img
                  src={content}
                  alt="Static slot"
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: '50% 50%', // Simplification for static preview
                  }}
                />
              ) : null}
            </div>
          );
        }

        if (slot.type === 'text') {
           const settings = pageData.slotSettings[slot.id] || {};
           const textContent = content || 'Текст';
           return (
             <div key={slot.id} style={slotStyle} className="pointer-events-none p-2 relative group items-start">
               <div
                  style={{
                    fontFamily: settings.fontFamily || theme.typography.fontFamily,
                    color: settings.color || theme.colors.text.primary,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: settings.alignY === 'bottom' ? 'flex-end' : settings.alignY === 'center' ? 'center' : 'flex-start',
                    textAlign: settings.alignX || 'left',
                    fontSize: '10px' // Hardcoded tiny size for thumbnail overlay
                  }}
                >
                  {textContent}
                </div>
             </div>
           );
        }

        return null;
      })}
    </div>
  );
};
