import { Spread, DesignTemplate, LayoutTemplate, PageData, SlotType } from '../types';
import { buildPageFromLayout } from './layoutService';
import { autoFillSpreads } from './autoFillService';

export const applyDesignTemplate = (
    spreads: Spread[],
    template: DesignTemplate,
    layouts: LayoutTemplate[],
    uploadedImages: { id: string, url: string }[]
): { spreads: Spread[], filledCount: number } => {

    // 1. Собрать все фото из текущих разворотов
    const currentPhotos: string[] = [];
    spreads.forEach(s => {
        [s.leftPage, s.rightPage].forEach(page => {
            if (!page) return;
            const layout = layouts.find(l => l.id === page.layoutId);
            if (!layout) return;

            layout.slots.filter(slot => slot.type === SlotType.IMAGE).forEach(slot => {
                const contentUrl = page.content[slot.id];
                // Если есть контент и он не является дефолтным (у нас нет дефолтных url, но на всякий случай проверяем длину)
                if (contentUrl && contentUrl.length > 10) {
                    currentPhotos.push(contentUrl);
                }
            });
        });
    });

    // 2. Применить новые макеты и фоны циклически
    const newSpreads: Spread[] = spreads.map((s, index) => {
        const leftPageIndex = index * 2;
        const rightPageIndex = index * 2 + 1;

        const leftPreset = template.pagePresets[leftPageIndex % template.pagePresets.length];
        const rightPreset = template.pagePresets[rightPageIndex % template.pagePresets.length];

        const leftLayout = layouts.find(l => l.id === leftPreset.layoutId);
        const rightLayout = layouts.find(l => l.id === rightPreset.layoutId);

        const newLeftPage: PageData = leftLayout ? {
            id: s.leftPage.id,
            layoutId: leftLayout.id,
            type: s.leftPage.type,
            ...buildPageFromLayout(leftLayout),
            backgroundColor: leftPreset.backgroundColor || '#ffffff',
            // textDefaults можно тоже сливать сюда, если мы их поддерживаем в PageData
        } : s.leftPage;

        const newRightPage: PageData = rightLayout ? {
            id: s.rightPage.id,
            layoutId: rightLayout.id,
            type: s.rightPage.type,
            ...buildPageFromLayout(rightLayout),
            backgroundColor: rightPreset.backgroundColor || '#ffffff'
        } : s.rightPage;

        return { ...s, leftPage: newLeftPage, rightPage: newRightPage };
    });

    // 3. Отдаем на раскидывание фоток (автозаполнение)
    // Приоритет отдаем фоткам, которые мы только что извлекли
    const imagesToFill = currentPhotos.map((url, i) => ({ id: `preserved-${i}`, url, width: 800, height: 800, usedCount: 0 }));

    if (imagesToFill.length > 0) {
        return autoFillSpreads(newSpreads, imagesToFill, layouts);
    }

    return { spreads: newSpreads, filledCount: 0 };
};
