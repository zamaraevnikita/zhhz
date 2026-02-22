/**
 * Image Quality Service
 * Calculates print quality by comparing actual image resolution
 * against the required resolution for a given slot size in an A4 photobook.
 */

// Consumer photobook (~22×17cm at 300 DPI)
const PRINT_WIDTH_PX = 2600;
const PRINT_HEIGHT_PX = 2050;

export type QualityLevel = 0 | 1 | 2 | 3 | 4;

export interface QualityInfo {
    level: QualityLevel;
    label: string;
    color: string;
    message: string;
    actualWidth: number;
    actualHeight: number;
    requiredWidth: number;
    requiredHeight: number;
}

const QUALITY_LABELS: Record<QualityLevel, { label: string; color: string; message: string }> = {
    0: {
        label: 'Сильно размыто',
        color: '#EF4444',
        message: 'Рекомендуем заменить эту фотографию, т.к. при печати изображение будет сильно размыто.',
    },
    1: {
        label: 'Размыто',
        color: '#F97316',
        message: 'Рекомендуем заменить эту фотографию, т.к. при печати изображение будет размыто.',
    },
    2: {
        label: 'Немного размыто',
        color: '#EAB308',
        message: 'Качество печати может быть немного снижено. Рекомендуем использовать фото большего размера.',
    },
    3: {
        label: 'Почти без размытия',
        color: '#84CC16',
        message: 'Качество печати будет хорошим.',
    },
    4: {
        label: 'Четко',
        color: '#22C55E',
        message: 'Отличное качество для печати!',
    },
};

/**
 * Get the required pixel resolution for a slot given its percentage size.
 */
export function getRequiredResolution(
    slotWidthPercent: number,
    slotHeightPercent: number
): { width: number; height: number } {
    return {
        width: Math.round((slotWidthPercent / 100) * PRINT_WIDTH_PX),
        height: Math.round((slotHeightPercent / 100) * PRINT_HEIGHT_PX),
    };
}

/**
 * Calculate print quality level (0-4) by comparing actual image resolution
 * to the required resolution for a given slot.
 */
export function calculatePrintQuality(
    imageWidth: number,
    imageHeight: number,
    slotWidthPercent: number,
    slotHeightPercent: number
): QualityInfo {
    const required = getRequiredResolution(slotWidthPercent, slotHeightPercent);

    // Calculate ratio: how much of the required resolution the image provides
    const widthRatio = imageWidth / required.width;
    const heightRatio = imageHeight / required.height;
    // Use the minimum ratio (bottleneck dimension)
    const ratio = Math.min(widthRatio, heightRatio);

    let level: QualityLevel;
    if (ratio >= 0.9) level = 4;       // Четко
    else if (ratio >= 0.6) level = 3;  // Почти без размытия
    else if (ratio >= 0.35) level = 2; // Немного размыто
    else if (ratio >= 0.15) level = 1; // Размыто
    else level = 0;                    // Сильно размыто

    return {
        level,
        ...QUALITY_LABELS[level],
        actualWidth: imageWidth,
        actualHeight: imageHeight,
        requiredWidth: required.width,
        requiredHeight: required.height,
    };
}

// Cache for loaded image dimensions
const dimensionCache = new Map<string, { width: number; height: number }>();

/**
 * Get natural dimensions of an image by URL.
 * Results are cached.
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    const cached = dimensionCache.get(url);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const dims = { width: img.naturalWidth, height: img.naturalHeight };
            dimensionCache.set(url, dims);
            resolve(dims);
        };
        img.onerror = () => {
            resolve({ width: 0, height: 0 });
        };
        img.src = url;
    });
}

/**
 * Get cached dimensions synchronously (returns null if not cached yet).
 */
export function getCachedDimensions(url: string): { width: number; height: number } | null {
    return dimensionCache.get(url) || null;
}

/**
 * Pre-cache dimensions for a URL.
 */
export function cacheDimensions(url: string, width: number, height: number): void {
    dimensionCache.set(url, { width, height });
}
