import React from 'react';
import { Icons } from '../IconComponents';
import { LayoutGrid, ShoppingCart } from 'lucide-react';

interface AdminTopBarProps {
    adminTab: 'layouts' | 'orders';
    setAdminTab: (tab: 'layouts' | 'orders') => void;
    onClose: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ adminTab, setAdminTab, onClose }) => {
    return (
        <div className="h-14 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Icons.Settings size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm tracking-wide text-white">Админ-панель</span>
                </div>

                <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                {/* Tabs */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setAdminTab('layouts')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'layouts' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutGrid size={14} /> Конструктор
                    </button>
                    <button
                        onClick={() => setAdminTab('orders')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'orders' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ShoppingCart size={14} /> Заказы
                    </button>
                </div>
            </div>

            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <Icons.Close size={18} />
            </button>
        </div>
    );
};
