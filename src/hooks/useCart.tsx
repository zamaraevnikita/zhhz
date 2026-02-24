import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, CartItem } from '../types';

interface CartContextProps {
    items: CartItem[];
    addToCart: (project: Project) => void;
    removeFromCart: (projectId: string) => void;
    updateQuantity: (projectId: string, delta: number) => void;
    updateCartItemVersion: (projectId: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = 'periodica_cart_state';

const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse cart state:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (project: Project) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.projectId === project.id);
            if (existing) {
                return prev.map((i) =>
                    i.projectId === project.id ? { ...i, quantity: i.quantity + 1, addedAt: new Date().toISOString() } : i
                );
            }
            return [
                ...prev,
                {
                    projectId: project.id,
                    quantity: 1,
                    pricePerUnit: parsePrice(project.price),
                    addedAt: new Date().toISOString()
                },
            ];
        });
    };

    const updateCartItemVersion = (projectId: string) => {
        setItems((prev) =>
            prev.map((i) =>
                i.projectId === projectId ? { ...i, addedAt: new Date().toISOString() } : i
            )
        );
    }

    const removeFromCart = (projectId: string) => {
        setItems((prev) => prev.filter((i) => i.projectId !== projectId));
    };

    const updateQuantity = (projectId: string, delta: number) => {
        setItems((prev) =>
            prev.map((i) => {
                if (i.projectId === projectId) {
                    const newQ = Math.max(1, i.quantity + delta);
                    return { ...i, quantity: newQ };
                }
                return i;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartTotal = items.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateCartItemVersion,
                clearCart,
                cartTotal,
                cartItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
