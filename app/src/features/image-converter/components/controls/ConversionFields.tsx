import clsx from 'clsx';
import { EditableSelect } from '../../../../shared/ui/EditableSelect/EditableSelect';
import type { ConverterSettings, ImageFormat, ImageItem } from '../../types';
import { clampScaleInput, clampWidth, getMaximumScale } from '../../lib/resizeLimits';
import { ControlField, inputClassName } from './ControlField';

interface ConversionFieldsProps {
    settings: ConverterSettings;
    items: ImageItem[];
    onChange: (next: Partial<ConverterSettings>) => void;
}

const scaleOptions = ['0.5', '0.75', '1', '2', '3', '4'];

const normalizeScale = (value: string, maximum: number) => {
    const normalized = value.trim().replace(',', '.');
    const number = Number(normalized);
    return /^\d*\.?\d+$/.test(normalized) && Number.isFinite(number) && number > 0
        ? String(Math.min(number, maximum))
        : null;
};

const formats: ImageFormat[] = ['webp', 'jpeg', 'png'];

export const ConversionFields = ({ settings, items, onChange }: ConversionFieldsProps) => {
    const maximumScale = getMaximumScale(items);
    const availableScales = Array.from(new Set([
        ...scaleOptions.filter(option => Number(option) <= maximumScale),
        String(maximumScale)
    ]));

    return (
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

            <div className="grid grid-cols-2 items-start gap-3">
                <ControlField label="Макс. ширина (px)">
                    <input
                        className={inputClassName}
                        inputMode="numeric"
                        value={settings.maxWidth}
                        placeholder="Без изменений"
                        onChange={(event) =>
                            onChange({
                                maxWidth: clampWidth(event.target.value)
                            })
                        }
                    />
                </ControlField>

                <ControlField label="Масштаб">
                    <EditableSelect
                        label="Масштаб"
                        value={settings.scale}
                        options={availableScales}
                        suffix="×"
                        errorMessage="Введите число больше 0"
                        normalize={(value) => normalizeScale(value, maximumScale)}
                        normalizeInput={(value) => clampScaleInput(value, maximumScale)}
                        onChange={(scale) => onChange({ scale })}
                    />
                </ControlField>
                <p className="col-span-2 text-xs text-zinc-400">
                    Используйте максимальную ширину или масштаб
                    <span className="block mt-1">
                        До 8000 px по каждой стороне · масштаб до {maximumScale}×
                    </span>
                </p>
            </div>
        </div>
    );
};

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
