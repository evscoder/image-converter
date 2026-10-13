import clsx from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { ImageUp } from 'lucide-react';

interface Props {
    onFiles: (files: FileList | File[]) => void;
    children?: (openFilePicker: () => void) => ReactNode;
}

const imageTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jfif: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    ico: 'image/x-icon',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    heic: 'image/heic',
    heif: 'image/heif'
};

export const UploadZone = ({ onFiles, children }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const desktop = isTauri();
    useEffect(() => {
        if (!desktop) return;
        let disposed = false;
        let unlisten: (() => void) | undefined;
        const subscribe = async () => {
            const [{ getCurrentWebview }, { readFile }] = await Promise.all([
                import('@tauri-apps/api/webview'),
                import('@tauri-apps/plugin-fs')
            ]);
            if (disposed) return;
            unlisten = await getCurrentWebview().onDragDropEvent(async ({ payload }) => {
                if (disposed) return;
                setDragging(payload.type === 'enter' || payload.type === 'over');
                if (payload.type !== 'drop') return;
                setError('');
                const files: File[] = [];
                let failed = 0;
                for (const path of payload.paths) {
                    const name = path.split(/[\\/]/).pop() || '';
                    const type = imageTypes[name.split('.').pop()?.toLowerCase() || ''];
                    if (!type) continue;
                    try {
                        const bytes = await readFile(path);
                        files.push(new File([new Uint8Array(bytes)], name, { type }));
                    } catch {
                        failed++;
                    }
                }
                if (disposed) return;
                if (files.length) onFiles(files);
                if (failed)
                    setError(
                        `Не удалось прочитать файлов: ${failed}. Попробуйте выбрать их нажатием.`
                    );
                else if (!files.length) setError('Перетащите файлы изображений, а не папку.');
            });
            if (disposed) unlisten();
        };
        void subscribe().catch(() => {
            if (!disposed) setError('Перетаскивание недоступно. Нажмите для выбора файлов.');
        });
        return () => {
            disposed = true;
            unlisten?.();
        };
    }, [desktop, onFiles]);
    const openFilePicker = () => inputRef.current?.click();
    return (
        <div className="md:px-0">
            <section
                aria-label="Загрузка изображений"
                className={clsx(
                    'file-upload mb-5 border border-dashed rounded-[12px] hover:border-[#689dd1]',
                    '[transition:border-color_150ms] relative overflow-hidden',
                    children
                        ? 'bg-[var(--color-surface)] p-4 md:p-6'
                        : 'text-center [background:radial-gradient(ellipse_at_50%_45%,_#2d45451a,_transparent_70%),_#191a1c]',
                    dragging ? 'file-upload--dragging border-[#689dd1]' : 'border-[#4d5970]'
                )}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setDragging(false);
                    }
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    if (!desktop) {
                        setError('');
                        onFiles(event.dataTransfer.files);
                    }
                }}
            >
                <div className="relative z-10">
                    {children ? (
                        children(openFilePicker)
                    ) : (
                        <button
                            type="button"
                            className={clsx(
                                'w-full min-h-[calc(100vh-225px)] cursor-pointer rounded-[8px] px-5 py-12',
                                'max-[1200px]:min-h-[360px] focus-visible:outline focus-visible:outline-2',
                                'focus-visible:outline-teal-400'
                            )}
                            onClick={openFilePicker}
                        >
                            <span
                                className={clsx(
                                    'file-upload__icon grid place-items-center m-[0_auto_24px] text-[#888] w-[88px] h-[88px]',
                                    '[border:1px_solid_#42777e66] rounded-[24px] [background:#26bbab14] mb-[15px] block text-[3.5rem]'
                                )}
                            >
                                <ImageUp
                                    className="inline size-[38px] text-[#83cecc]"
                                    strokeWidth={1.5}
                                />
                            </span>
                            <span className="mb-2 block text-[17px] font-medium">
                                Перетащите изображения сюда
                            </span>
                            <span className="block text-sm text-zinc-400">
                                или нажмите для выбора файлов
                            </span>
                        </button>
                    )}
                    {error && (
                        <div role="alert" className="mt-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                </div>
                <input
                    ref={inputRef}
                    className="hidden"
                    type="file"
                    multiple
                    accept="image/*"
                    aria-label="Выбрать изображения"
                    onChange={(event) => {
                        if (event.target.files?.length) {
                            setError('');
                            onFiles(event.target.files);
                        }
                        event.target.value = '';
                    }}
                />
            </section>
        </div>
    );
};
