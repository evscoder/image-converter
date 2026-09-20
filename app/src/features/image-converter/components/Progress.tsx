interface ProgressProps {
    current: number;
    total: number;
    message: string;
    complete: boolean;
}

export const Progress = ({
    current,
    total,
    message,
    complete
}: ProgressProps) => {
    const percent = total ? Math.round((current / total) * 100) : 0;

    return (
        <section className="progress-panel my-[25px]">
            <div className="relative h-2 overflow-hidden rounded bg-white/10">
                <div
                    className="progress-fill h-full rounded bg-gradient-to-r from-indigo-500 to-pink-500"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div
                className={`mt-[15px] text-center font-medium ${
                    complete ? 'text-emerald-500' : ''
                }`}
            >
                {message}
            </div>

            <div className="mt-2.5 flex justify-center gap-10 text-sm text-slate-400">
                <span>{current} из {total}</span>
                <span>{percent}%</span>
            </div>
        </section>
    );
};
