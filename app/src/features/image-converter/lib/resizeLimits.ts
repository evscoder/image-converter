import type { ImageItem } from '../types';

export const maxImageDimension = 8000;
export const maxImageScale = 4;

export const getMaximumScale = (items: Pick<ImageItem, 'width' | 'height'>[]) => {
    const largestSide = items.reduce(
        (largest, item) => Math.max(largest, item.width ?? 0, item.height ?? 0),
        0
    );
    const maximum = largestSide ? Math.min(maxImageScale, maxImageDimension / largestSide) : maxImageScale;

    // Round down so the displayed multiplier never exceeds the dimension limit.
    return Math.floor(maximum * 10000) / 10000;
};

export const clampWidth = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? String(Math.min(Number(digits), maxImageDimension)) : '';
};

export const clampScaleInput = (value: string, maximum: number) => {
    const normalized = value.trim().replace(',', '.');
    return Number(normalized) > maximum ? String(maximum) : value;
};
