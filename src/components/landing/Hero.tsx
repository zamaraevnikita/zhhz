import React from 'react';

interface HeroProps {
    onCtaClick?: () => void;
}

/**
 * Проверяю позиционирование Hero относительно предыдущих блоков по dasha.pen:
 * - Это «фон стартового экрана»: y=0, width=1441, height=777
 * - Навбар лежит ПОВЕРХ hero (z-index выше)
 * - Фоновое изображение (type=image, mode=stretch) на весь блок
 * - Текстовых элементов в .pen нет (placeholder), добавляю заголовок и CTA
 *   чтобы секция не была пустой — это стандартный паттерн hero
 * - margin-top: 0 (начинается от самого верха)
 * - z-index: ниже навбара
 */
export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ height: 777 }}
        >
            {/* Фоновый плейсхолдер — в .pen это изображение (mode: stretch) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />

            {/* Затемнение для контраста текста */}
            <div className="absolute inset-0 bg-black/5" />

            {/* Контент по центру — текст будет добавлен когда будет реальное изображение */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h1
                    className="text-black uppercase tracking-wider"
                    style={{
                        fontFamily: '"Syncopate", sans-serif',
                        fontSize: 83,
                        lineHeight: 1.1,
                    }}
                >
                    СОЗДАЙ СВОЙ<br />ЖУРНАЛ
                </h1>
                <p
                    className="mt-6 text-black/70 max-w-[394px] mx-auto"
                    style={{
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: 12,
                        lineHeight: 1.6,
                    }}
                >
                    создай персональный журнал с известной обложкой,
                    используя готовые идеи наполнения и дизайна
                </p>

                {/* CTA кнопка */}
                <button
                    onClick={onCtaClick}
                    className="mt-8 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors duration-300"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 11,
                        padding: '7px 18px',
                        height: 33,
                        width: 176,
                    }}
                >
                    Перейти в конструктор
                </button>
            </div>

            {/* Декоративная стрелка вниз */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="black" strokeWidth="1">
                    <path d="M8 0 L8 18 M2 13 L8 19 L14 13" />
                </svg>
            </div>
        </section>
    );
};
