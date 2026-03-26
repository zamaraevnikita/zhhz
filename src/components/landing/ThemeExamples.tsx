import React, { useState } from 'react';

/**
 * Проверяю позиционирование ThemeExamples относительно предыдущих блоков по dasha.pen:
 * - y=1725, сразу после каталога (y=777, h=944 → 777+944=1721, разница ~4px)
 * - width: 1441, height: 635
 * - margin-top: ~4px от Catalog (визуально стыкуется)
 * - z-index: нет наложения
 *
 * Структура:
 * - «НЕ ПРОСТО ФОТОКНИГИ» x=427 y=93, Syncopate Cyr 28px, center
 * - Подзаголовок x=523 y=130, Helvetica 12px
 * - 6 табов-категорий (y=215): письмо редактора | путешествия | факты | увлечения | список желаний | обзор образов
 * - 6 карточек превью 224×224 в линию (y=253) + стрелки навигации
 * - CTA «Перейти в конструктор» (y=530, 176×33)
 */

const CATEGORIES = [
    'письмо редактора',
    'путешествия',
    'факты',
    'увлечения',
    'список желаний',
    'обзор образов',
];

interface ThemeExamplesProps {
    onCtaClick?: () => void;
}

export const ThemeExamples: React.FC<ThemeExamplesProps> = ({ onCtaClick }) => {
    const [activeCategory, setActiveCategory] = useState(0);

    return (
        <section className="relative w-full bg-white" style={{ minHeight: 635 }}>
            <div className="max-w-[1440px] mx-auto">
                {/* Заголовок */}
                <h2
                    className="text-center uppercase text-black"
                    style={{
                        fontFamily: '"Syncopate", sans-serif',
                        fontSize: 28,
                        paddingTop: 93,
                    }}
                >
                    НЕ ПРОСТО ФОТОКНИГИ
                </h2>

                {/* Подзаголовок */}
                <p
                    className="text-center text-black mx-auto"
                    style={{
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: 12,
                        marginTop: 13,
                        maxWidth: 394,
                        lineHeight: 1.6,
                    }}
                >
                    создай персональный журнал с известной обложкой,
                    используя готовые идеи наполнения и дизайна
                </p>

                {/* Табы категорий */}
                <div className="flex mx-[50px] mt-[52px]">
                    {CATEGORIES.map((cat, i) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(i)}
                            className="flex-1 flex items-center border border-black transition-colors"
                            style={{
                                height: 37,
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontSize: 13,
                                paddingLeft: 12,
                                backgroundColor: activeCategory === i ? '#000' : '#fff',
                                color: activeCategory === i ? '#fff' : '#000',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Карточки примеров 6 шт (224×224) */}
                <div className="relative mt-[1px]">
                    <div className="flex gap-0 mx-[50px]">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-black bg-white flex-shrink-0"
                                style={{ width: 224, height: 224 }}
                            />
                        ))}
                    </div>

                    {/* Стрелка влево */}
                    <button
                        className="absolute left-[50px] top-1/2 -translate-y-1/2 w-[31px] h-[31px] rounded-full border border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                        aria-label="Назад"
                    >
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none">
                            <path d="M3.5 5L0 2.5L3.5 0" stroke="#737373" strokeWidth="1" />
                            <line x1="0" y1="4.5" x2="15" y2="4.5" stroke="#737373" strokeWidth="1" />
                        </svg>
                    </button>

                    {/* Стрелка вправо */}
                    <button
                        className="absolute right-[50px] top-1/2 -translate-y-1/2 w-[31px] h-[31px] rounded-full border border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                        aria-label="Вперед"
                    >
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" className="rotate-180">
                            <path d="M3.5 5L0 2.5L3.5 0" stroke="#000" strokeWidth="1" />
                            <line x1="0" y1="4.5" x2="15" y2="4.5" stroke="#000" strokeWidth="1" />
                        </svg>
                    </button>
                </div>

                {/* CTA кнопка */}
                <div className="flex justify-center" style={{ marginTop: 40 }}>
                    <button
                        onClick={onCtaClick}
                        className="border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 11,
                            width: 176,
                            height: 33,
                        }}
                    >
                        Перейти в конструктор
                    </button>
                </div>
            </div>
        </section>
    );
};
