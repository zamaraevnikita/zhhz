import { useState, useEffect, useCallback } from 'react';
import { LayoutTemplate } from '../types';
import { normalizeLayoutRects } from '../utils';
import { LAYOUTS as STATIC_LAYOUTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

export function useLayouts() {
    const { currentUser } = useAuth();
    const [layouts, setLayouts] = useState<LayoutTemplate[]>(STATIC_LAYOUTS.map(l => normalizeLayoutRects(l)));
    const [isLoading, setIsLoading] = useState(true);

    const fetchLayouts = useCallback(async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchApi<any[]>('/layouts');
            // Map the DB data to LayoutTemplate and merge with static ones
            const customLayouts = data.map((l: any) => normalizeLayoutRects({
                id: l.id,
                name: l.name,
                slots: l.slots,
                isCustom: true
            } as LayoutTemplate));

            setLayouts([...STATIC_LAYOUTS.map(l => normalizeLayoutRects(l)), ...customLayouts]);
        } catch (error) {
            console.error('Failed to fetch layouts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchLayouts();
    }, [fetchLayouts]);

    const saveLayout = async (layout: LayoutTemplate) => {
        if (!currentUser) return;

        try {
            const normalized = normalizeLayoutRects(layout);

            // Optimistic update
            setLayouts(prev => {
                const exists = prev.find(l => l.id === normalized.id);
                return exists ? prev.map(l => l.id === normalized.id ? normalized : l) : [...prev, normalized];
            });

            await fetchApi('/layouts', {
                method: 'POST',
                body: JSON.stringify({
                    id: normalized.id,
                    name: normalized.name,
                    slots: normalized.slots
                })
            });
        } catch (error) {
            console.error('saveLayout error:', error);
            fetchLayouts();
        }
    };

    const deleteLayout = async (id: string) => {
        if (!currentUser) return;

        try {
            // Optimistic update
            setLayouts(prev => prev.filter(l => l.id !== id));
            await fetchApi(`/layouts/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('deleteLayout error:', error);
            fetchLayouts();
        }
    };

    return {
        layouts,
        isLoading,
        saveLayout,
        deleteLayout,
        refetch: fetchLayouts
    };
}
