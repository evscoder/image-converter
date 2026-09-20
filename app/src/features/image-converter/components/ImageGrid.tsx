import { formatBytes } from '../lib/imageProcessing';
import type { ImageItem } from '../types';

interface ImageGridProps {
    items: ImageItem[];
    selectedId: string | null;
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
}

export const ImageGrid = ({
    items,
    selectedId,
    onRemove,
    onSelect
}: ImageGridProps) => (
    <section className="mb-[30px]">
        <h2 className="mb-[15px] flex items-center gap-2.5 text-xl font-semibold">
            <span>🖼️</span>
            Все изображения
            <span className="text-sm font-normal text-slate-400">
                (наведите для удаления)
            </span>
        </h2>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[15px] max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
            {items.map(item => (
                <ImageCard
                    key={item.id}
                    item={item}
                    selected={item.id === selectedId}
                    onSelect={() => onSelect(item.id)}
                    onRemove={event => {
                        event.stopPropagation();
                        onRemove(item.id);
                    }}
                />
            ))}
        </div>
    </section>
);

interface ImageCardProps {
    item: ImageItem;
    selected: boolean;
    onSelect: () => void;
    onRemove: React.MouseEventHandler<HTMLButtonElement>;
}

const ImageCard = ({ item, selected, onSelect, onRemove }: ImageCardProps) => {
    const statusClassName = selected
        ? 'border-indigo-400'
        : getStatusClassName(item);

    return (
        <article
            className={`image-card group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-white/5 ${statusClassName} ${item.status === 'processing' ? 'is-processing' : ''}`}
            onClick={onSelect}
        >
            <button
                className="delete-btn absolute right-2.5 top-2.5 z-20 flex size-7 scale-80 items-center justify-center rounded-full border-0 bg-red-500 text-base text-white opacity-0 group-hover:scale-100 group-hover:opacity-100 max-md:scale-100 max-md:opacity-100"
                type="button"
                title="Удалить"
                onClick={onRemove}
            >
                ×
            </button>

            {item.status === 'done' && <DoneBadge />}

            <img
                className="block h-[70%] w-full object-cover"
                src={item.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
            />

            <ImageDetails item={item} />

            {item.status === 'processing' && <ProcessingOverlay />}
        </article>
    );
};

const ImageDetails = ({ item }: { item: ImageItem }) => (
    <div className="relative flex h-[30%] flex-col justify-center p-2.5">
        <div className="mb-1 truncate pr-[25px] text-xs font-medium">
            {item.file.name}
        </div>
        <div className="text-[.7rem] text-slate-400">
            {formatBytes(item.resultSize ?? item.file.size, 'KB')}
            {item.resultSize && (
                <span className="text-emerald-500">
                    {' '}(-{Math.round((1 - item.resultSize / item.file.size) * 100)}%)
                </span>
            )}
        </div>
    </div>
);

const DoneBadge = () => (
    <span className="done-badge absolute right-2.5 top-2.5 z-[5] flex size-7 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
        ✓
    </span>
);

const ProcessingOverlay = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f23]/90">
        <div className="mb-2.5 size-10 animate-spin rounded-full border-[3px] border-indigo-500/30 border-t-indigo-500" />
        <div className="text-sm font-medium text-indigo-500">
            Обработка...
        </div>
    </div>
);

const getStatusClassName = (item: ImageItem) => {
    if (item.status === 'done') return 'border-emerald-500';
    if (item.status === 'error') return 'border-red-500';
    return 'border-white/10 hover:border-indigo-500';
};
