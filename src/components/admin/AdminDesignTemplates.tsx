import React, { useEffect, useState } from 'react';
import { DesignTemplate } from '../../types';
import { getDesignTemplates, deleteDesignTemplate } from '../../services/designTemplateApiService';
import { Icons } from '../IconComponents';
import { THEMES } from '../../themes';
import { AdminDesignTemplateEditor } from './AdminDesignTemplateEditor';

export const AdminDesignTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<DesignTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<DesignTemplate | null>(null);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await getDesignTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Failed to load templates', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Точно удалить этот шаблон?')) return;
        try {
            await deleteDesignTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete template', err);
            alert('Ошибка при удалении шаблона');
        }
    };

    const getThemeName = (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        return theme ? theme.name : themeId;
    };

    if (isEditorOpen) {
        return (
            <AdminDesignTemplateEditor
                template={editingTemplate}
                onSave={() => { setIsEditorOpen(false); setEditingTemplate(null); loadTemplates(); }}
                onCancel={() => { setIsEditorOpen(false); setEditingTemplate(null); }}
            />
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-transparent p-6 lg:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Шаблоны дизайна</h2>
                        <p className="text-sm text-gray-400">Пресеты макетов и стилей, которые применяются ко всей книге сразу</p>
                    </div>
                    <button
                        onClick={() => { setEditingTemplate(null); setIsEditorOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Icons.Plus size={18} />
                        Создать шаблон
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <Icons.Grid size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Шаблонов пока нет</h3>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto">
                            Создайте шаблоны дизайна для тем, чтобы пользователи могли применить профессиональную верстку в один клик.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {templates.map(tmpl => (
                            <div key={tmpl.id} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden group hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all flex flex-col">
                                <div className="aspect-[3/4] relative bg-black/40 overflow-hidden">
                                    {tmpl.previewUrl ? (
                                        <img src={tmpl.previewUrl} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-600">
                                            <Icons.Image size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                                        {getThemeName(tmpl.themeId)}
                                    </div>
                                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => { setEditingTemplate(tmpl); setIsEditorOpen(true); }}
                                            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                                        >
                                            <Icons.Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tmpl.id)}
                                            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Icons.Trash size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-white mb-1 truncate">{tmpl.name}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{tmpl.description}</p>
                                    <div className="mt-auto flex items-center justify-between text-[11px] font-mono text-gray-500">
                                        <span>{tmpl.pagePresets.length} Steps</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
