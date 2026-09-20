import { isTauri } from '@tauri-apps/api/core';
import { Controls } from '../../features/image-converter/components/Controls';
import { Header } from '../../features/image-converter/components/Header';
import { ImageGrid } from '../../features/image-converter/components/ImageGrid';
import { LivePreview } from '../../features/image-converter/components/LivePreview';
import { Progress } from '../../features/image-converter/components/Progress';
import { StatsBar } from '../../features/image-converter/components/StatsBar';
import { UploadZone } from '../../features/image-converter/components/UploadZone';
import { useImageConverter } from '../../features/image-converter/hooks/useImageConverter';

const ImageConverter = () => {
    const converter = useImageConverter();
    const hasFiles = converter.items.length > 0;
    const converting = converter.progress.visible && !converter.progress.complete;
    const isWeb = !isTauri();

    return (
        <main className={`min-h-screen text-slate-50 ${isWeb ? 'web-skin' : 'bg-[#0f0f23]'}`}>
            {isWeb && <div className="bg-gradient" aria-hidden="true" />}

            <div className="relative z-[1] mx-auto max-w-[1400px] px-5 py-10">
                <Header />

                {hasFiles && (
                    <StatsBar
                        files={converter.items.length}
                        bytes={converter.totalBytes}
                        saved={converter.savedPercent}
                    />
                )}

                <UploadZone onFiles={converter.addFiles} />

                {converter.selectedItem && (
                    <LivePreview
                        first={converter.selectedItem}
                        preview={converter.preview}
                        forecast={converter.forecast}
                        format={converter.settings.format}
                        totalBytes={converter.totalBytes}
                        count={converter.items.length}
                    />
                )}

                {hasFiles && (
                    <ImageGrid
                        items={converter.items}
                        selectedId={converter.selectedId}
                        onRemove={converter.removeFile}
                        onSelect={converter.selectItem}
                    />
                )}

                {converter.progress.visible && (
                    <Progress
                        current={converter.progress.current}
                        total={converter.items.length}
                        message={converter.progress.message}
                        complete={converter.progress.complete}
                    />
                )}

                {hasFiles && (
                    <Controls
                        settings={converter.settings}
                        outputDirectory={converter.outputDirectory}
                        outputDirectoryError={converter.outputDirectoryError}
                        converting={converting}
                        canDownload={converter.processed.length > 0}
                        onChange={converter.updateSettings}
                        onSelectFolder={converter.selectFolder}
                        onConvert={converter.convert}
                        onDownload={converter.download}
                        onClear={converter.clear}
                    />
                )}
            </div>
        </main>
    );
};

export default ImageConverter;
