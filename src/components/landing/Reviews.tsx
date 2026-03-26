import React from 'react';
import { ReviewCard } from './ReviewCard';

/**
 * Проверяю позиционирование Reviews относительно предыдущих блоков по dasha.pen:
 * - y=3742, после DesignerCTA (y=3078, h=664 → 3078+664=3742). Стыкуется ровно.
 * - width: 1440, height: 889
 * - margin-top: 0
 * - z-index: нет наложения
 *
 * Структура:
 * - «ВАШИ РЕВЬЮ» x=107 y=134, Syncopate Cyr 28px
 * - 3 карточки отзывов (284×553): x=107 y=202, x=579 y=201, x=1050 y=202
 *   gap между карточками: 579-107-284 = 188px
 * - Стрелка назад x=48 y=485 (круг 29px + стрелка)
 * - Стрелка вперед x=1391 y=458 (flipX)
 */

const REVIEWS = [
    {
        name: 'Ольга',
        text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась. Знакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
    },
    {
        name: 'Ольга',
        text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась. Знакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
    },
    {
        name: 'Ольга',
        text: 'Решила собрать альбом про наш год. Удивилась, СКОЛЬКО всего было! Наше знакомство. Первые свидания. Как мы съездили в Африку, а после — сразу съехались. Внезапный отъезд и жизнь в Грузии.\nБали и первая в жизни Жени съемка, которая (шок, но это правда) ему супер понравилась. Знакомство с моим папой и родными в Израиле. Когда дарила — расплакалась дважды.\nХочу сделать традицией и фиксировать каждый год.',
    },
];

export const Reviews: React.FC = () => {
    return (
        <section className="relative w-full bg-white" style={{ minHeight: 889 }}>
            <div className="max-w-[1440px] mx-auto relative">
                {/* Заголовок */}
                <h2
                    className="text-black uppercase"
                    style={{
                        fontFamily: '"Syncopate", sans-serif',
                        fontSize: 28,
                        paddingTop: 134,
                        paddingLeft: 107,
                    }}
                >
                    ВАШИ РЕВЬЮ
                </h2>

                {/* Карточки */}
                <div
                    className="flex relative"
                    style={{
                        marginTop: 68, /* y=202 - (y=134) */
                        paddingLeft: 107,
                        gap: 188, /* 579 - 107 - 284 */
                    }}
                >
                    {REVIEWS.map((review, i) => (
                        <ReviewCard
                            key={i}
                            name={review.name}
                            text={review.text}
                        />
                    ))}
                </div>

                {/* Стрелка назад */}
                <button
                    className="absolute w-[29px] h-[29px] rounded-full border border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ left: 48, top: 485 + 134 }}
                    aria-label="Назад"
                >
                    <svg width="15" height="9" viewBox="0 0 15 9" fill="none">
                        <path d="M3.5 5L0 2.5L3.5 0" stroke="#000" strokeWidth="1" />
                        <line x1="0" y1="4.5" x2="15" y2="4.5" stroke="#000" strokeWidth="1" />
                    </svg>
                </button>

                {/* Стрелка вперед */}
                <button
                    className="absolute w-[29px] h-[29px] rounded-full border border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ right: 50, top: 458 + 134 }}
                    aria-label="Вперед"
                >
                    <svg width="15" height="9" viewBox="0 0 15 9" fill="none" className="rotate-180">
                        <path d="M3.5 5L0 2.5L3.5 0" stroke="#000" strokeWidth="1" />
                        <line x1="0" y1="4.5" x2="15" y2="4.5" stroke="#000" strokeWidth="1" />
                    </svg>
                </button>
            </div>
        </section>
    );
};
