import React from 'react';

interface DesignerCTAProps {
    onCtaClick?: () => void;
}

/**
 * Проверяю позиционирование DesignerCTA относительно предыдущих блоков по dasha.pen:
 * - y=3078, после HowItWorks (y=2360, h=718 → 2360+718=3078). Стыкуется.
 * - width: 1440, height: 664
 * - margin-top: 0
 * - z-index: нет наложения
 *
 * Структура:
 * - Фоновое изображение (type=image, stretch, 1440×983)
 * - Тёмный оверлей: #20202054 (33% alpha), 1441×664
 * - Текст по центру: x=523 y=279, Inter 13px, белый, center
 * - CTA кнопка: x=632 y=340, 176×33, fill #fff, stroke #fff, text Inter 11px #fff
 * - Большой текст внизу: x=0 y=580, Syncopate 83px, #e8bdcc, center
 *   «РАБОТА С DИЗАЙНЕРОМ», width=1440
 */
export const DesignerCTA: React.FC<DesignerCTAProps> = ({ onCtaClick }) => {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ height: 664 }}
        >
            {/* Фоновое изображение (placeholder) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800" />

            {/* Тёмный оверлей */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(32, 32, 32, 0.33)' }}
            />

            {/* Контент */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {/* Описательный текст */}
                <p
                    className="text-center text-white mx-auto"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        maxWidth: 394,
                        lineHeight: 1.5,
                        marginTop: -100,
                    }}
                >
                    У вас есть свои идеи для наполнения?<br />
                    Вы хотите индивидуальный дизайн?<br />
                    Закажите бесплатную консультацию с дизайнером!
                </p>

                {/* CTA кнопка (белая обводка на тёмном фоне) */}
                <button
                    onClick={onCtaClick}
                    className="bg-white text-white border border-white hover:bg-white/20 transition-colors"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 11,
                        width: 176,
                        height: 33,
                        marginTop: 22,
                        color: '#000',
                    }}
                >
                    Перейти в конструктор
                </button>

                {/* Большой декоративный текст */}
                <h2
                    className="absolute bottom-0 left-0 w-full text-center uppercase pointer-events-none select-none"
                    style={{
                        fontFamily: '"Syncopate", sans-serif',
                        fontSize: 83,
                        color: '#e8bdcc',
                        lineHeight: 1.1,
                        paddingBottom: 20,
                    }}
                >
                    РАБОТА С DИЗАЙНЕРОМ
                </h2>
            </div>
        </section>
    );
};
