import React, { useState, useEffect } from 'react';
import { DesignTemplate, ThemeConfig, LayoutTemplate, PagePreset } from '../../types';
import { Icons } from '../IconComponents';
import { THEMES } from '../../themes';
import { useLayouts } from '../../hooks/useLayouts';
import { createDesignTemplate, updateDesignTemplate } from '../../services/designTemplateApiService';

interface AdminDesignTemplateEditorProps {
    template: DesignTemplate | null;
    onSave: () => void;
    onCancel: () => void;
}

export const AdminDesignTemplateEditor: React.FC<AdminDesignTemplateEditorProps> = ({ template, onSave, onCancel }) => {
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');
    const [themeId, setThemeId] = useState(template?.themeId || THEMES[0].id);
    const [previewUrl, setPreviewUrl] = useState(template?.previewUrl || '');
    const [pagePresets, setPagePresets] = useState<PagePreset[]>(template?.pagePresets || []);

    const { layouts } = useLayouts();
    const [isSaving, setIsSaving] = useState(false);

    const handleAddPreset = () => {
        if (layouts.length === 0) return;
        setPagePresets([...pagePresets, { layoutId: layouts[0].id, backgroundColor: '' }]);
    };

    const handleRemovePreset = (index: number) => {
        setPagePresets(pagePresets.filter((_, i) => i !== index));
    };

    const handlePresetChange = (index: number, field: keyof PagePreset, value: string) => {
        const newPresets = [...pagePresets];
        newPresets[index] = { ...newPresets[index], [field]: value };
        setPagePresets(newPresets);
    };

    const handleSave = async () => {
        if (!name || !themeId || pagePresets.length === 0) {
            alert('Заполните название, выберите тему и добавьте хотя бы один пресет страницы.');
            return;
        }

        setIsSaving(true);
        try {
            const data = { name, description, themeId, previewUrl, pagePresets };
            if (template) {
                await updateDesignTemplate(template.id, data);
            } else {
                await createDesignTemplate(data);
            }
            onSave();
        } catch (err) {
            console.error('Failed to save template', err);
            alert('Ошибка при сохранении шаблона');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-[#141414] p-6 lg:p-10 font-sans text-gray-100 flex pb-32">
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 text-sm transition-colors">
                            <Icons.Back size={16} /> Назад к списку
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {template ? 'Редактировать шаблон' : 'Новый шаблон дизайна'}
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white transition-colors border border-white/10 hover:bg-white/5">
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            <Icons.Save size={18} />
                            {isSaving ? 'Сохранение...' : 'Сохранить шаблон'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-3">Основная информация</h3>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Название</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Например: Минимализм"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Описание</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-none"
                                placeholder="Краткое описание стиля"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Привязка к теме</label>
                            <select
                                value={themeId} onChange={e => setThemeId(e.target.value)}
                                className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                            >
                                {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">URL Превью</label>
                            <input
                                value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
                                className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="https://..."
                            />
                            {previewUrl && (
                                <img src={previewUrl} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg border border-white/10" />
                            )}
                        </div>
                    </div>

                    {/* Presets Builder */}
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="font-bold text-lg">Пресеты страниц</h3>
                            <button
                                onClick={handleAddPreset}
                                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                            >
                                <Icons.Plus size={14} /> Добавить шаг
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Пресеты применяются к страницам фотокниги по кругу. Убедитесь, что первый макет подходит для разворота.
                        </p>

                        <div className="flex flex-col gap-3">
                            {pagePresets.map((preset, index) => (
                                <div key={index} className="bg-[#222] border border-white/5 rounded-xl p-4 flex gap-4 items-start relative group">
                                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 mt-2">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Макет (Layout ID)</label>
                                            <select
                                                value={preset.layoutId}
                                                onChange={e => handlePresetChange(index, 'layoutId', e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
                                            >
                                                {layouts.map(l => <option key={l.id} value={l.id}>{l.name} ({l.id})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Цвет фона (опционально)</label>
                                            <input
                                                value={preset.backgroundColor || ''}
                                                onChange={e => handlePresetChange(index, 'backgroundColor', e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                placeholder="#ffffff или URL"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemovePreset(index)}
                                        className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-2"
                                    >
                                        <Icons.Trash size={16} />
                                    </button>
                                </div>
                            ))}
                            {pagePresets.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-sm border-2 border-dashed border-gray-800 rounded-xl">
                                    Нет добавленных шагов
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
