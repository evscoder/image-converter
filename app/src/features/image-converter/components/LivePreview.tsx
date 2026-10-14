import clsx from 'clsx';
import { useState, type ReactEventHandler } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChartNoAxesColumnIncreasing,
    Eye,
    Image
} from 'lucide-react';
import { formatBytes } from '../lib/imageProcessing';
import type { CompressionForecast, CompressionPreview, ImageFormat, ImageItem } from '../types';

interface LivePreviewProps {
    first: ImageItem;
    preview: CompressionPreview | null;
    forecast: CompressionForecast | null;
    format: ImageFormat;
    totalBytes: number;
    count: number;
    forecastDeferred?: boolean;
}

export const LivePreview = ({
    first,
    preview,
    forecast,
    format,
    totalBytes,
    count,
    forecastDeferred = false
}: LivePreviewProps) => {
    const [dimensions, setDimensions] = useState<{ url: string; width: number; height: number } | null>(null);
    const imageDimensions = dimensions?.url === first.previewUrl
        ? `${dimensions.width} × ${dimensions.height}`
        : '—';
    const resultSize = forecast?.resultSize ?? totalBytes;
    const savedSize = forecast?.savedSize ?? 0;
    const savedPercent = forecast && totalBytes ? (forecast.savedSize / totalBytes) * 100 : 0;
    return (
        <section
            className={clsx(
                'ui-panel image-preview p-5 mb-5',
                '[background:linear-gradient(125deg,_#21333355,_transparent_55%),_#191a1c]',
                '[box-shadow:0_8px_24px_#00000016] max-[601px]:p-[14px]'
            )}
        >
            <header className="image-preview__heading flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-[9px] text-[18px] font-semibold text-[#e1edef]">
                        <Eye size={18} className="shrink-0 text-[#79cbbf]" /> Предпросмотр сжатия
                    </h2>
                </div>
                <span
                    className={clsx(
                        'image-preview__format p-[6px_9px] [border:1px_solid_#4c8d8859] rounded-[6px] [background:#3b9e8c1a]',
                        'text-[#8ee1ca] text-[14px] tracking-[0.6px]'
                    )}
                >
                    {format.toUpperCase()}
                </span>
            </header>

            <div
                className={clsx(
                    'image-preview__metadata flex items-center gap-3 m-[12px_0_20px]',
                    'overflow-x-auto whitespace-nowrap text-[14px] text-[#969da8]'
                )}
            >
                <span className="min-w-16 truncate text-[#afb4bd]" title={first.file.name}>
                    {first.file.name}
                </span>
                <span className="shrink-0">{first.file.type || 'Тип не определён'}</span>
                <span className="shrink-0">{formatBytes(first.file.size, 'KB')}</span>
                <span className="shrink-0" aria-label="Размер изображения">{imageDimensions}</span>
            </div>

            <div
                className={clsx(
                    'image-preview__grid grid grid-cols-2 gap-[14px]',
                    'max-[761px]:grid-cols-1'
                )}
            >
                <PreviewPanel
                    imageUrl={first.previewUrl}
                    onImageLoad={(event) => {
                        const image = event.currentTarget;
                        setDimensions({
                            url: first.previewUrl,
                            width: image.naturalWidth,
                            height: image.naturalHeight
                        });
                    }}
                    label="Оригинал"
                    caption="Исходное изображение"
                    size={formatBytes(first.file.size, 'KB')}
                />
                <PreviewPanel
                    imageUrl={preview?.url}
                    label="Сжатый"
                    caption={`Результат · ${format.toUpperCase()}`}
                    size={preview ? formatBytes(preview.size, 'KB') : '—'}
                    difference={getDifferenceLabel(preview, format)}
                    result
                    success={(preview?.savedPercent ?? 0) > 0}
                />
            </div>

            {forecastDeferred && !forecast ? (
                <p className="mt-[18px] text-[14px] text-[#a9b1b9]">
                    Итоговый вес всех файлов появится после нажатия «Перекодировать»
                </p>
            ) : (
                <CompressionForecast
                    count={count}
                    resultSize={resultSize}
                    savedSize={savedSize}
                    savedPercent={savedPercent}
                />
            )}
        </section>
    );
};

interface PreviewPanelProps {
    imageUrl?: string;
    onImageLoad?: ReactEventHandler<HTMLImageElement>;
    label: string;
    caption: string;
    size: string;
    difference?: string;
    result?: boolean;
    success?: boolean;
}

const PreviewPanel = ({
    imageUrl,
    onImageLoad,
    label,
    caption,
    size,
    difference,
    result = false,
    success = false
}: PreviewPanelProps) => (
    <div
        className={clsx(
            'preview-image overflow-hidden border rounded-[10px]',
            'bg-[var(--color-surface)]',
            result ? 'preview-image--result border-[#397969]' : 'border-[var(--color-border)]'
        )}
    >
        <div className="preview-image__heading flex items-center justify-between gap-2.5 p-[14px] text-[14px]">
            <span className="flex items-center gap-[7px] text-[#cdd0d7]">
                <span
                    className={clsx(
                        'preview-image__dot size-[6px] rounded-full',
                        result ? 'bg-[#63d4ae] shadow-[0_0_10px_#63d4ae40]' : 'bg-[#6c97b0]'
                    )}
                />{' '}
                {label}
            </span>
            {difference && (
                <span
                    className={clsx(
                        'preview-image__difference p-[3px_6px] rounded-[4px] text-[14px]',
                        success
                            ? 'preview-image__difference--positive bg-[#43a98e26] text-[#83dfb9]'
                            : 'preview-image__difference--warning text-[#dbc69a]'
                    )}
                >
                    {difference}
                </span>
            )}
        </div>
        <div
            className={clsx(
                'preview-image__canvas relative grid place-items-center aspect-[16_/_10] [background-color:#191a1c]',
                '[background-image:conic-gradient(#242629_25%,_#1d1f22_0_50%,_#242629_0_75%,_#1d1f22_0)]',
                '[background-size:20px_20px]'
            )}
        >
            {imageUrl ? (
                <img
                    className="absolute inset-0 size-full min-h-0 object-contain"
                    src={imageUrl}
                    alt={label}
                    onLoad={onImageLoad}
                />
            ) : (
                <div className="preview-image__pending flex flex-col items-center gap-3 text-[#a2a8b2] text-[14px]">
                    <Image size={28} strokeWidth={1.4} />
                    <span>Подготовка предпросмотра…</span>
                </div>
            )}
        </div>
        <div
            className={clsx(
                'preview-image__footer flex items-center justify-between gap-2.5 p-[14px] text-[14px]',
                '[border-top:1px_solid_#35383e] text-[#a2a8b2] text-[14px]'
            )}
        >
            <span>{caption}</span>
            <strong className="shrink-0 text-[15px] font-medium text-[#d9e8ed]">{size}</strong>
        </div>
    </div>
);

interface CompressionForecastProps {
    count: number;
    resultSize: number;
    savedSize: number;
    savedPercent: number;
}

const metricValueClassName = clsx(
    'flex items-center gap-1.5 text-[clamp(26px,2.5vw,32px)] font-[550]',
    'tracking-[-0.5px]'
);

const metricDividerClassName = clsx(
    'border-l border-[#547e7b40] pl-4',
    'max-[761px]:border-l-0 max-[761px]:border-t max-[761px]:pl-0 max-[761px]:pt-[14px]'
);

const CompressionForecast = ({
    count,
    resultSize,
    savedSize,
    savedPercent
}: CompressionForecastProps) => {
    const isSmaller = savedPercent >= 0;
    const TrendIcon = isSmaller ? ArrowDownRight : ArrowUpRight;
    return (
        <section
            className={clsx(
                'compression-estimate mt-[18px] p-4 border rounded-[10px]',
                '[background:linear-gradient(110deg,_#2a3d39,_#28343b_45%,_#24292f_85%)]',
                isSmaller ? 'border-[#3d756a80]' : 'compression-estimate--warning border-[#9c804766]'
            )}
        >
            <div
                className={clsx(
                    'compression-estimate__heading flex items-center justify-between flex-wrap gap-2.5 mb-5',
                    'text-[#afcfcb] text-[14px]'
                )}
            >
                <span className="flex items-center gap-2">
                    <ChartNoAxesColumnIncreasing size={17} /> Прогноз для всех файлов
                </span>
                <span className="compression-estimate__count text-[#a9b1b9] text-[14px]">
                    {count} изображений
                </span>
            </div>
            <div
                className={clsx(
                    'compression-estimate__metrics grid grid-cols-3',
                    '[overflow-wrap:anywhere] gap-4 max-[761px]:grid-cols-1',
                    'max-[761px]:gap-[14px]'
                )}
            >
                <div>
                    <span className="compression-estimate__label block mb-[8px] text-[14px] text-[#a9b1b9]">
                        Итоговый размер
                    </span>
                    <strong className={clsx(metricValueClassName, 'text-[#e1efec]')}>
                        {formatBytes(resultSize, 'МБ')}
                    </strong>
                </div>
                <div className={metricDividerClassName}>
                    <span className="compression-estimate__label block mb-[8px] text-[14px] text-[#a9b1b9]">
                        {isSmaller ? 'Экономия' : 'Увеличение'}
                    </span>
                    <strong
                        className={clsx(
                            'compression-estimate__trend',
                            metricValueClassName,
                            isSmaller ? 'text-[#79dbb1]' : 'text-[#e2be79]'
                        )}
                    >
                        <TrendIcon size={25} /> {Math.abs(Math.round(savedPercent))}%
                    </strong>
                </div>
                <div className={metricDividerClassName}>
                    <span className="compression-estimate__label block mb-[8px] text-[14px] text-[#a9b1b9]">
                        {isSmaller ? 'Меньше на' : 'Больше на'}
                    </span>
                    <strong className={clsx(metricValueClassName, 'text-[#e1efec]')}>
                        ≈ {formatBytes(Math.abs(savedSize), 'МБ')}
                    </strong>
                </div>
            </div>
        </section>
    );
};

const getDifferenceLabel = (preview: CompressionPreview | null, format: ImageFormat) => {
    if (!preview) {
        return format === 'png' ? 'Lossless' : '—';
    }
    const sign = preview.savedPercent > 0 ? '-' : '+';
    return `${sign}${Math.abs(preview.savedPercent).toFixed(1)}%`;
};
