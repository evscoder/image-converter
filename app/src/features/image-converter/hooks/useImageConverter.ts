import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { createImageThumbnail, mapWithConcurrency, processImage } from '../lib/imageProcessing';
import type { CompressionForecast, CompressionPreview, ConverterSettings, ImageItem, ProcessedImage } from '../types';

const initialSettings: ConverterSettings = { baseName: 'image', format: 'webp', quality: 85, maxWidth: '', numbering: '001' };
const processingConcurrency = 2;
const forecastConcurrency = 1;
const previewDelay = 200;
const forecastDelay = 600;

interface ImageProcessingResult {
    blob: Blob;
    size: number;
}

type EncodingSettings = Pick<ConverterSettings, 'format' | 'quality' | 'maxWidth'>;

interface BrowserWritableFile {
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
}

interface BrowserDirectoryHandle {
    name: string;
    getFileHandle: (name: string, options: { create: boolean }) => Promise<{
        createWritable: () => Promise<BrowserWritableFile>;
    }>;
}

type ConverterWindow = Window & typeof globalThis & {
    __TAURI_INTERNALS__?: unknown;
    showDirectoryPicker?: () => Promise<BrowserDirectoryHandle>;
};

export const useImageConverter = () => {
    const [items, setItems] = useState<ImageItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [settings, setSettings] = useState(initialSettings);
    const [preview, setPreview] = useState<CompressionPreview | null>(null);
    const [forecast, setForecast] = useState<CompressionForecast | null>(null);
    const [processed, setProcessed] = useState<ProcessedImage[]>([]);
    const [outputDirectory, setOutputDirectory] = useState<string | null>(null);
    const [outputDirectoryError, setOutputDirectoryError] = useState<string | null>(null);
    const [browserDirectory, setBrowserDirectory] = useState<BrowserDirectoryHandle | null>(null);
    const [progress, setProgress] = useState({ visible: false, current: 0, message: 'Обработка...', complete: false });
    const processingCache = useRef(new Map<string, Promise<ImageProcessingResult>>());
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const totalBytes = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items]);
    const fileSetKey = useMemo(() => items.map(item => item.id).join('|'), [items]);
    const encodingSettings = useMemo<EncodingSettings>(() => ({
        format: settings.format,
        quality: settings.quality,
        maxWidth: settings.maxWidth
    }), [settings.format, settings.quality, settings.maxWidth]);
    const selectedItem = useMemo(
        () => items.find(item => item.id === selectedId) ?? items[0],
        [items, selectedId]
    );
    const savedPercent = processed.length && totalBytes ? (1 - processed.reduce((sum, file) => sum + file.newSize, 0) / totalBytes) * 100 : 0;

    const getProcessedImage = useCallback((item: ImageItem, currentSettings: EncodingSettings) => {
        const maxWidth = Number(currentSettings.maxWidth) || null;
        const key = `${item.id}:${currentSettings.format}:${currentSettings.quality}:${maxWidth ?? 'original'}`;
        const cached = processingCache.current.get(key);
        if (cached) return cached;

        const pending = processImage(item.file, currentSettings.format, currentSettings.quality, maxWidth)
            .catch(error => {
                processingCache.current.delete(key);
                throw error;
            });
        processingCache.current.set(key, pending);
        return pending;
    }, []);

    const addFiles = useCallback(async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
        const next = await mapWithConcurrency(files, processingConcurrency, async file => {
            const previewUrl = URL.createObjectURL(file);
            let thumbnailUrl = previewUrl;
            try {
                thumbnailUrl = URL.createObjectURL(await createImageThumbnail(file));
            } catch { /* The original remains available for formats unsupported by canvas. */ }

            return {
                id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
                file,
                previewUrl,
                thumbnailUrl,
                status: 'idle' as const
            };
        });
        setItems(current => [...current, ...next]);
        setSelectedId(current => current ?? next[0]?.id ?? null);
        setProcessed([]);
    }, []);

    const removeFile = useCallback((id: string) => {
        setItems(current => {
            const removed = current.find(item => item.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
                if (removed.thumbnailUrl !== removed.previewUrl) URL.revokeObjectURL(removed.thumbnailUrl);
                for (const key of processingCache.current.keys()) {
                    if (key.startsWith(`${removed.id}:`)) processingCache.current.delete(key);
                }
            }
            const remaining = current.filter(item => item.id !== id);

            if (id === selectedId) {
                setSelectedId(remaining[0]?.id ?? null);
            }

            return remaining;
        });
        setProcessed([]);
    }, [selectedId]);

    useEffect(() => {
        const sourceItems = itemsRef.current;
        if (!sourceItems.length) {
            setForecast(null);
            return;
        }

        let cancelled = false;
        setForecast(null);
        const timeout = window.setTimeout(async () => {
            try {
                const results = await mapWithConcurrency(
                    sourceItems,
                    forecastConcurrency,
                    item => getProcessedImage(item, encodingSettings)
                );
                if (cancelled) return;
                const resultTotal = results.reduce((sum, entry) => sum + entry.size, 0);
                setForecast({ resultSize: resultTotal, savedSize: totalBytes - resultTotal });
            } catch {
                if (!cancelled) setForecast(null);
            }
        }, forecastDelay);
        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [encodingSettings, fileSetKey, getProcessedImage, totalBytes]);

    useEffect(() => {
        const item = itemsRef.current.find(entry => entry.id === selectedId) ?? itemsRef.current[0];
        if (!item) {
            setPreview(current => {
                if (current) URL.revokeObjectURL(current.url);
                return null;
            });
            return;
        }

        let cancelled = false;
        setPreview(current => {
            if (current) URL.revokeObjectURL(current.url);
            return null;
        });
        const timeout = window.setTimeout(() => {
            void getProcessedImage(item, encodingSettings).then(result => {
                if (cancelled) return;
                setPreview(current => {
                    if (current) URL.revokeObjectURL(current.url);
                    return {
                        url: URL.createObjectURL(result.blob),
                        size: result.size,
                        savedPercent: (1 - result.size / item.file.size) * 100
                    };
                });
            }).catch(() => {
                if (!cancelled) setPreview(null);
            });
        }, previewDelay);

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [encodingSettings, fileSetKey, getProcessedImage, selectedId]);

    const updateSettings = useCallback((next: Partial<ConverterSettings>) => {
        setSettings(current => {
            const updated = { ...current, ...next };
            if (updated.quality !== current.quality || updated.maxWidth !== current.maxWidth) {
                processingCache.current.clear();
            }
            return updated;
        });
        setProcessed([]);
    }, []);

    const selectFolder = async () => {
        const converterWindow = window as ConverterWindow;

        try {
            if (converterWindow.__TAURI_INTERNALS__) {
                const { open } = await import('@tauri-apps/plugin-dialog');
                const selected = await open({ directory: true, multiple: false, title: 'Выберите папку для изображений' });
                if (typeof selected === 'string') {
                    setBrowserDirectory(null);
                    setOutputDirectory(selected);
                    setOutputDirectoryError(null);
                }
                return;
            }

            if (!converterWindow.showDirectoryPicker) {
                setOutputDirectoryError('Выбор папки не поддерживается этим браузером — используйте ZIP');
                return;
            }

            const directory = await converterWindow.showDirectoryPicker();
            setBrowserDirectory(directory);
            setOutputDirectory(directory.name);
            setOutputDirectoryError(null);
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                setOutputDirectoryError('Не удалось получить доступ к папке');
            }
        }
    };

    const convert = async () => {
        if (!items.length) return;
        setProgress({ visible: true, current: 0, message: 'Обработка...', complete: false });
        setProcessed([]);
        let completed = 0;
        const converted = await mapWithConcurrency(items, processingConcurrency, async (item, index) => {
            setItems(current => current.map(entry => (
                entry.id === item.id ? { ...entry, status: 'processing' } : entry
            )));

            try {
                const result = await getProcessedImage(item, settings);
                const extension = settings.format === 'jpeg' ? 'jpg' : settings.format;
                const fileNumber = String(index + 1).padStart(settings.numbering.length, '0');
                setItems(current => current.map(entry => entry.id === item.id ? { ...entry, status: 'done', resultSize: result.size } : entry));
                return { blob: result.blob, name: `${settings.baseName || 'image'}_${fileNumber}.${extension}`, originalSize: item.file.size, newSize: result.size };
            } catch {
                setItems(current => current.map(entry => entry.id === item.id ? { ...entry, status: 'error' } : entry));
                return null;
            } finally {
                completed++;
                setProgress(current => ({ ...current, current: completed }));
            }
        });
        const results = converted.filter((file): file is ProcessedImage => file !== null);
        setProcessed(results);

        if (browserDirectory) {
            let saved = 0;
            try {
                for (const file of results) {
                    const fileHandle = await browserDirectory.getFileHandle(file.name, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(file.blob);
                    await writable.close();
                    saved++;
                }
                setProgress({ visible: true, current: items.length, message: `✅ Готово! Сохранено ${saved} файлов в папку`, complete: true });
                return;
            } catch {
                setOutputDirectoryError('Браузер не дал записать файлы — доступен ZIP');
            }
        } else if (outputDirectory) {
            let saved = 0;
            try {
                const [{ writeFile }, { join }] = await Promise.all([import('@tauri-apps/plugin-fs'), import('@tauri-apps/api/path')]);
                for (const file of results) { await writeFile(await join(outputDirectory, file.name), new Uint8Array(await file.blob.arrayBuffer())); saved++; }
                setProgress({ visible: true, current: items.length, message: `✅ Готово! Сохранено ${saved} файлов в папку`, complete: true });
                return;
            } catch { /* ZIP remains available when desktop saving fails. */ }
        }
        const original = results.reduce((sum, file) => sum + file.originalSize, 0);
        const result = results.reduce((sum, file) => sum + file.newSize, 0);
        const saved = original ? (1 - result / original) * 100 : 0;
        const sizeMessage = saved >= 0
            ? `Сэкономлено ${saved.toFixed(1)}%`
            : `Размер увеличился на ${Math.abs(saved).toFixed(1)}%`;
        setProgress({ visible: true, current: items.length, message: `✨ Готово! ${sizeMessage}`, complete: true });
    };

    const download = async () => {
        if (!processed.length) return;
        const zip = new JSZip();
        processed.forEach(file => zip.file(file.name, file.blob));
        const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        try {
            const [{ save }, { writeFile }] = await Promise.all([import('@tauri-apps/plugin-dialog'), import('@tauri-apps/plugin-fs')]);
            const target = await save({ title: 'Сохранить архив', defaultPath: 'ImageMAG_images.zip', filters: [{ name: 'ZIP архив', extensions: ['zip'] }] });
            if (target) await writeFile(target, new Uint8Array(await content.arrayBuffer()));
        } catch {
            const link = document.createElement('a'); link.href = URL.createObjectURL(content); link.download = 'ImageMAG_images.zip'; link.click(); URL.revokeObjectURL(link.href);
        }
    };

    const clear = () => {
        items.forEach(item => {
            URL.revokeObjectURL(item.previewUrl);
            if (item.thumbnailUrl !== item.previewUrl) URL.revokeObjectURL(item.thumbnailUrl);
        });
        if (preview) URL.revokeObjectURL(preview.url);
        processingCache.current.clear();
        setItems([]); setSelectedId(null); setPreview(null); setForecast(null); setProcessed([]); setOutputDirectory(null); setOutputDirectoryError(null); setBrowserDirectory(null); setProgress({ visible: false, current: 0, message: 'Обработка...', complete: false });
    };

    return { items, selectedItem, selectedId, settings, preview, forecast, processed, outputDirectory, outputDirectoryError, progress, totalBytes, savedPercent, addFiles, removeFile, selectItem: setSelectedId, updateSettings, selectFolder, convert, download, clear };
};
