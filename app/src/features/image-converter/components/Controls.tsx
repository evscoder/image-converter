import clsx from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import type { ConverterSettings, ImageItem } from '../types';
import { ActionButtons } from './controls/ActionButtons';
import { ConversionFields } from './controls/ConversionFields';
import { FilenameSettings } from './controls/FilenameSettings';
import { OutputFolder } from './controls/OutputFolder';

interface ControlsProps {
    items: ImageItem[];
    settings: ConverterSettings;
    outputDirectory: string | null;
    outputDirectoryError: string | null;
    converting: boolean;
    canDownload: boolean;
    onChange: (next: Partial<ConverterSettings>) => void;
    onSelectFolder: () => void;
    onConvert: () => void;
    onDownload: () => void;
    onClear: () => void;
}

export const Controls = ({
    items,
    settings,
    outputDirectory,
    outputDirectoryError,
    converting,
    canDownload,
    onChange,
    onSelectFolder,
    onConvert,
    onDownload,
    onClear
}: ControlsProps) => {
    return (
        <section
            className={clsx(
                'ui-panel export-settings p-5 overflow-hidden',
                '[box-shadow:0_10px_30px_#00000020] max-[1200px]:p-6 max-[761px]:p-5'
            )}
        >
            <div className="ui-panel__heading ui-panel__heading--inset">
                <span className="flex items-center gap-2">
                    <SlidersHorizontal size={16} /> Свойства экспорта
                </span>
                <span className="ui-badge">{settings.format.toUpperCase()}</span>
            </div>
            <fieldset
                aria-label="Настройки экспорта"
                disabled={converting}
                className={clsx('min-w-0', converting && 'opacity-50')}
            >
                <h2 className="export-settings__title mb-5 text-[14px] font-medium text-[#aaa]">
                    Параметры обработки
                </h2>
                <ConversionFields items={items} settings={settings} onChange={onChange} />
                <FilenameSettings items={items} settings={settings} onChange={onChange} />
            </fieldset>
            <OutputFolder
                directory={outputDirectory}
                error={outputDirectoryError}
                onSelect={onSelectFolder}
            />
            <ActionButtons
                converting={converting}
                canDownload={canDownload}
                onConvert={onConvert}
                onDownload={onDownload}
                onClear={onClear}
            />
        </section>
    );
};
