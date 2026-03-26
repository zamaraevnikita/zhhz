import { DesignTemplate } from '../types';
import { fetchApi } from '../utils/api';

export const getDesignTemplates = async (): Promise<DesignTemplate[]> => {
    return fetchApi<DesignTemplate[]>('/design-templates');
};

export const createDesignTemplate = async (template: Omit<DesignTemplate, 'id' | 'createdAt'>): Promise<DesignTemplate> => {
    return fetchApi<DesignTemplate>('/design-templates', {
        method: 'POST',
        body: JSON.stringify(template),
    });
};

export const updateDesignTemplate = async (id: string, template: Partial<DesignTemplate>): Promise<DesignTemplate> => {
    return fetchApi<DesignTemplate>(`/design-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
    });
};

export const deleteDesignTemplate = async (id: string): Promise<void> => {
    await fetchApi(`/design-templates/${id}`, {
        method: 'DELETE',
    });
};
