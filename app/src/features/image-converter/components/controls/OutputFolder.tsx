interface OutputFolderProps {
    directory: string | null;
    error: string | null;
    onSelect: () => void;
}

const getDirectoryName = (directory: string) => (
    directory.split(/[\\/]/).filter(Boolean).pop()
);

export const OutputFolder = ({ directory, error, onSelect }: OutputFolderProps) => {
    const statusClassName = error
        ? 'font-semibold text-amber-500'
        : directory
        ? 'font-semibold text-emerald-500'
        : 'text-slate-400';
    const statusText = error
        ? `⚠️ ${error}`
        : directory
        ? `✅ ${getDirectoryName(directory)} (автосохранение)`
        : '⚠️ Папка не выбрана — будет скачивание ZIP';

    return (
        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 max-md:flex-col max-md:items-stretch">
            <div className="min-w-[200px] flex-1">
                <div className="mb-[5px] text-xs text-slate-400">
                    📁 Автосохранение в папку
                </div>
                <div className={`flex items-center gap-2 text-[.95rem] ${statusClassName}`}>
                    {statusText}
                </div>
            </div>

            <button
                className="folder-btn rounded-[10px] border border-emerald-500/30 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/30"
                type="button"
                onClick={onSelect}
            >
                📂 Выбрать папку
            </button>
        </div>
    );
};
