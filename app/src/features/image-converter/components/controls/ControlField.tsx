import type { ReactNode } from 'react';

interface ControlFieldProps {
    label: string;
    children: ReactNode;
    disabled?: boolean;
}

export const inputClassName = [
    'rounded-xl border border-white/10 bg-black/30 px-4 py-3',
    'text-sm text-slate-50 outline-none',
    'focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20'
].join(' ');

export const ControlField = ({
    label,
    children,
    disabled = false
}: ControlFieldProps) => (
    <label
        className={`flex flex-col gap-2 ${
            disabled ? 'pointer-events-none opacity-30' : ''
        }`}
    >
        <span className="text-xs font-semibold uppercase tracking-[.05em] text-slate-400">
            {label}
        </span>
        {children}
    </label>
);
