import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { ImageUp } from 'lucide-react';

interface Props {
    onFiles: (files: FileList | File[]) => void;
    children?: (openFilePicker: () => void) => ReactNode;
}

const imageTypes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg',
    png: 'image/png', webp: 'image/webp', gif: 'image/gif',
    bmp: 'image/bmp', svg: 'image/svg+xml', avif: 'image/avif',
    ico: 'image/x-icon', tif: 'image/tiff', tiff: 'image/tiff',
    heic: 'image/heic', heif: 'image/heif'
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

    const openFilePicker = () => inputRef.current?.click();

    return (
        <div className="px-3 md:px-0">
            <section
              aria-label="Загрузка изображений"
              className={`upload-zone relative mb-[30px] overflow-hidden rounded-3xl border-2 border-dashed ${children ? 'p-4 md:p-6' : 'text-center'} ${dragging ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/5'}`}
              onDragOver={event => {
                  event.preventDefault();
                  setDragging(true);
              }}
              onDragLeave={event => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDragging(false);
                  }
              }}
              onDrop={event => {
                  event.preventDefault();
                  setDragging(false);
                  if (!desktop) {
                      setError('');
                      onFiles(event.dataTransfer.files);
                  }
              }}
            >
                <div className="relative z-10">
                    {children ? children(openFilePicker) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer rounded-3xl px-6 py-[60px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                        onClick={openFilePicker}
                      >
                        <span className="upload-icon mb-[15px] block text-[3.5rem]">
                            <ImageUp className="inline size-16 text-violet-400" strokeWidth={1.5} />
                        </span>
                          <span className="mb-2 block text-[1.3rem] font-semibold">
                            Перетащите изображения сюда
                        </span>
                          <span className="block text-sm text-slate-400">
                            или нажмите для выбора файлов
                        </span>
                      </button>
                    )}
                    {error && <div role="alert" className="mt-3 text-sm text-red-400">{error}</div>}
                </div>
                <input
                  ref={inputRef}
                  className="hidden"
                  type="file"
                  multiple
                  accept="image/*"
                  aria-label="Выбрать изображения"
                  onChange={event => {
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
