import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Zap, Download, Trash2 } from 'lucide-react';

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
    <div
        className={clsx(
            'export-settings__actions max-[1200px]:grid',
            'max-[1200px]:grid-cols-3',
            'max-[761px]:grid-cols-1 mt-6.25 flex flex-wrap justify-center gap-3'
        )}
    >
        <div className="w-full min-[1200px]:w-65 max-[1200px]:min-w-0 max-[1200px]:w-auto">
            <ActionButton primary disabled={converting} onClick={onConvert}>
                <Zap className="size-4 text-current" /> Перекодировать
            </ActionButton>
        </div>
        <div className="w-full min-[1200px]:w-65 max-[1200px]:min-w-0 max-[1200px]:w-auto">
            <ActionButton disabled={!canDownload || converting} onClick={onDownload}>
                <Download className="size-4 text-current" /> Скачать ZIP
            </ActionButton>
        </div>
        <div className="w-full min-[1200px]:w-65 max-[1200px]:min-w-0 max-[1200px]:w-auto">
            <ActionButton disabled={converting} onClick={onClear}>
                <Trash2 className="size-4 text-current" /> Очистить
            </ActionButton>
        </div>
    </div>
);

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    primary?: boolean;
}

const ActionButton = ({ children, primary = false, className, ...props }: ActionButtonProps) => (
    <button
        className={clsx('ui-button w-full', primary && 'ui-button--primary', className)}
        type="button"
        {...props}
    >
        {children}
    </button>
);
