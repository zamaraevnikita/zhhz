import { Spread, UploadedImage } from '../types';

/**
 * Подсчитывает, сколько раз каждое изображение (по URL) используется в разворотах.
 * Возвращает Map<url, count>.
 */
export const calculateImageUsageMap = (spreads: Spread[]): Map<string, number> => {
    const usageMap = new Map<string, number>();

    spreads.forEach(spread => {
        Object.values(spread.leftPage.content).forEach(val => {
            if (val) usageMap.set(val, (usageMap.get(val) || 0) + 1);
        });
        Object.values(spread.rightPage.content).forEach(val => {
            if (val) usageMap.set(val, (usageMap.get(val) || 0) + 1);
        });
    });

    return usageMap;
};

/**
 * Обновляет `usedCount` у каждого загруженного изображения на основе разворотов.
 */
export const updateImageUsageCounts = (
    images: UploadedImage[],
    spreads: Spread[]
): UploadedImage[] => {
    const usageMap = calculateImageUsageMap(spreads);
    return images.map(img => ({
        ...img,
        usedCount: usageMap.get(img.url) || 0,
    }));
};
