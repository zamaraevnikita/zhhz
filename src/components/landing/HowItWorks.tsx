import React from 'react';

/**
 * Проверяю позиционирование HowItWorks относительно предыдущих блоков по dasha.pen:
 * - y=2360, после ThemeExamples (y=1725, h=635 → 1725+635=2360). Стыкуется ровно.
 * - width: 1441, height: 718
 * - margin-top: 0
 * - z-index: нет наложения
 *
 * Структура:
 * - «КАК ЭТО РАБОТАЕТ?» x=49 y=61, Syncopate Cyr 28px, чёрный
 * - 4 шага с розовыми номерами (#e8bdcc, Syncopate 87-89px) слева
 * - Каждый шаг: заголовок (Syncopate 15px) + описание (Inter 14px)
 * - Горизонтальные разделители (path) между шагами
 * - Изображение-превью справа (x=709 y=106, 684×437)
 */

const STEPS = [
    {
        num: '1',
        title: 'Выбор\nобложки',
        desc: 'Ознакомьтесь с предложенными обложками здесь. Если ничего не приглянулось - загрузите вашу обложку в пустом варианте.',
    },
    {
        num: '2',
        title: 'Ознакомьтесь с товаром',
        desc: 'В карточке товара можно выбрать интересующее вас количество страниц, ознакомиться со сроками доставки и особенностями печати.',
    },
    {
        num: '3',
        title: 'Соберите\nмакет',
        desc: 'Выберите темы для наполнения и дизайн. Составьте свой персональный журнал заполнив шаблон фотографиями и текстом.',
    },
    {
        num: '4',
        title: 'Оформите\nзаказ',
        desc: 'Заполните информацию для заказа и ожидайте письмо об изготовлении на почте.',
    },
];

export const HowItWorks: React.FC = () => {
    return (
        <section className="relative w-full bg-white" style={{ minHeight: 718 }}>
            <div className="max-w-[1440px] mx-auto relative">
                {/* Заголовок */}
                <h2
                    className="text-black uppercase"
                    style={{
                        fontFamily: '"Syncopate", sans-serif',
                        fontSize: 28,
                        paddingTop: 61,
                        paddingLeft: 49,
                    }}
                >
                    КАК ЭТО РАБОТАЕТ?
                </h2>

                <div className="flex" style={{ marginTop: 45 }}>
                    {/* Левая часть — шаги */}
                    <div className="flex-shrink-0" style={{ width: 700 }}>
                        {STEPS.map((step, i) => (
                            <div key={step.num}>
                                <div className="flex items-start px-[19px]" style={{ minHeight: 96 }}>
                                    {/* Розовый номер */}
                                    <span
                                        className="flex-shrink-0"
                                        style={{
                                            fontFamily: '"Syncopate", sans-serif',
                                            fontSize: 87,
                                            lineHeight: 0.8,
                                            color: '#e8bdcc',
                                            width: 92,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {step.num}
                                    </span>

                                    {/* Заголовок шага */}
                                    <span
                                        className="flex-shrink-0 text-black uppercase whitespace-pre-line"
                                        style={{
                                            fontFamily: '"Syncopate", sans-serif',
                                            fontSize: 15,
                                            width: 192,
                                            paddingTop: 12,
                                            paddingLeft: 15,
                                        }}
                                    >
                                        {step.title}
                                    </span>

                                    {/* Описание */}
                                    <p
                                        className="text-black"
                                        style={{
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: 14,
                                            lineHeight: 1.4,
                                            maxWidth: 379,
                                            paddingTop: 8,
                                            paddingLeft: 10,
                                        }}
                                    >
                                        {step.desc}
                                    </p>
                                </div>

                                {/* Разделитель */}
                                {i < STEPS.length - 1 && (
                                    <div
                                        className="bg-black mx-[48px]"
                                        style={{ height: 1 }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Правая часть — изображение */}
                    <div
                        className="bg-[#d9d9d9] flex-shrink-0"
                        style={{
                            width: 684,
                            height: 437,
                            marginLeft: 9,
                            marginTop: 0,
                        }}
                    />
                </div>
            </div>
        </section>
    );
};
