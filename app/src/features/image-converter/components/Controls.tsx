import type { ConverterSettings } from '../types';
import { ActionButtons } from './controls/ActionButtons';
import { ConversionFields } from './controls/ConversionFields';
import { OutputFolder } from './controls/OutputFolder';

interface ControlsProps {
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
}: ControlsProps) => (
    <section className="surface-panel mb-[30px] rounded-3xl border border-white/10 bg-white/5 p-[25px]">
        <ConversionFields settings={settings} onChange={onChange} />
        <OutputFolder directory={outputDirectory} error={outputDirectoryError} onSelect={onSelectFolder} />
        <ActionButtons
            converting={converting}
            canDownload={canDownload}
            onConvert={onConvert}
            onDownload={onDownload}
            onClear={onClear}
        />
    </section>
);
