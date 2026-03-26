import React from 'react';
import { LayoutSlot, SlotSettings, SlotType, ThemeConfig } from '../types';

interface SlotRendererProps {
    slot: LayoutSlot;
    content?: string;
    settings?: SlotSettings;
    theme: ThemeConfig;
    isExporting?: boolean;
    scaleFactor?: number;      // To scale down font size and padding for thumbnails
    className?: string;        // External override classes
    style?: React.CSSProperties; // External inline styles (for positioning)
}

export const SlotRenderer: React.FC<SlotRendererProps> = ({
    slot,
    content,
    settings = {} as SlotSettings,
    theme,
    isExporting = false,
    scaleFactor = 1,
    className = '',
    style = {}
}) => {
    const isImage = slot.type === SlotType.IMAGE;

    // Default Settings
    const fitMode = settings.fit || 'cover';
    const filterMode = settings.filter || 'none';
    const cropX = settings.cropX ?? 50;
    const cropY = settings.cropY ?? 50;
    const alignMode = settings.align || 'left';

    // CSS Filters
    const getFilterCSS = (mode: string) => {
        if (mode === 'grayscale') return 'grayscale(100%)';
        if (mode === 'sepia') return 'sepia(100%)';
        if (mode === 'contrast') return 'contrast(150%)';
        return 'none';
    };

    const isRounded = (slot.className || '').includes('rounded-full');

    // Container Style merging external (rect positioning) + internal rules
    const containerStyle: React.CSSProperties = {
        ...style,
        borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : undefined,
    };

    if (isImage) {
        return (
            <div
                className={`w-full h-full relative overflow-hidden bg-black/5 ${isRounded ? 'rounded-full' : ''} ${className}`}
                style={containerStyle}
            >
                {content && (
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
                                    filter: getFilterCSS(filterMode)
                                }}
                            />
                        ) : (
                            <img
                                src={content}
                                alt="Slot"
                                className={`absolute max-w-none transition-all duration-75 ${fitMode === 'contain' ? 'object-contain p-2 w-full h-full' : ''}`}
                                style={
                                    fitMode === 'contain'
                                        ? { filter: getFilterCSS(filterMode) }
                                        : {
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: `${cropX}% ${cropY}%`,
                                            filter: getFilterCSS(filterMode)
                                        }
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        );
    } else {
        // --- TEXT SLOT RUNTIME ---
        const defaultCqw = 3.5;
        const effectiveCqw = settings.fontSize ? (settings.fontSize / 5.2) : defaultCqw;

        // Export pixel calculation base
        const exportFontSize = (1200 * (effectiveCqw / 100));

        // If scaled down (thumbnails), use percentage scaling from CSS or standard calculation
        let calculatedFontSize = `${exportFontSize * scaleFactor}px`;
        let calculatedLetterSpacing = isExporting
            ? (settings.letterSpacing ? `${(settings.letterSpacing * exportFontSize)}px` : 'normal')
            : (settings.letterSpacing ? `${settings.letterSpacing}em` : 'normal');

        const textStyle: React.CSSProperties = {
            fontFamily: settings.fontFamily || ((slot.className || '').includes('handwriting') ? theme?.fonts?.heading || 'Times New Roman' : theme?.fonts?.body || 'Arial'),
            fontSize: scaleFactor !== 1 ? calculatedFontSize : `${exportFontSize}px`,
            fontWeight: settings.fontWeight || 'normal',
            fontStyle: settings.fontStyle || 'normal',
            lineHeight: settings.lineHeight || 1.4,
            letterSpacing: calculatedLetterSpacing,
            color: settings.color || theme?.colors?.text || '#1f2937',
            textAlign: alignMode,
            textTransform: settings.uppercase ? 'uppercase' : 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            // Base padding is 24px (2% of 1200px), scaled down if thumbnail
            padding: `${24 * scaleFactor}px`,
            textRendering: 'geometricPrecision',
            WebkitFontSmoothing: 'antialiased',
        };

        return (
            <div
                className={`w-full h-full relative text-slot-container ${className}`}
                style={containerStyle}
            >
                <div
                    className={`w-full h-full bg-transparent overflow-hidden border border-transparent`}
                    style={textStyle}
                >
                    {content}
                </div>
            </div>
        );
    }
};
