import clsx from 'clsx';
import type { ReactNode } from 'react';

interface ProgressProps {
    current: number;
    total: number;
    message: ReactNode;
    complete: boolean;
}

export const Progress = ({ current, total, message, complete }: ProgressProps) => {
    const percent = total ? Math.round((current / total) * 100) : 0;
    return (
        <section className="conversion-progress my-[25px]">
            <div className="relative h-2 overflow-hidden rounded bg-zinc-800/10">
                <div
                    className="conversion-progress__fill h-full rounded bg-gradient-to-r from-teal-600 to-sky-700"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div
                className={clsx('mt-[15px] text-center font-medium', complete && 'text-emerald-500')}
            >
                {message}
            </div>

            <div className="mt-2.5 flex justify-center gap-10 text-sm text-zinc-400">
                <span>
                    {current} из {total}
                </span>
                <span>{percent}%</span>
            </div>
        </section>
    );
};
