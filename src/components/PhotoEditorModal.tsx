import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Icons } from './IconComponents';
import { SlotSettings } from '../types';
import {
    QualityInfo,
    QualityLevel,
    calculatePrintQuality,
    getImageDimensions,
} from '../services/imageQualityService';

type ModalTab = 'quality' | 'edit';

interface PhotoEditorModalProps {
    imageUrl: string;
    slotWidthPercent: number;
    slotHeightPercent: number;
    settings: Partial<SlotSettings>;
    onUpdateSettings: (settings: Partial<SlotSettings>) => void;
    onClose: () => void;
    onRemoveImage?: () => void;
}

const SEGMENTS: { level: QualityLevel; label: string }[] = [
    { level: 0, label: 'Сильно\nразмыто' },
    { level: 1, label: 'Размыто' },
    { level: 2, label: 'Немного\nразмыто' },
    { level: 3, label: 'Почти\nбез размытия' },
    { level: 4, label: 'Четко' },
];

const SEGMENT_COLORS: Record<QualityLevel, string> = {
    0: '#EF4444',
    1: '#F97316',
    2: '#EAB308',
    3: '#84CC16',
    4: '#22C55E',
};

const FILTERS: { id: SlotSettings['filter']; label: string; icon: string }[] = [
    { id: 'none', label: 'Без фильтра', icon: '🎨' },
    { id: 'grayscale', label: 'Ч/Б', icon: '⬛' },
    { id: 'sepia', label: 'Сепия', icon: '🟤' },
    { id: 'contrast', label: 'Контраст', icon: '◐' },
];

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
    imageUrl,
    slotWidthPercent,
    slotHeightPercent,
    settings,
    onUpdateSettings,
    onClose,
    onRemoveImage,
}) => {
    const [quality, setQuality] = useState<QualityInfo | null>(null);
    const [activeTab, setActiveTab] = useState<ModalTab>('edit');

    const fitMode = settings.fit || 'cover';
    const filterMode = settings.filter || 'none';
    const cropX = settings.cropX ?? 50;
    const cropY = settings.cropY ?? 50;

    useEffect(() => {
        getImageDimensions(imageUrl).then((dims) => {
            if (dims.width > 0 && dims.height > 0) {
                const q = calculatePrintQuality(
                    dims.width,
                    dims.height,
                    slotWidthPercent,
                    slotHeightPercent
                );
                setQuality(q);
            }
        });
    }, [imageUrl, slotWidthPercent, slotHeightPercent]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Preview filter CSS
    const filterCSS = filterMode === 'grayscale' ? 'grayscale(100%)'
        : filterMode === 'sepia' ? 'sepia(100%)'
            : filterMode === 'contrast' ? 'contrast(150%)'
                : 'none';

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80" />

            <div
                className="relative bg-[#1a1a2e] text-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Icons.Close size={20} />
                    </button>
                    <h2 className="text-base font-semibold">Редактор фото</h2>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
                    >
                        <Icons.Check size={16} />
                        Готово
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Редактирование
                    </button>
                    <button
                        onClick={() => setActiveTab('quality')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'quality' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Качество печати
                        {quality && quality.level < 3 && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[quality.level] }} />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row">
                    {/* Image Preview */}
                    <div className="lg:w-1/2 p-6 flex items-center justify-center bg-black/20 min-h-[300px]">
                        <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-black/40">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                                style={{
                                    objectPosition: `${cropX}% ${cropY}%`,
                                    filter: filterCSS,
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:w-1/2 p-6 flex flex-col gap-5 overflow-y-auto max-h-[450px]">
                        {activeTab === 'edit' ? (
                            <>
                                {/* Fit Mode */}
                                <div>
                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Режим отображения</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => onUpdateSettings({ fit: 'cover' })}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${fitMode === 'cover' ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                        >
                                            <Icons.Maximize size={16} />
                                            Заполнить
                                        </button>
                                        <button
                                            onClick={() => onUpdateSettings({ fit: 'contain' })}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${fitMode === 'contain' ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                        >
                                            <Icons.Minimize size={16} />
                                            Вместить
                                        </button>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div>
                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Фильтры</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {FILTERS.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => onUpdateSettings({ filter: f.id })}
                                                className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg text-xs transition-all ${filterMode === f.id ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                            >
                                                <span className="text-lg">{f.icon}</span>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Position (crop) */}
                                {fitMode === 'cover' && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Позиция фото</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs text-white/50 mb-1">
                                                    <span>Горизонталь</span>
                                                    <span>{cropX}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={cropX}
                                                    onChange={(e) => onUpdateSettings({ cropX: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-white/50 mb-1">
                                                    <span>Вертикаль</span>
                                                    <span>{cropY}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={cropY}
                                                    onChange={(e) => onUpdateSettings({ cropY: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delete */}
                                {onRemoveImage && (
                                    <button
                                        onClick={() => { onRemoveImage(); onClose(); }}
                                        className="mt-auto flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Icons.Trash size={14} />
                                        Удалить фото
                                    </button>
                                )}
                            </>
                        ) : (
                            /* Quality Tab */
                            <>
                                <h3 className="text-lg font-semibold text-center">
                                    Качество печати фото
                                </h3>

                                {quality ? (
                                    <>
                                        <div>
                                            <div className="flex gap-0.5 mb-2">
                                                {SEGMENTS.map((seg) => (
                                                    <div
                                                        key={seg.level}
                                                        className="flex-1 h-2.5 rounded-sm transition-all"
                                                        style={{
                                                            backgroundColor:
                                                                seg.level <= quality.level
                                                                    ? SEGMENT_COLORS[seg.level]
                                                                    : 'rgba(255,255,255,0.15)',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between">
                                                {SEGMENTS.map((seg) => (
                                                    <span
                                                        key={seg.level}
                                                        className={`text-[9px] leading-tight text-center flex-1 whitespace-pre-line ${seg.level === quality.level
                                                            ? 'text-white font-semibold'
                                                            : 'text-white/40'
                                                            }`}
                                                    >
                                                        {seg.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {quality.level < 4 && (
                                            <p className="text-sm text-white/70 leading-relaxed">
                                                {quality.message}
                                            </p>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3">Свойства фото</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                                                        Размер вашего фото
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        {quality.actualWidth} × {quality.actualHeight}
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                                                        Рекомендуемый размер
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        {quality.requiredWidth} × {quality.requiredHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {quality.level <= 1 && onRemoveImage && (
                                            <button
                                                onClick={() => { onRemoveImage(); onClose(); }}
                                                className="mt-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <Icons.Trash size={14} />
                                                Удалить фото
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center flex-1">
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
