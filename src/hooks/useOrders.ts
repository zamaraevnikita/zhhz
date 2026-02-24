import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { generateId } from '../utils';

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const storedOrders = localStorage.getItem('periodica_orders');
        if (storedOrders) {
            try {
                // Restore date objects that were stringified
                const parsed = JSON.parse(storedOrders).map((o: any) => ({
                    ...o,
                    createdAt: new Date(o.createdAt)
                }));
                const sorted = parsed.sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime());
                setOrders(sorted);
            } catch (e) {
                console.error("Failed to parse orders", e);
            }
        }
    }, []);

    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem('periodica_orders', JSON.stringify(newOrders));
    };

    const createOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        const newOrder: Order = {
            ...orderData,
            id: generateId(),
            createdAt: new Date(),
            status: 'pending'
        };

        setOrders(prev => {
            const updated = [newOrder, ...prev];
            localStorage.setItem('periodica_orders', JSON.stringify(updated));
            return updated;
        });

        return newOrder.id;
    }, []);

    const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
        setOrders(prev => {
            const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
            localStorage.setItem('periodica_orders', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearOrders = useCallback(() => {
        setOrders([]);
        localStorage.removeItem('periodica_orders');
    }, []);

    return {
        orders,
        createOrder,
        updateOrderStatus,
        clearOrders
    };
}
