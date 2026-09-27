export type ImageFormat = 'webp' | 'jpeg' | 'png';

export type FileStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ImageItem {
    id: string;
    file: File;
    previewUrl: string;
    thumbnailUrl: string;
    status: FileStatus;
    resultSize?: number;
}

export interface ProcessedImage {
    blob: Blob;
    name: string;
    originalSize: number;
    newSize: number;
}

export interface CompressionPreview {
    url: string;
    size: number;
    savedPercent: number;
}

export interface CompressionForecast {
    resultSize: number;
    savedSize: number;
}

export interface ConverterSettings {
    baseName: string;
    format: ImageFormat;
    quality: number;
    maxWidth: string;
    numbering: string;
}
