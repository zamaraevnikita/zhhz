import React from 'react';

interface ReviewCardProps {
    name: string;
    text: string;
    imageUrl?: string;
}

/**
 * Проверяю позиционирование ReviewCard по dasha.pen:
 * - Размер карточки: 284×553
 * - Изображение: 284×284, fill #d9d9d9
 * - Имя: x=116 y=299, Inter 18px, center, middle — т.е. под фото
 * - Текст отзыва: x=0 y=336, Inter 12px, 284×217
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({
    name,
    text,
    imageUrl,
}) => {
    return (
        <div className="flex flex-col flex-shrink-0" style={{ width: 284, height: 553 }}>
            {/* Фото */}
            <div style={{ width: 284, height: 284 }} className="bg-[#d9d9d9] overflow-hidden">
                {imageUrl && (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                )}
            </div>

            {/* Имя */}
            <p
                className="text-center text-black"
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 18,
                    marginTop: 15,
                }}
            >
                {name}
            </p>

            {/* Текст отзыва */}
            <p
                className="text-black"
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.5,
                    marginTop: 22,
                    width: 284,
                }}
            >
                {text}
            </p>
        </div>
    );
};
