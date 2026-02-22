import React, { useState, useCallback } from 'react';
import { UploadedImage, Spread } from '../types';
import { generateId } from '../utils';
import { updateImageUsageCounts } from '../services/imageUsageService';
import { cacheDimensions } from '../services/imageQualityService';

export interface UseImagesReturn {
    uploadedImages: UploadedImage[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    recalculateUsage: (spreads: Spread[]) => void;
    clearAll: () => void;
    getImageDimsByUrl: (url: string) => { width: number; height: number } | null;
}

/**
 * Хук для управления загруженными изображениями.
 */
export function useImages(): UseImagesReturn {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file as File);
                const img = new Image();
                img.onload = () => {
                    const w = img.naturalWidth;
                    const h = img.naturalHeight;
                    cacheDimensions(url, w, h);
                    const newImage: UploadedImage = {
                        id: generateId(),
                        url,
                        usedCount: 0,
                        naturalWidth: w,
                        naturalHeight: h,
                    };
                    setUploadedImages(prev => [newImage, ...prev]);
                };
                img.src = url;
            });
        }
    }, []);

    const recalculateUsage = useCallback((spreads: Spread[]) => {
        setUploadedImages(prev => updateImageUsageCounts(prev, spreads));
    }, []);

    const clearAll = useCallback(() => {
        if (window.confirm('Удалить фото?')) {
            setUploadedImages([]);
        }
    }, []);

    const getImageDimsByUrl = useCallback((url: string): { width: number; height: number } | null => {
        const img = uploadedImages.find(i => i.url === url);
        if (img?.naturalWidth && img?.naturalHeight) {
            return { width: img.naturalWidth, height: img.naturalHeight };
        }
        return null;
    }, [uploadedImages]);

    return {
        uploadedImages,
        handleFileUpload,
        recalculateUsage,
        clearAll,
        getImageDimsByUrl,
    };
}
