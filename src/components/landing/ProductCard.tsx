import React from 'react';

interface ProductCardProps {
    name: string;
    price: string;
    pages: string;
    imageUrl?: string;
    onDetail?: () => void;
    onBuild?: () => void;
}

/**
 * Проверяю позиционирование ProductCard по dasha.pen:
 * - Размер карточки: 269×358
 * - Изображение: 269×261, border 1px black
 * - Инфо-блок: 269×97, border 1px black
 * - Название: x=23, y=271, Helvetica bold 16px, чёрный
 * - Цена: x=161, y=270, Helvetica bold 16px, чёрный, text-align: right
 * - Кол-во страниц: x=24, y=291, Helvetica 300 12px, #747474
 * - Кнопки (y=319): «Подробнее» (94×23 обводка) + «Собрать» (94×23 чёрная)
 */
export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    price,
    pages,
    imageUrl,
    onDetail,
    onBuild,
}) => {
    return (
        <div className="flex flex-col" style={{ width: 269, height: 358 }}>
            {/* Изображение */}
            <div
                className="border border-black bg-white overflow-hidden"
                style={{ width: 269, height: 261 }}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-white" />
                )}
            </div>

            {/* Информация */}
            <div
                className="border border-black border-t-0 px-[23px] py-[10px] flex flex-col justify-between"
                style={{ width: 269, height: 97 }}
            >
                {/* Название + Цена */}
                <div className="flex justify-between items-start">
                    <span
                        className="text-black"
                        style={{
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 16,
                            fontWeight: 700,
                        }}
                    >
                        {name}
                    </span>
                    <span
                        className="text-black text-right"
                        style={{
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 16,
                            fontWeight: 700,
                        }}
                    >
                        {price}
                    </span>
                </div>

                {/* Страницы */}
                <span
                    style={{
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: 12,
                        fontWeight: 300,
                        color: '#747474',
                    }}
                >
                    {pages}
                </span>

                {/* Кнопки */}
                <div className="flex gap-[32px]">
                    <button
                        onClick={onDetail}
                        className="border border-black bg-white text-black hover:bg-gray-100 transition-colors text-center"
                        style={{
                            width: 94,
                            height: 23,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 10,
                        }}
                    >
                        Подробнее
                    </button>
                    <button
                        onClick={onBuild}
                        className="bg-black text-white hover:bg-gray-800 transition-colors text-center"
                        style={{
                            width: 94,
                            height: 23,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 10,
                        }}
                    >
                        Собрать
                    </button>
                </div>
            </div>
        </div>
    );
};
