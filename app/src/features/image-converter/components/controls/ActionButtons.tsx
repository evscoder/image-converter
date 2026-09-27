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
    <div className="mt-6.25 flex flex-wrap justify-center gap-3">
      <div className={'w-full md:w-65'}>
        <ActionButton primary disabled={converting} onClick={onConvert}>
          <Zap className={'text-yellow-200'} /> Перекодировать
        </ActionButton>
      </div>
      <div className={'w-full md:w-65'}>
        <ActionButton
          disabled={!canDownload || converting}
          onClick={onDownload}
        >
          <Download className={'text-emerald-400'} /> Скачать ZIP
        </ActionButton>
      </div>
      <div className={'w-full md:w-65'}>
        <ActionButton disabled={converting} onClick={onClear}>
          <Trash2 className="text-red-500" /> Очистить
        </ActionButton>
      </div>
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
            className={`action-btn inline-flex w-full justify-center items-center gap-3 rounded-xl px-8 py-3.5 text-[.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${colorClassName}`}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
};
