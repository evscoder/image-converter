import clsx from 'clsx';
import { Plus, Trash2 } from 'lucide-react';
import { formatBytes } from '../lib/imageProcessing';
import type { ImageItem } from '../types';

interface ImageGridProps {
    items: ImageItem[];
    selectedId: string | null;
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export const ImageGrid = ({ items, selectedId, onRemove, onSelect, onAdd }: ImageGridProps) => (
    <div>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">
                Все изображения <span className="text-zinc-400">({items.length})</span>
            </h2>
            <p className="text-sm text-zinc-400">Перетащите сюда ещё изображения</p>
        </div>

        <div className="file-list [--image-card-size:176px] min-w-0">
            <button
                type="button"
                onClick={onAdd}
                className={clsx(
                    'file-list__add mb-[14px] p-[4px_8px] mr-[auto] ml-[-8px] group flex cursor-pointer items-center',
                    'justify-center gap-2.5 border-0 bg-transparent text-sm font-semibold text-[#a4cdc4] transition-colors',
                    'hover:text-[#d6eee7] focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-teal-400'
                )}
                aria-label="Добавить изображения"
            >
                <span
                    className={clsx(
                        'file-list__add-icon border border-[#527e80] [background:var(--gradient-action)]',
                        'flex size-9 items-center justify-center rounded-full text-[#d6eee7]',
                        'transition-[transform,filter,box-shadow] group-hover:scale-105 group-hover:brightness-110',
                        'group-hover:shadow-[0_0_12px_#39756840]'
                    )}
                >
                    <Plus className="size-5" strokeWidth={2} />
                </span>
                <span>Добавить</span>
            </button>

            <div
                className={clsx(
                    'file-list__scroll min-w-0 flex-1 overflow-x-auto [overscroll-behavior-x:contain]',
                    '[scrollbar-width:thin] [scrollbar-color:var(--color-scrollbar)_var(--color-scrollbar-track)] rounded-[12px]'
                )}
                role="region"
                aria-label="Изображения, горизонтальная прокрутка"
                tabIndex={0}
            >
                <div
                    className={clsx(
                        'file-list__grid grid [grid-auto-flow:column]',
                        '[grid-template-rows:repeat(2,_var(--image-card-size))]',
                        '[grid-auto-columns:var(--image-card-size)] gap-3 w-[max-content] min-w-[100%] pb-[8px]',
                        'max-[641px]:[grid-template-rows:var(--image-card-size)] max-[641px]:gap-2.5',
                        items.length === 1 && 'file-list__grid--single [grid-template-rows:var(--image-card-size)]'
                    )}
                >
                    {items.map((item) => (
                        <ImageCard
                            key={item.id}
                            item={item}
                            selected={item.id === selectedId}
                            onSelect={() => onSelect(item.id)}
                            onRemove={(event) => {
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
    const statusClassName = selected ? 'border-teal-500' : getStatusClassName(item);
    return (
        <article
            className={clsx(
                'file-card rounded-[8px] [transition:border-color_150ms] group relative grid h-full min-h-0',
                'grid-rows-[minmax(0,1fr)_auto] cursor-pointer overflow-hidden rounded-2xl border bg-zinc-800',
                statusClassName,
                item.status === 'processing' && 'file-card--processing'
            )}
            onClick={onSelect}
        >
            <button
                className={clsx(
                    'file-card__remove max-[1200px]:[opacity:1] max-[1200px]:[transform:none] max-[1200px]:w-[32px]',
                    'max-[1200px]:h-[32px] absolute right-2.5 top-2.5 z-20 flex size-7 scale-80 items-center',
                    'justify-center rounded-full border border-[#536266] bg-[#263436]/95 text-[#d2dfdf] opacity-0',
                    'group-hover:scale-100 group-hover:opacity-100 max-md:scale-100 max-md:opacity-100'
                )}
                type="button"
                title="Удалить"
                aria-label={`Удалить ${item.file.name}`}
                onClick={onRemove}
            >
                <Trash2 className="size-3.5" strokeWidth={1.8} />
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
        <div className="text-[.7rem] text-zinc-400">
            {formatBytes(item.resultSize ?? item.file.size, 'KB')}
            {item.resultSize && (
                <span className="text-emerald-500">
                    {' '}
                    (-{Math.round((1 - item.resultSize / item.file.size) * 100)}%)
                </span>
            )}
        </div>
    </div>
);

const DoneBadge = () => (
    <span
        className={clsx(
            'file-card__complete absolute right-2.5 top-2.5 z-[5] flex size-7 items-center justify-center',
            'rounded-full border border-[#6a9698] font-bold text-[#d6eee7]',
            '[background:linear-gradient(110deg,_#488676,_#426f8c)]'
        )}
    >
        ✓
    </span>
);

const ProcessingOverlay = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90">
        <div className="mb-2.5 size-10 animate-spin rounded-full border-[3px] border-teal-500/30 border-t-indigo-500" />
        <div className="text-sm font-medium text-teal-300">Обработка...</div>
    </div>
);

const getStatusClassName = (item: ImageItem) => {
    if (item.status === 'done') return 'border-[#6a9698]';
    if (item.status === 'error') return 'border-red-500';
    return 'border-zinc-700 hover:border-teal-500';
};
