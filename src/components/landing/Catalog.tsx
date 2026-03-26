import React from 'react';
import { ProductCard } from './ProductCard';

interface CatalogProps {
    onBuild?: (productId: string) => void;
}

/**
 * Проверяю позиционирование Catalog относительно предыдущих блоков по dasha.pen:
 * - y=777, сразу после Hero (h=777). margin-top: 0 (стыкуется)
 * - width: 1440, height: 944
 * - fill: #ffffff (белый фон)
 * - Не пересекается с Hero
 *
 * Внутренняя структура:
 * - «КОНСТРУКТОР ГЛЯНЦА» x=50 y=41, Helvetica 12px, #737373
 * - «ВЫБЕРИ ОСНОВУ» x=501 y=41, Syncopate Cyr 28px, #000000, center
 * - «СОБЕРИ СВОЙ ЖУРНАЛ» x=1183 y=41, Helvetica 12px, #737373, right
 * - 6 карточек в сетке: 3 колонки × 2 ряда
 *   Ряд 1: y=125, карточки x=249, x=585, x=921  (gap ≈ 47px)
 *   Ряд 2: y=546, карточки x=249, x=585, x=921  (gap ≈ 63px vertical)
 */

const PRODUCTS = [
    { id: '1', name: 'Vogue', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
    { id: '2', name: 'GQ', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
    { id: '3', name: 'L\'Officiel', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
    { id: '4', name: 'Tatler', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
    { id: '5', name: 'Forbes', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
    { id: '6', name: 'Esquire', price: 'от 2000р.', pages: '20/24/28/32 страниц' },
];

export const Catalog: React.FC<CatalogProps> = ({ onBuild }) => {
    return (
        <section
            className="relative w-full bg-white"
            style={{ minHeight: 944 }}
        >
            <div className="max-w-[1440px] mx-auto relative" style={{ paddingTop: 41 }}>
                {/* Заголовочная строка */}
                <div className="flex items-baseline justify-between px-[50px]">
                    <span
                        className="uppercase"
                        style={{
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 12,
                            color: '#737373',
                            letterSpacing: '0.05em',
                        }}
                    >
                        КОНСТРУКТОР  ГЛЯНЦА
                    </span>

                    <h2
                        className="uppercase text-center"
                        style={{
                            fontFamily: '"Syncopate", sans-serif',
                            fontSize: 28,
                            color: '#000000',
                        }}
                    >
                        ВЫБЕРИ ОСНОВУ
                    </h2>

                    <span
                        className="uppercase text-right"
                        style={{
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 12,
                            color: '#737373',
                            letterSpacing: '0.05em',
                        }}
                    >
                        СОБЕРИ СВОЙ ЖУРНАЛ
                    </span>
                </div>

                {/* Сетка карточек 3×2 */}
                <div
                    className="grid grid-cols-3 justify-items-center"
                    style={{
                        marginTop: 84, /* y=125 minus header y=41 */
                        gap: '63px 47px',
                        paddingLeft: 249,
                        paddingRight: 1440 - 921 - 269,
                    }}
                >
                    {PRODUCTS.map(product => (
                        <ProductCard
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            pages={product.pages}
                            onBuild={() => onBuild?.(product.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
