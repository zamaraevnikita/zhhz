import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Project } from '../types';
import { Icons } from './IconComponents';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { AuthModal } from './AuthModal';

export interface CartViewProps {
    projects: Project[];
    onBack: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ projects, onBack }) => {
    const {
        items,
        updateQuantity,
        removeFromCart,
        updateCartItemVersion,
        clearCart,
        cartTotal,
    } = useCart();

    const { createOrder } = useOrders();
    const { role, currentUser } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const handleCheckout = () => {
        if (role === 'GUEST') {
            setIsAuthModalOpen(true);
            return;
        }

        setCheckoutStatus('processing');
        setTimeout(() => {
            setCheckoutStatus('success');

            // Generate snapshot of the actual ordered items before clearing the cart
            const orderItems = items.map(cartItem => {
                const projSnapshot = projects.find(p => p.id === cartItem.projectId);
                return {
                    project: JSON.parse(JSON.stringify(projSnapshot)), // Deep clone to freeze state
                    quantity: cartItem.quantity,
                    pricePerUnit: cartItem.pricePerUnit
                };
            }).filter(item => item.project); // guard against missing projects

            setTimeout(() => {
                createOrder({
                    userId: currentUser?.id,
                    customerName: currentUser?.name || 'Гость',
                    customerEmail: currentUser?.email || 'test@example.com',
                    items: orderItems,
                    totalAmount: cartTotal
                });

                clearCart();
                setCheckoutStatus('idle');
                onBack(); // Go back to dashboard after successful order
                alert('Заказ успешно оформлен! Спасибо за покупку.');
            }, 1000);
        }, 1500);
    };

    const formatPrice = (price: number) => {
        return `${price.toLocaleString('ru-RU')} ₽`;
    };

    return (
        <div className="flex flex-col h-screen bg-[#F3F4F6]">
            {/* Header */}
            <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <Icons.ChevronLeft size={18} />
                        К проектам
                    </button>
                    <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Icons.Cart size={20} className="text-blue-500" />
                        Оформление заказа
                    </h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10">

                    {/* Items List */}
                    <div className="flex-1 space-y-4">
                        {items.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Icons.Cart size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Ваша корзина пуста</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-sm">Перейдите в проекты, чтобы выбрать и настроить идеальный фотоальбом для печати.</p>
                                <button
                                    onClick={onBack}
                                    className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-xl transition-colors"
                                >
                                    Вернуться к проектам
                                </button>
                            </div>
                        ) : (
                            items.map((item) => {
                                const project = projects.find((p) => p.id === item.projectId);
                                if (!project) return null;

                                const isOutdated = new Date(project.updatedAt) > new Date(item.addedAt);

                                return (
                                    <div key={item.projectId} className={`bg-white rounded-2xl shadow-sm border ${isOutdated ? 'border-amber-200' : 'border-gray-200'} p-4 sm:p-6 transition-all`}>
                                        {/* Warning Banner */}
                                        {isOutdated && (
                                            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                                <div className="flex gap-3 text-amber-800">
                                                    <Icons.Eye className="shrink-0 mt-0.5" size={16} />
                                                    <div className="text-xs sm:text-sm">
                                                        <strong>Внимание!</strong> Вы изменяли этот проект после добавления в корзину.
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => updateCartItemVersion(item.projectId)}
                                                    className="shrink-0 px-4 py-2 bg-white text-amber-700 font-bold text-xs border border-amber-200 rounded-lg shadow-sm hover:bg-amber-100 transition-colors whitespace-nowrap"
                                                >
                                                    Обновить до последней версии
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-5 lg:gap-8 opacity-100">
                                            {/* Thumbnail */}
                                            <div className="w-full sm:w-32 lg:w-40 aspect-[1/1.4] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative group">
                                                {project.previewUrl ? (
                                                    <img src={project.previewUrl} alt={project.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                                        <Icons.Image size={24} />
                                                        <span className="text-[10px] uppercase font-bold tracking-wider">Нет фото</span>
                                                    </div>
                                                )}
                                                {/* Hover Overlay - Quick Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={onBack} className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform">
                                                        Редактировать
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Details & Controls */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl line-clamp-1" title={project.name}>{project.name}</h3>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Твердый переплет</span>
                                                                <span>•</span>
                                                                <span>24 страницы</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.projectId)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Удалить из корзины"
                                                        >
                                                            <Icons.Close size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-end justify-between mt-auto">
                                                    {/* Quantity Control */}
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Количество</div>
                                                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 w-fit">
                                                            <button
                                                                onClick={() => updateQuantity(item.projectId, -1)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-md text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Icons.Minus size={14} />
                                                            </button>
                                                            <div className="w-10 text-center text-sm font-bold text-gray-900">
                                                                {item.quantity}
                                                            </div>
                                                            <button
                                                                onClick={() => updateQuantity(item.projectId, 1)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <Icons.Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Сумма</div>
                                                        <div className="font-bold text-gray-900 text-lg">
                                                            {formatPrice(item.pricePerUnit * item.quantity)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    {items.length > 0 && (
                        <div className="w-full lg:w-[340px] shrink-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Сумма заказа</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Товары ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                                        <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Доставка</span>
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded leading-none flex items-center">Бесплатно</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-gray-900">К оплате</span>
                                        <span className="text-2xl font-bold text-gray-900 leading-none">{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutStatus !== 'idle' || items.some(item => {
                                        const p = projects.find(p => p.id === item.projectId);
                                        return p && new Date(p.updatedAt) > new Date(item.addedAt);
                                    })}
                                    className="relative w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {checkoutStatus === 'idle' && (
                                        <>
                                            <span>ОФОРМИТЬ В ПЕЧАТЬ</span>
                                            <Icons.ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                    {checkoutStatus === 'processing' && (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ОБРАБОТКА...
                                        </>
                                    )}
                                    {checkoutStatus === 'success' && 'УСПЕШНО!'}
                                </button>

                                {items.some(item => {
                                    const p = projects.find(p => p.id === item.projectId);
                                    return p && new Date(p.updatedAt) > new Date(item.addedAt);
                                }) && (
                                        <p className="text-center text-xs text-amber-600 mt-4 leading-tight">Пожалуйста, обновите устаревшие макеты перед оформлением заказа.</p>
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    // Automatically proceed to checkout if they login successfully
                    handleCheckout();
                }}
            />
        </div>
    );
};
