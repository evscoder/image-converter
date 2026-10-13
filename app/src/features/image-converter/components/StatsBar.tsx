interface StatsBarProps {
    files: number;
    bytes: number;
    saved: number;
}

export const StatsBar = ({ files, bytes, saved }: StatsBarProps) => {
    const stats = [
        { value: files, label: 'Файлов' },
        { value: (bytes / 1024 / 1024).toFixed(1), label: 'МБ исходных' },
        { value: `${saved.toFixed(1)}%`, label: 'Экономия' }
    ];
    return (
        <section className="app-status__stats flex flex-wrap gap-6 ml-auto max-[761px]:gap-3">
            {stats.map(({ value, label }) => (
                <div className="app-status__stat flex items-baseline gap-[5px]" key={label}>
                    <div className="app-status__value text-[#bbb] text-[11px]">{value}</div>
                    <div className="text-[10px] leading-[1.4285714286] text-zinc-400">{label}</div>
                </div>
            ))}
        </section>
    );
};
