import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ActionButtonsProps {
    converting: boolean;
    canDownload: boolean;
    onConvert: () => void;
    onDownload: () => void;
    onClear: () => void;
}

export const ActionButtons = ({
    converting,
    canDownload,
    onConvert,
    onDownload,
    onClear
}: ActionButtonsProps) => (
    <div className="mt-[25px] flex flex-wrap justify-center gap-3">
        <ActionButton primary disabled={converting} onClick={onConvert}>
            ⚡ Перекодировать
        </ActionButton>
        <ActionButton
            disabled={!canDownload || converting}
            onClick={onDownload}
        >
            ⬇️ Скачать ZIP
        </ActionButton>
        <ActionButton disabled={converting} onClick={onClear}>
            🗑️ Очистить
        </ActionButton>
    </div>
);

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    primary?: boolean;
}

const ActionButton = ({
    children,
    primary = false,
    ...props
}: ActionButtonProps) => {
    const colorClassName = primary
        ? 'action-btn-primary bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
        : 'border border-white/10 bg-white/5 text-slate-50 hover:bg-white/10';

    return (
        <button
            className={`action-btn rounded-xl px-8 py-3.5 text-[.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${colorClassName}`}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
};
