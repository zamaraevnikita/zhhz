import React, { useEffect, useState } from 'react';
import { DesignTemplate } from '../../types';
import { getDesignTemplates } from '../../services/designTemplateApiService';
import { Icons } from '../IconComponents';

interface DesignTemplatePanelProps {
    themeId: string;
    onApplyTemplate: (template: DesignTemplate) => void;
    onClosePanel: () => void;
}

export const DesignTemplatePanel: React.FC<DesignTemplatePanelProps> = ({ themeId, onApplyTemplate, onClosePanel }) => {
    const [templates, setTemplates] = useState<DesignTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDesignTemplates()
            .then(data => {
                // Пытаемся показать шаблоны текущей темы, или все
                const themeTemplates = data.filter(t => t.themeId === themeId);
                // Если для текущей темы нет шаблонов, показываем все
                setTemplates(themeTemplates.length > 0 ? themeTemplates : data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [themeId]);

    const handleApply = (tmpl: DesignTemplate) => {
        if (!confirm(`Применить шаблон "${tmpl.name}" ко всей книге?`)) return;
        onApplyTemplate(tmpl);
        onClosePanel();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden min-h-0 bg-white">
            <div className="p-3 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Шаблоны дизайна</h3>
                <p className="text-[10px] text-gray-500 leading-tight">
                    Примените профессиональный стиль страниц и фонов ко всей книге в один клик.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 font-mono text-xs">
                        Нет доступных шаблонов дизайна.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {templates.map(tmpl => (
                            <button
                                key={tmpl.id}
                                onClick={() => handleApply(tmpl)}
                                className="flex flex-col text-left group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all bg-white relative"
                            >
                                <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                                    {tmpl.previewUrl ? (
                                        <img src={tmpl.previewUrl} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            <Icons.Image size={24} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                                        <div className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm translate-y-4 group-hover:translate-y-0 transition-transform">
                                            Применить ко всей книге
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2.5">
                                    <div className="font-bold text-xs text-gray-900 mb-0.5">{tmpl.name}</div>
                                    <div className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{tmpl.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
