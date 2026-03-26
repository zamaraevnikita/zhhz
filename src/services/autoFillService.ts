import { Spread, UploadedImage, LayoutTemplate, SlotType } from '../types';
import { deepClone } from '../utils';

interface EmptySlot {
    spreadIndex: number;
    side: 'left' | 'right';
    slotId: string;
}

/**
 * Автозаполнение пустых IMAGE-слотов загруженными фотографиями.
 *
 * Алгоритм:
 * 1. Собирает все пустые IMAGE-слоты по порядку (обложка → страницы).
 * @returns { spreads, filledCount } — новый массив разворотов и кол-во заполненных слотов
 */
export function autoFillSpreads(
    spreads: Spread[],
    images: UploadedImage[],
    layouts: LayoutTemplate[],
): { spreads: Spread[]; filledCount: number } {
    if (images.length === 0) return { spreads, filledCount: 0 };

    const layoutMap = new Map<string, LayoutTemplate>();
    for (const l of layouts) layoutMap.set(l.id, l);

    // 1. Собираем пустые IMAGE-слоты
    const emptySlots: EmptySlot[] = [];

    for (let si = 0; si < spreads.length; si++) {
        const spread = spreads[si];
        for (const side of ['leftPage', 'rightPage'] as const) {
            const page = spread[side];
            if (page.type === 'flyleaf') continue;

            const layout = layoutMap.get(page.layoutId);
            if (!layout) continue;

            for (const slot of layout.slots) {
                if (slot.type !== SlotType.IMAGE) continue;

                const currentContent = page.content[slot.id];
                // Пустой слот: нет контента или пустая строка
                if (!currentContent || currentContent.trim() === '') {
                    emptySlots.push({
                        spreadIndex: si,
                        side: side === 'leftPage' ? 'left' : 'right',
                        slotId: slot.id,
                    });
                }
            }
        }
    }

    if (emptySlots.length === 0) return { spreads, filledCount: 0 };

    // 2. Находим уже использованные фотографии
    const usedUrls = new Set<string>();
    for (const spread of spreads) {
        for (const side of ['leftPage', 'rightPage'] as const) {
            const page = spread[side];
            if (page.type === 'flyleaf') continue;
            for (const contentUrl of Object.values(page.content) as string[]) {
                if (contentUrl && contentUrl.trim() !== '') {
                    usedUrls.add(contentUrl);
                }
            }
        }
    }

    // 3. Отбираем только неиспользованные фотографии
    const unusedImages = images.filter(img => !usedUrls.has(img.url));

    if (unusedImages.length === 0) return { spreads, filledCount: 0 };

    // 4. Заполняем свободные слоты неиспользованными фото (без зацикливания)
    const newSpreads = deepClone(spreads);
    const fillCount = Math.min(emptySlots.length, unusedImages.length);

    for (let i = 0; i < fillCount; i++) {
        const slot = emptySlots[i];
        const image = unusedImages[i];
        const pageKey = slot.side === 'left' ? 'leftPage' : 'rightPage';

        newSpreads[slot.spreadIndex][pageKey].content[slot.slotId] = image.url;
    }

    return { spreads: newSpreads, filledCount: fillCount };
}
