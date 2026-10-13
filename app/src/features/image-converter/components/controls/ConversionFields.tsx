import clsx from 'clsx';
import type { ConverterSettings, ImageFormat } from '../../types';
import { ControlField, inputClassName } from './ControlField';

interface ConversionFieldsProps {
    settings: ConverterSettings;
    onChange: (next: Partial<ConverterSettings>) => void;
}

const formats: ImageFormat[] = ['webp', 'jpeg', 'png'];

export const ConversionFields = ({ settings, onChange }: ConversionFieldsProps) => (
    <div
        className={clsx(
            'export-settings__fields gap-[18px] max-[1200px]:grid-cols-2',
            'max-[1200px]:gap-6 max-[761px]:grid-cols-1 max-[761px]:gap-[18px]',
            'grid gap-5'
        )}
    >
        <ControlField label="Формат">
            <div className="flex gap-2">
                {formats.map((format) => (
                    <FormatButton
                        key={format}
                        format={format}
                        active={settings.format === format}
                        onClick={() => onChange({ format })}
                    />
                ))}
            </div>
        </ControlField>

        <ControlField label="Качество изображения (%)" disabled={settings.format === 'png'}>
            <div className="flex items-center gap-[15px]">
                <input
                    className="ui-range h-1.5 flex-1 accent-teal-400"
                    type="range"
                    min="1"
                    max="100"
                    value={settings.quality}
                    onChange={(event) =>
                        onChange({
                            quality: Number(event.target.value)
                        })
                    }
                />
                <span className="min-w-10 text-center text-lg font-bold text-teal-300">
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
                onChange={(event) =>
                    onChange({
                        maxWidth: event.target.value.replace(/\D/g, '')
                    })
                }
            />
        </ControlField>
    </div>
);

interface FormatButtonProps {
    format: ImageFormat;
    active: boolean;
    onClick: () => void;
}

const FormatButton = ({ format, active, onClick }: FormatButtonProps) => (
    <button
        className={clsx('ui-button ui-button--format flex-1', active && 'ui-button--format-active')}
        type="button"
        onClick={onClick}
    >
        {format.toUpperCase()}
    </button>
);
