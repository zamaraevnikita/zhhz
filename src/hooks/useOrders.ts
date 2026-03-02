import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function useOrders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = useCallback(async () => {
        if (!currentUser) {
            setOrders([]);
            return;
        }
        try {
            const data = await fetchApi<Order[]>('/orders');
            const parsed = data.map((o: any) => ({
                ...o,
                createdAt: new Date(o.createdAt)
            }));
            setOrders(parsed);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset orders on logout
    useEffect(() => {
        const handleLogout = () => setOrders([]);
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'userId'>) => {
        try {
            // userId is NOT passed — backend takes it from JWT token
            const newOrder = await fetchApi<Order>('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            setOrders(prev => [{ ...newOrder, createdAt: new Date(newOrder.createdAt) }, ...prev]);
            return newOrder.id;
        } catch (error) {
            console.error("Failed to create order", error);
            throw error;
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
        try {
            await fetchApi<Order>(`/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status } : o
            ));
        } catch (error) {
            console.error("Failed to update order status", error);
            throw error;
        }
    }, []);

    const clearOrders = useCallback(() => {
        setOrders([]);
    }, []);

    return {
        orders,
        createOrder,
        updateOrderStatus,
        clearOrders,
        refetchOrders: fetchOrders
    };
}
