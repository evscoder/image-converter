import { Plus } from 'lucide-react';
import './ImageGrid.css';
import { formatBytes } from '../lib/imageProcessing';
import type { ImageItem } from '../types';

interface ImageGridProps {
    items: ImageItem[];
    selectedId: string | null;
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export const ImageGrid = ({
    items,
    selectedId,
    onRemove,
    onSelect,
    onAdd
}: ImageGridProps) => (
    <div>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">
                Все изображения <span className="text-slate-400">({items.length})</span>
            </h2>
            <p className="text-sm text-slate-400">Перетащите сюда ещё изображения</p>
        </div>

        <div className="image-gallery">
            <button
                type="button"
                onClick={onAdd}
                className="image-gallery-add group flex cursor-pointer items-center justify-center gap-2.5 border-0 bg-transparent text-sm font-semibold text-violet-200 transition-colors hover:text-violet-100 focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                aria-label="Добавить изображения"
            >
                <span className="image-gallery-add-icon flex size-9 items-center justify-center rounded-full transition-transform group-hover:scale-105">
                    <Plus className="size-5" strokeWidth={2} />
                </span>
                <span>Добавить</span>
            </button>

            <div
                className="image-gallery-scroll"
                role="region"
                aria-label="Изображения, горизонтальная прокрутка"
                tabIndex={0}
            >
                <div className={`image-gallery-grid ${items.length === 1 ? 'image-gallery-grid-single' : ''}`}>
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
            </div>
        </div>
    </div>
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
            className={`image-card group relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] cursor-pointer overflow-hidden rounded-2xl border bg-white/5 ${statusClassName} ${item.status === 'processing' ? 'is-processing' : ''}`}
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
                className="block h-full min-h-0 w-full object-cover"
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
    <div className="relative min-w-0 px-2.5 py-2">
        <div className="mb-1 truncate text-xs font-medium" title={item.file.name}>
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
