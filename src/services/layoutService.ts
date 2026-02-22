import { LayoutTemplate, PageContent, SlotSettings, SlotType } from '../types';

/**
 * Подготавливает content и slotSettings для страницы при применении нового макета.
 * Чистая функция — не зависит от React.
 */
export const buildPageFromLayout = (
    layout: LayoutTemplate | undefined
): { content: PageContent; slotSettings: { [slotId: string]: SlotSettings } } => {
    const content: PageContent = {};
    const slotSettings: { [slotId: string]: SlotSettings } = {};

    if (layout?.slots) {
        for (const slot of layout.slots) {
            if (slot.defaultContent) {
                content[slot.id] = slot.defaultContent;
            }
            if (slot.type === SlotType.IMAGE) {
                slotSettings[slot.id] = {
                    fit: 'cover',
                    cropX: slot.defaultContentPosition?.x ?? 50,
                    cropY: slot.defaultContentPosition?.y ?? 50,
                    ...(slot.defaultSettings || {}),
                };
            } else if (slot.type === SlotType.TEXT && slot.defaultSettings) {
                slotSettings[slot.id] = { ...slot.defaultSettings };
            }
        }
    }

    return { content, slotSettings };
};
