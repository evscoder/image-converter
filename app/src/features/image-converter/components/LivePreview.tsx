import type { ReactNode } from 'react';
import { formatBytes } from '../lib/imageProcessing';
import type { CompressionForecast, CompressionPreview, ImageFormat, ImageItem } from '../types';

interface LivePreviewProps {
    first: ImageItem;
    preview: CompressionPreview | null;
    forecast: CompressionForecast | null;
    format: ImageFormat;
    totalBytes: number;
    count: number;
}

const previewPanelClassName = [
    'relative aspect-[16/10] overflow-hidden',
    'rounded-2xl bg-black/30'
].join(' ');

export const LivePreview = ({
    first,
    preview,
    forecast,
    format,
    totalBytes,
    count
}: LivePreviewProps) => {
    const resultSize = forecast?.resultSize ?? totalBytes;
    const savedSize = forecast?.savedSize ?? 0;
    const savedPercent = forecast && totalBytes
        ? (forecast.savedSize / totalBytes) * 100
        : 0;

    return (
        <section className="surface-panel mb-[30px] rounded-3xl border border-white/10 bg-white/5 p-[25px]">
            <h2 className="mb-[15px] flex items-center gap-2.5 text-xl font-semibold">
                <span>👁️</span>
                Предпросмотр сжатия
            </h2>

            <div className="mb-[15px] flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>
                    <strong className="text-slate-50">{first.file.name}</strong>
                </span>
                <span>Тип: {first.file.type || 'не определён'}</span>
                <span>Размер: {formatBytes(first.file.size, 'KB')}</span>
                <span>Формат на выходе: {format.toUpperCase()}</span>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <PreviewPanel
                    imageUrl={first.previewUrl}
                    imageAlt="Оригинал"
                    label="Оригинал"
                    size={formatBytes(first.file.size, 'KB')}
                />
                <PreviewPanel
                    imageUrl={preview?.url}
                    imageAlt="Сжатый"
                    label="Сжатый"
                    size={preview ? formatBytes(preview.size, 'KB') : '—'}
                    difference={getDifferenceLabel(preview, format)}
                    success={(preview?.savedPercent ?? 0) > 0}
                />
            </div>

            <CompressionForecast
                count={count}
                resultSize={resultSize}
                savedSize={savedSize}
                savedPercent={savedPercent}
            />
        </section>
    );
};

interface PreviewPanelProps {
    imageUrl?: string;
    imageAlt: string;
    label: string;
    size: string;
    difference?: string;
    success?: boolean;
}

const PreviewPanel = ({
    imageUrl,
    imageAlt,
    label,
    size,
    difference,
    success = false
}: PreviewPanelProps) => (
    <div className={previewPanelClassName}>
        {imageUrl && (
            <img
                className="h-full w-full object-contain"
                src={imageUrl}
                alt={imageAlt}
            />
        )}
        <PreviewBadge success={success}>{label}</PreviewBadge>
        <PreviewSize difference={difference} success={success}>
            {size}
        </PreviewSize>
    </div>
);

interface CompressionForecastProps {
    count: number;
    resultSize: number;
    savedSize: number;
    savedPercent: number;
}

const CompressionForecast = ({
    count,
    resultSize,
    savedSize,
    savedPercent
}: CompressionForecastProps) => {
    const isSmaller = savedPercent >= 0;

    return (
        <div className={`grid grid-cols-[1fr_auto_auto] items-center gap-[30px] rounded-2xl border p-5 max-md:grid-cols-1 max-md:gap-[15px] max-md:text-center ${
            isSmaller
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10'
                : 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/10'
        }`}>
        <div className="flex flex-col gap-[5px]">
            <div className="text-sm text-slate-400">
                📊 Прогноз для всех файлов
            </div>
            <div>
                <strong>{count}</strong> изображений
            </div>
            <div className="text-sm text-slate-400">
                {isSmaller ? 'Экономия' : 'Увеличение'} ≈ {formatBytes(Math.abs(savedSize), 'МБ')}
            </div>
        </div>

        <div className="border-r border-emerald-500/30 px-5 text-center max-md:border-r-0 max-md:border-b max-md:pb-[15px]">
            <div className="mb-[5px] text-xs uppercase text-slate-400">
                Итоговый размер
            </div>
            <div className="text-[1.8rem] font-extrabold">
                {formatBytes(resultSize, 'МБ')}
            </div>
        </div>

        <div className="min-w-[100px] text-center">
            <div className="mb-[5px] text-xs uppercase text-slate-400">
                {isSmaller ? 'Экономия' : 'Увеличение'}
            </div>
            <div className={`text-[2.5rem] font-extrabold ${isSmaller ? 'text-emerald-500' : 'text-amber-500'}`}>
                {Math.abs(Math.round(savedPercent))}%
            </div>
        </div>
        </div>
    );
};

const PreviewBadge = ({
    children,
    success = false
}: { children: ReactNode; success?: boolean }) => (
    <div
        className={`preview-label absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase ${
            success ? 'text-emerald-500' : ''
        }`}
    >
        {children}
    </div>
);

const PreviewSize = ({
    children,
    difference,
    success = false
}: { children: ReactNode; difference?: string; success?: boolean }) => (
    <div className="preview-stats absolute bottom-3 right-3 rounded-xl bg-black/70 px-4 py-2 text-right">
        <div className="text-lg font-bold">{children}</div>
        {difference && (
            <div className={`mt-0.5 text-xs ${
                success ? 'text-emerald-500' : 'text-amber-500'
            }`}
            >
                {difference}
            </div>
        )}
    </div>
);

const getDifferenceLabel = (
    preview: CompressionPreview | null,
    format: ImageFormat
) => {
    if (!preview) return format === 'png' ? 'Lossless' : '—';

    const sign = preview.savedPercent > 0 ? '-' : '+';
    return `${sign}${Math.abs(preview.savedPercent).toFixed(1)}%`;
};
