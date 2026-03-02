import React, { useState } from 'react';
import { ShoppingCart, Clock, User as UserIcon, Download, Package, Loader } from 'lucide-react';
import { Order, Project } from '../../types';
import { fetchApi } from '../../utils/api';

interface AdminOrdersProps {
    orders: Order[];
    setExportProject: (project: Project | null) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Ожидает', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
    PROCESSING: { label: 'В работе', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    SHIPPED: { label: 'Доставка', color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    DELIVERED: { label: 'Доставлен', color: 'bg-green-500/20 text-green-400 border-green-500/20' },
};

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, setExportProject }) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleExportPdf = async (projectId: string, itemKey: string) => {
        setLoadingId(itemKey);
        try {
            const project = await fetchApi<Project>(`/projects/${projectId}`);
            if (!project || !project.spreads?.length) {
                alert('Данные проекта недоступны. Возможно, проект был удалён.');
                return;
            }
            setExportProject(project);
        } catch (err: any) {
            console.error('Failed to load project for export:', err);
            alert(`Не удалось загрузить проект: ${err.message || 'Ошибка сервера'}`);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="flex-1 bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Журнал заказов</h2>

                {orders.length === 0 ? (
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                        <ShoppingCart size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300">Пока нет заказов</h3>
                        <p className="text-gray-500 mt-2">Когда пользователи оформят покупку в корзине, заказы появятся здесь.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS['PENDING'];
                            const createdAt = order.createdAt instanceof Date
                                ? order.createdAt
                                : new Date(order.createdAt as any);

                            return (
                                <div key={order.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors shadow-lg">
                                    {/* Order Header */}
                                    <div className="p-5 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">
                                                    Заказ #{order.id.substring(0, 8)}
                                                </span>
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} />{createdAt.toLocaleString('ru-RU')}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <UserIcon size={12} />{order.customerName} ({order.customerPhone})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Сумма</div>
                                            <div className="text-lg font-bold text-white">{order.totalAmount.toLocaleString('ru-RU')} ₽</div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-5">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                            Напечатанные альбомы ({order.items.length})
                                        </h4>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {order.items.map((item, idx) => {
                                                // Support both legacy format (item.project) and new flat format (item.name)
                                                const itemName = item.name || item.project?.name || 'Фотокнига';
                                                const previewUrl = item.project?.previewUrl ?? null;
                                                const pageCount = item.project?.pageCount ?? 24;
                                                const projectId = item.projectId || (item.project as any)?.id;
                                                const itemKey = `${order.id}-${idx}`;

                                                return (
                                                    <div key={idx} className="flex gap-4 p-4 bg-[#222] rounded-lg border border-white/5 items-center">
                                                        <div className="w-16 h-20 bg-[#111] rounded border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                                            {previewUrl
                                                                ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                                : <Package size={20} className="text-gray-600" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-bold text-sm text-gray-200 truncate mb-1">{itemName}</h5>
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                {pageCount} страниц • Твердый переплет • {item.quantity} шт.
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-gray-400">
                                                                    {item.pricePerUnit.toLocaleString('ru-RU')} ₽ / шт.
                                                                </span>
                                                                {projectId && (
                                                                    <button
                                                                        onClick={() => handleExportPdf(projectId, itemKey)}
                                                                        disabled={loadingId === itemKey}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded transition-colors border border-blue-500/20 disabled:opacity-50"
                                                                    >
                                                                        {loadingId === itemKey
                                                                            ? <><Loader size={12} className="animate-spin" /> Загрузка…</>
                                                                            : <><Download size={12} /> Скачать PDF</>
                                                                        }
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
