import React from 'react';

/**
 * Проверяю позиционирование Footer относительно предыдущих блоков по dasha.pen:
 * - y=4632, после Reviews (y=3742, h=889 → 3742+889=4631, разница ~1px)
 * - width: 1440, height: 215
 * - margin-top: ~1px (визуально стыкуется)
 * - z-index: нет наложения
 *
 * Структура:
 * - Горизонтальная линия сверху (Vector 22: y=1.125, width=1440, #0b0b0b)
 * - Колонка 1 (x=50): О нас, Доставка, Печать, Частые вопросы, Контакты (Helvetica 14px, y=33..153, шаг 30px)
 * - Колонка 2 (x=252): Конструктор (y=33), Соберём журнал за вас (y=63)
 * - Колонка 3 (x=502): Договор оферты (y=33), Политика конфиденциальности (y=63)
 * - Соцсети справа (x=1295/1348): ВК (42×42 border), ТГ (42×42 border)
 */

const COL1 = ['О нас', 'Доставка', 'Печать', 'Частые вопросы', 'Контакты'];
const COL2 = ['Конструктор', 'Соберем журнал за вас'];
const COL3 = ['Договор оферты', 'Политика конфиденциальности'];

export const Footer: React.FC = () => {
    return (
        <footer className="relative w-full bg-white" style={{ height: 215 }}>
            <div className="max-w-[1440px] mx-auto relative h-full">
                {/* Линия сверху */}
                <div className="absolute top-[1px] left-0 right-0 h-px bg-[#0b0b0b]" />

                {/* Колонка 1 */}
                <div className="absolute" style={{ left: 50, top: 33 }}>
                    {COL1.map((item, i) => (
                        <a
                            key={item}
                            href="#"
                            className="block text-black hover:text-gray-500 transition-colors"
                            style={{
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontSize: 14,
                                marginTop: i > 0 ? 16 : 0,
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Колонка 2 */}
                <div className="absolute" style={{ left: 252, top: 33 }}>
                    {COL2.map((item, i) => (
                        <a
                            key={item}
                            href="#"
                            className="block text-black hover:text-gray-500 transition-colors"
                            style={{
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontSize: 14,
                                marginTop: i > 0 ? 16 : 0,
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Колонка 3 */}
                <div className="absolute" style={{ left: 502, top: 33 }}>
                    {COL3.map((item, i) => (
                        <a
                            key={item}
                            href="#"
                            className="block text-black hover:text-gray-500 transition-colors"
                            style={{
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontSize: 14,
                                marginTop: i > 0 ? 16 : 0,
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Соцсети */}
                <div className="absolute flex gap-[11px]" style={{ right: 50, top: 33 }}>
                    {/* ВК */}
                    <a
                        href="#"
                        className="flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-black"
                        style={{
                            width: 42,
                            height: 42,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 20,
                        }}
                    >
                        ВК
                    </a>

                    {/* ТГ */}
                    <a
                        href="#"
                        className="flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-black"
                        style={{
                            width: 42,
                            height: 42,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontSize: 20,
                        }}
                    >
                        Тг
                    </a>
                </div>
            </div>
        </footer>
    );
};
