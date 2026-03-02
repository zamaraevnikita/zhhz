import React from 'react';
import { SlotType, LayoutTemplate } from '../../types';
import { Icons } from '../IconComponents';
import { Lock, Unlock, ArrowUp, ArrowDown, Copy, Trash2, Maximize2, Move } from 'lucide-react';

const NumericInput = ({
    value,
    onChange,
    className,
    min,
    max,
    step = 1,
    suffix = ""
}: {
    value: number;
    onChange: (val: number) => void;
    className?: string;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
}) => {
    const [localValue, setLocalValue] = React.useState(String(value));
    React.useEffect(() => { setLocalValue(String(value)); }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        if (val === '' || val === '-') return;
        const num = parseFloat(val);
        if (!isNaN(num)) onChange(num);
    };

    const handleBlur = () => {
        let num = parseFloat(localValue);
        if (isNaN(num)) num = value;
        if (min !== undefined) num = Math.max(min, num);
        if (max !== undefined) num = Math.min(max, num);
        setLocalValue(String(num));
        onChange(num);
    };

    return (
        <div className="relative flex items-center">
            <input
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`w-full font-mono text-[11px] bg-gray-700 px-2 py-1.5 rounded border border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none ${className}`}
                min={min}
                max={max}
                step={step}
            />
            {suffix && <span className="absolute right-6 text-[9px] text-gray-500 pointer-events-none">{suffix}</span>}
        </div>
    );
};

interface AdminPanelPropertiesProps {
    activeSlot: LayoutTemplate['slots'][0] | null;
    admin: any; // Using any for now to avoid circular dependencies with the massive useAdminPanel signature
}

export const AdminPanelProperties: React.FC<AdminPanelPropertiesProps> = ({ activeSlot, admin }) => {
    const ImageIcon = Icons.Image;
    const Type = Icons.Type;

    return (
        <div className={`
            fixed top-0 right-0 bottom-0 w-80 bg-[#1a1a1a] border-l border-white/5 transition-transform duration-300 z-40
            ${activeSlot ? 'translate-x-0' : 'translate-x-full'}
        `}>
            {activeSlot && (
                <div className="flex flex-col h-full w-80">
                    {/* Header with type */}
                    <div className="p-5 border-b border-white/5 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeSlot.type === SlotType.IMAGE ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
                            {activeSlot.type === SlotType.IMAGE
                                ? <ImageIcon size={16} className="text-blue-400" />
                                : <Type size={16} className="text-amber-400" />
                            }
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-white">
                                {activeSlot.type === SlotType.IMAGE ? 'Фото-слот' : 'Текстовый слот'}
                            </h3>
                            <span className="text-[9px] text-gray-500">
                                {Math.round(activeSlot.rect?.w || 0)}% × {Math.round(activeSlot.rect?.h || 0)}%
                            </span>
                        </div>
                        <button onClick={() => admin.updateSlot(activeSlot.id, { locked: !activeSlot.locked })} className={`p-2 rounded-lg transition-colors ${activeSlot.locked ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                            {activeSlot.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {/* Position & Size */}
                        {activeSlot.rect ? (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Позиция и размер</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">X (%)</span><NumericInput value={activeSlot.rect!.x} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, x: val } })} min={0} max={100} step={0.5} suffix="%" /></div>
                                    <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Y (%)</span><NumericInput value={activeSlot.rect!.y} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, y: val } })} min={0} max={100} step={0.5} suffix="%" /></div>
                                    <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Ширина (%)</span><NumericInput value={activeSlot.rect!.w} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, w: val } })} min={1} max={100} step={0.5} suffix="%" /></div>
                                    <div className="space-y-1"><span className="text-[9px] text-gray-500 ml-1">Высота (%)</span><NumericInput value={activeSlot.rect!.h} onChange={val => admin.updateSlot(activeSlot.id, { rect: { ...activeSlot.rect!, h: val } })} min={1} max={100} step={0.5} suffix="%" /></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => admin.centerSlot()} className="flex-1 p-2 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[9px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors text-gray-400">
                                        <Move size={10} /> Центр
                                    </button>
                                    <button onClick={() => admin.resetSlotToFull()} className="flex-1 p-2 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[9px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors text-gray-400">
                                        <Maximize2 size={10} /> На всю страницу
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Макет-сетка</h4>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[10px] text-amber-200/80 leading-relaxed">
                                    Размеры и позиции этого слота зафиксированы системной сеткой макета.
                                </div>
                                <button
                                    onClick={admin.convertToCustomLayout}
                                    className="w-full bg-[#222] hover:bg-[#2a2a2a] p-2.5 rounded-lg text-[10px] font-bold border border-white/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Unlock size={12} />
                                    Отвязать от сетки
                                </button>
                            </div>
                        )}

                        {/* Appearance */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Внешний вид</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Поворот</span><span>{Math.round(activeSlot.rotation || 0)}°</span></div>
                                    <input type="range" min="0" max="360" value={activeSlot.rotation || 0} onChange={e => admin.updateSlot(activeSlot.id, { rotation: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] text-gray-500 px-1"><span>Прозрачность</span><span>{Math.round((activeSlot.opacity || 1) * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={activeSlot.opacity ?? 1} onChange={e => admin.updateSlot(activeSlot.id, { opacity: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div className="flex justify-between items-center bg-[#222] p-2.5 rounded-lg">
                                    <span className="text-[10px] text-gray-400">Скругление</span>
                                    <NumericInput value={activeSlot.borderRadius || 0} onChange={val => admin.updateSlot(activeSlot.id, { borderRadius: val })} className="!w-16 !bg-transparent !border-none" suffix="px" />
                                </div>
                            </div>
                        </div>

                        {/* Default content */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Контент по умолчанию</h4>
                            {activeSlot.type === SlotType.IMAGE ? (
                                <>
                                    <input ref={admin.slotImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => admin.handleSlotDefaultImageChange(e, activeSlot.id)} />
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => admin.slotImageInputRef.current?.click()} className="flex-1 p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-2 border border-white/5 transition-colors">
                                            <Icons.Image size={13} /> {activeSlot.defaultContent ? 'Заменить фото' : 'Загрузить фото'}
                                        </button>
                                        {activeSlot.defaultContent && (
                                            <button type="button" onClick={() => admin.updateSlot(activeSlot.id, { defaultContent: undefined })} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/5" title="Убрать"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                    {activeSlot.defaultContent && (
                                        <div className="rounded-lg overflow-hidden border border-white/10 aspect-video max-h-24 bg-[#222]">
                                            <img src={activeSlot.defaultContent} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <textarea
                                        value={activeSlot.defaultContent ?? ''}
                                        onChange={e => admin.updateSlot(activeSlot.id, { defaultContent: e.target.value || undefined })}
                                        placeholder="Текст по умолчанию в шаблоне"
                                        className="w-full bg-[#222] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[60px] resize-y"
                                        rows={2}
                                    />

                                    {/* Text Styling */}
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Стиль текста</h4>

                                        {/* Font Family */}
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-gray-500 ml-1">Шрифт</span>
                                            <select
                                                value={activeSlot.defaultSettings?.fontFamily || ''}
                                                onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontFamily: e.target.value || undefined } })}
                                                className="w-full text-[11px] bg-[#222] border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">По умолчанию (тема)</option>
                                                <option value="Inter, sans-serif">Inter</option>
                                                <option value="Merriweather, serif">Merriweather</option>
                                                <option value="Playfair Display, serif">Playfair Display</option>
                                                <option value="Courier Prime, monospace">Courier Prime</option>
                                                <option value="Arial, sans-serif">Arial</option>
                                                <option value="Georgia, serif">Georgia</option>
                                            </select>
                                        </div>

                                        {/* Font Size & Color — single row */}
                                        <div className="flex items-end gap-2">
                                            <div className="space-y-1 flex-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Размер</span>
                                                <NumericInput
                                                    value={activeSlot.defaultSettings?.fontSize || 14}
                                                    onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontSize: val } })}
                                                    min={8}
                                                    max={72}
                                                    step={1}
                                                    suffix="px"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Цвет</span>
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="color"
                                                        value={activeSlot.defaultSettings?.color || '#000000'}
                                                        onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, color: e.target.value } })}
                                                        className="w-7 h-7 bg-transparent border border-white/10 rounded cursor-pointer flex-shrink-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={activeSlot.defaultSettings?.color || '#000000'}
                                                        onChange={e => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, color: e.target.value } })}
                                                        className="w-[72px] font-mono text-[10px] bg-[#222] border border-white/10 rounded-lg px-1.5 py-1.5 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weight, Italic, Uppercase */}
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontWeight: activeSlot.defaultSettings?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
                                                className={`flex-1 p-2 rounded-lg text-[10px] font-bold transition-colors border ${activeSlot.defaultSettings?.fontWeight === 'bold' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, fontStyle: activeSlot.defaultSettings?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
                                                className={`flex-1 p-2 rounded-lg text-[10px] transition-colors border ${activeSlot.defaultSettings?.fontStyle === 'italic' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                            >
                                                <em>I</em>
                                            </button>
                                            <button
                                                onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, uppercase: !activeSlot.defaultSettings?.uppercase } })}
                                                className={`flex-1 p-2 rounded-lg text-[10px] transition-colors border ${activeSlot.defaultSettings?.uppercase ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                            >
                                                AA
                                            </button>
                                        </div>

                                        {/* Horizontal Alignment */}
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-gray-500 ml-1">Горизонтально</span>
                                            <div className="flex gap-1.5">
                                                {(Array.from([['left', '≡ Л'], ['center', '≡ Ц'], ['right', '≡ П'], ['justify', '≡ Ш']]) as [string, string][]).map(([align, label]) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, align } })}
                                                        className={`flex-1 p-2 rounded-lg text-[9px] font-bold transition-colors border ${(activeSlot.defaultSettings?.align || 'left') === align ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vertical Alignment */}
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-gray-500 ml-1">Вертикально</span>
                                            <div className="flex gap-1.5">
                                                {(Array.from([['top', '↑ Верх'], ['center', '⇅ Центр'], ['bottom', '↓ Низ']]) as [string, string][]).map(([vAlign, label]) => (
                                                    <button
                                                        key={vAlign}
                                                        onClick={() => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, verticalAlign: vAlign } })}
                                                        className={`flex-1 p-2 rounded-lg text-[9px] font-bold transition-colors border ${(activeSlot.defaultSettings?.verticalAlign || 'top') === vAlign ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-[#222] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Line Height & Letter Spacing */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Межстрочный</span>
                                                <NumericInput
                                                    value={activeSlot.defaultSettings?.lineHeight || 1.5}
                                                    onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, lineHeight: val } })}
                                                    min={0.8}
                                                    max={3}
                                                    step={0.1}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-gray-500 ml-1">Трекинг (em)</span>
                                                <NumericInput
                                                    value={activeSlot.defaultSettings?.letterSpacing || 0}
                                                    onChange={val => admin.updateSlot(activeSlot.id, { defaultSettings: { ...activeSlot.defaultSettings, letterSpacing: val } })}
                                                    min={-0.1}
                                                    max={0.5}
                                                    step={0.01}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Layers & Actions */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Действия</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => admin.moveLayer('front')} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><ArrowUp size={11} /> Вперёд</button>
                                <button onClick={() => admin.moveLayer('back')} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><ArrowDown size={11} /> Назад</button>
                                <button onClick={() => admin.duplicateSlot(activeSlot)} className="p-2.5 bg-[#222] hover:bg-[#2a2a2a] rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-white/5 transition-colors"><Copy size={11} /> Копия</button>
                                <button onClick={() => admin.removeSlot(activeSlot.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-red-500/10 transition-colors"><Trash2 size={11} /> Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
