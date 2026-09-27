import type { ConverterSettings, ImageFormat } from '../../types';
import { ControlField, inputClassName } from './ControlField';

interface ConversionFieldsProps {
    settings: ConverterSettings;
    onChange: (next: Partial<ConverterSettings>) => void;
}

const formats: ImageFormat[] = ['webp', 'jpeg', 'png'];

export const ConversionFields = ({ settings, onChange }: ConversionFieldsProps) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 max-md:grid-cols-1">
        <ControlField label="Базовое имя">
            <input
                className={inputClassName}
                value={settings.baseName}
                placeholder="image"
                onChange={event => onChange({ baseName: event.target.value })}
            />
        </ControlField>

        <ControlField label="Формат">
            <div className="flex gap-2">
                {formats.map(format => (
                    <FormatButton
                        key={format}
                        format={format}
                        active={settings.format === format}
                        onClick={() => onChange({ format })}
                    />
                ))}
            </div>
        </ControlField>

        <ControlField
            label="Качество изображения (%)"
            disabled={settings.format === 'png'}
        >
            <div className="flex items-center gap-[15px]">
                <input
                    className="quality-range h-1.5 flex-1 accent-indigo-500"
                    type="range"
                    min="1"
                    max="100"
                    value={settings.quality}
                    onChange={event => onChange({
                        quality: Number(event.target.value)
                    })}
                />
                <span className="min-w-10 text-center text-lg font-bold text-indigo-500">
                    {settings.quality}
                </span>
            </div>
        </ControlField>

        <ControlField label="Макс. размер (px)">
            <input
                className={inputClassName}
                inputMode="numeric"
                value={settings.maxWidth}
                placeholder="Без изменений"
                onChange={event => onChange({
                    maxWidth: event.target.value.replace(/\D/g, '')
                })}
            />
        </ControlField>

        <ControlField label="Нумерация">
            <div className="relative">
                <select
                    className={`${inputClassName} w-full appearance-none pr-11 [color-scheme:dark]`}
                    value={settings.numbering}
                    onChange={event => onChange({ numbering: event.target.value })}
                >
                    <option className="bg-[#0f0f23] text-slate-50" value="001">001, 002...</option>
                    <option className="bg-[#0f0f23] text-slate-50" value="01">01, 02...</option>
                    <option className="bg-[#0f0f23] text-slate-50" value="1">1, 2...</option>
                </select>
                <span
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                    aria-hidden="true"
                >
                    ▼
                </span>
            </div>
        </ControlField>
    </div>
);

interface FormatButtonProps {
    format: ImageFormat;
    active: boolean;
    onClick: () => void;
}

const FormatButton = ({ format, active, onClick }: FormatButtonProps) => {
    const stateClassName = active
        ? 'border-transparent bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
        : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/10 hover:text-slate-50';

    return (
        <button
            className={`flex-1 rounded-[10px] border p-2.5 text-sm font-medium ${stateClassName}`}
            type="button"
            onClick={onClick}
        >
            {format.toUpperCase()}
        </button>
    );
};
