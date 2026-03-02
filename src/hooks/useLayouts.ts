import { useState, useEffect, useCallback } from 'react';
import { LayoutTemplate } from '../types';
import { normalizeLayoutRects } from '../utils';
import { LAYOUTS as STATIC_LAYOUTS } from '../constants';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function useLayouts() {
    const { token } = useAuth();
    const [layouts, setLayouts] = useState<LayoutTemplate[]>(STATIC_LAYOUTS.map(l => normalizeLayoutRects(l)));
    const [isLoading, setIsLoading] = useState(true);

    const fetchLayouts = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/layouts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Map the DB data to LayoutTemplate and merge with static ones
                const customLayouts = data.map((l: any) => normalizeLayoutRects({
                    id: l.id,
                    name: l.name,
                    slots: l.slots,
                    isCustom: true // Mark as custom if needed by UI
                } as LayoutTemplate));

                setLayouts([...STATIC_LAYOUTS.map(l => normalizeLayoutRects(l)), ...customLayouts]);
            }
        } catch (error) {
            console.error('Failed to fetch layouts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLayouts();
    }, [fetchLayouts]);

    const saveLayout = async (layout: LayoutTemplate) => {
        if (!token) return;

        try {
            const normalized = normalizeLayoutRects(layout);

            // Optimistic update
            setLayouts(prev => {
                const exists = prev.find(l => l.id === normalized.id);
                return exists ? prev.map(l => l.id === normalized.id ? normalized : l) : [...prev, normalized];
            });

            const res = await fetch(`${API_URL}/layouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: normalized.id,
                    name: normalized.name,
                    slots: normalized.slots
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save layout to DB');
            }
        } catch (error) {
            console.error('saveLayout error:', error);
            // Optionally revert optimistic update here by refetching
            fetchLayouts();
        }
    };

    const deleteLayout = async (id: string) => {
        if (!token) return;

        try {
            // Optimistic update
            setLayouts(prev => prev.filter(l => l.id !== id));

            const res = await fetch(`${API_URL}/layouts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to delete layout from DB');
            }
        } catch (error) {
            console.error('deleteLayout error:', error);
            // Revert on error
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
