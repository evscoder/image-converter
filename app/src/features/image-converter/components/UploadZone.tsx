import { useEffect, useRef, useState } from 'react';
import { isTauri } from '@tauri-apps/api/core';

interface Props { onFiles: (files: FileList | File[]) => void; }

const imageTypes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg',
    png: 'image/png', webp: 'image/webp', gif: 'image/gif',
    bmp: 'image/bmp', svg: 'image/svg+xml', avif: 'image/avif',
    ico: 'image/x-icon', tif: 'image/tiff', tiff: 'image/tiff',
    heic: 'image/heic', heif: 'image/heif'
};

export const UploadZone = ({ onFiles }: Props) => {
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
                if (failed) setError(`Не удалось прочитать файлов: ${failed}. Попробуйте выбрать их нажатием.`);
                else if (!files.length) setError('Перетащите файлы изображений, а не папку.');
            });
            if (disposed) unlisten();
        };

        void subscribe().catch(() => {
            if (!disposed) setError('Перетаскивание недоступно. Нажмите для выбора файлов.');
        });
        return () => { disposed = true; unlisten?.(); };
    }, [desktop, onFiles]);

    return (
        <div
            className={`upload-zone relative mb-[30px] cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed px-10 py-[60px] text-center ${dragging ? 'scale-[1.02] border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/5'}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={event => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={event => { event.preventDefault(); setDragging(false); if (!desktop) { setError(''); onFiles(event.dataTransfer.files); } }}
        >
            <div className="relative z-10">
                <span className="upload-icon mb-[15px] block text-[3.5rem]">🖼️</span>
                <div className="mb-2 text-[1.3rem] font-semibold">Перетащите изображения сюда</div>
                <div className="text-sm text-slate-400">или нажмите для выбора файлов</div>
                {error && <div role="alert" className="mt-3 text-sm text-red-400">{error}</div>}
            </div>
            <input ref={inputRef} className="hidden" type="file" multiple accept="image/*" onChange={event => event.target.files && onFiles(event.target.files)} />
        </div>
    );
};
