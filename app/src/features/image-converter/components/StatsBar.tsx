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
        <section className="mb-[25px] flex flex-wrap justify-center gap-[50px] max-md:gap-[25px]">
            {stats.map(({ value, label }) => (
            <div className="text-center" key={label}>
                <div className="bg-gradient-to-br from-indigo-500 to-pink-500 bg-clip-text text-[2rem] font-extrabold text-transparent">
                    {value}
                </div>
                <div className="mt-[5px] text-sm text-slate-400">
                    {label}
                </div>
            </div>
            ))}
        </section>
    );
};
