import clsx from 'clsx';
import { AlertTriangle, CircleCheck, FolderBookmark, FolderOpen } from 'lucide-react';

interface OutputFolderProps {
    directory: string | null;
    error: string | null;
    onSelect: () => void;
}

const getDirectoryName = (directory: string) => directory.split(/[\\/]/).filter(Boolean).pop();

export const OutputFolder = ({ directory, error, onSelect }: OutputFolderProps) => {
    const statusClassName = error
        ? 'font-semibold text-amber-500'
        : directory
          ? 'font-semibold text-emerald-500'
          : 'text-zinc-400';
    const statusText = error
        ? error
        : directory
          ? `${getDirectoryName(directory)} (автосохранение)`
          : 'Папка не выбрана — будет скачивание ZIP';
    const StatusIcon =
        error || !directory ? (
            <AlertTriangle className="size-4 shrink-0 text-yellow-300" />
        ) : (
            <CircleCheck className="size-4 shrink-0 text-green-500" />
        );
    return (
        <div
            className={clsx(
                'export-folder mt-6 flex flex-col flex-wrap items-stretch gap-3 border-y border-[#424242] bg-transparent py-4',
                'max-[1200px]:flex-row max-[1200px]:items-center max-[1200px]:gap-5',
                'max-[761px]:flex-col max-[761px]:items-stretch'
            )}
        >
            <div className="min-w-0 flex-1">
                <div className="text-xs text-zinc-400 flex items-center gap-2 mb-3">
                    <FolderBookmark className="size-4 shrink-0" />
                    Автосохранение в папку
                </div>
                <div className={clsx('flex items-center gap-2 text-[.95rem]', statusClassName)}>
                    {StatusIcon}
                    <span className="[overflow-wrap:anywhere] text-[11px] max-[1200px]:text-[13px]">
                        {statusText}
                    </span>
                </div>
            </div>

            <button className="ui-button ui-button--folder" type="button" onClick={onSelect}>
                <FolderOpen className="size-4 shrink-0 text-current" />
                Выбрать папку
            </button>
        </div>
    );
};
