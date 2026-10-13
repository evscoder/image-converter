import type { ImageFormat } from '../types';

export const formatBytes = (bytes: number, unit: 'KB' | 'МБ') => {
    const divisor = unit === 'KB' ? 1024 : 1024 * 1024;
    const digits = unit === 'KB' ? 1 : 2;
    return `${(bytes / divisor).toFixed(digits)} ${unit}`;
};

export const processImage = (
    file: File,
    format: ImageFormat,
    quality: number,
    maxWidth: number | null
): Promise<{ blob: Blob; size: number }> => {
    const converterWindow = window as Window & typeof globalThis & { __TAURI_INTERNALS__?: unknown };
    if (converterWindow.__TAURI_INTERNALS__ && format !== 'jpeg') {
        return processImageNatively(file, format, quality, maxWidth);
    }
    return processImageInCanvas(file, format, quality, maxWidth);
};

const processImageNatively = async (
    file: File,
    format: ImageFormat,
    quality: number,
    maxWidth: number | null
) => {
    const { invoke } = await import('@tauri-apps/api/core');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const output = await invoke<ArrayBuffer>('process_image', bytes, {
        headers: {
            format,
            quality: String(Math.round(quality)),
            'max-width': String(maxWidth ?? 0)
        }
    });
    const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
    const blob = new Blob([new Uint8Array(output)], { type: mime });
    return { blob, size: blob.size };
};

const processImageInCanvas = (
    file: File,
    format: ImageFormat,
    quality: number,
    maxWidth: number | null
): Promise<{ blob: Blob; size: number }> => new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);

    image.onload = () => {
        URL.revokeObjectURL(sourceUrl);
        let width = image.width;
        let height = image.height;

        if (maxWidth && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) {
            reject(new Error('Canvas is unavailable'));
            return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);

        const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
        canvas.toBlob(blob => {
            if (blob?.type === mime) resolve({ blob, size: blob.size });
            else if (blob) reject(new Error(`${mime} encoding is unavailable`));
            else reject(new Error('Image conversion failed'));
        }, mime, format === 'png' ? undefined : quality / 100);
    };

    image.onerror = error => {
        URL.revokeObjectURL(sourceUrl);
        reject(error);
    };
    image.src = sourceUrl;
});

export const createImageThumbnail = (
    file: File,
    maxDimension = 400
): Promise<Blob> => new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);

    image.onload = () => {
        URL.revokeObjectURL(sourceUrl);
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');

        if (!context) {
            reject(new Error('Canvas is unavailable'));
            return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Thumbnail creation failed'));
        }, 'image/jpeg', 0.75);
    };

    image.onerror = error => {
        URL.revokeObjectURL(sourceUrl);
        reject(error);
    };
    image.src = sourceUrl;
});

export const mapWithConcurrency = async <Input, Output>(
    values: Input[],
    concurrency: number,
    mapper: (value: Input, index: number) => Promise<Output>
): Promise<Output[]> => {
    const results = new Array<Output>(values.length);
    let nextIndex = 0;

    const worker = async () => {
        while (nextIndex < values.length) {
            const index = nextIndex++;
            results[index] = await mapper(values[index], index);
        }
    };

    const workerCount = Math.min(Math.max(1, concurrency), values.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    return results;
};
