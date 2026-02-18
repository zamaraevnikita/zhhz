import type { LayoutTemplate, LayoutSlot } from '../types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const deepClone = <T>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
};

export const clamp = (val: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, val));
};

/** Нормализация rect слота: границы листа 0–100%, округление до 2 знаков, слот не выходит за края. */
export function normalizeSlotRect(rect: { x: number; y: number; w: number; h: number }): { x: number; y: number; w: number; h: number } {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    let w = round2(clamp(rect.w, 1, 100));
    let h = round2(clamp(rect.h, 1, 100));
    let x = round2(clamp(rect.x, 0, 100 - w));
    let y = round2(clamp(rect.y, 0, 100 - h));
    return { x, y, w, h };
}

/** Нормализация всех rect в макете (для сохранения и загрузки). */
export function normalizeLayoutRects(layout: LayoutTemplate): LayoutTemplate {
    const next = deepClone(layout);
    next.slots = next.slots.map((s: LayoutSlot) =>
        s.rect ? { ...s, rect: normalizeSlotRect(s.rect) } : s
    );
    return next;
}
