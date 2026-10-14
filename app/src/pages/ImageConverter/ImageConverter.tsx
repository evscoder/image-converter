import clsx from 'clsx';
import { Images, SlidersHorizontal, Sparkles } from 'lucide-react';
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

    return (
        <main
            className={clsx(
                'converter-workspace flex flex-col text-[var(--color-text)] text-[13px]',
                '[background:linear-gradient(135deg,_#2d4140_0,_#292f33_180px,_#26282c_420px)]'
            )}
        >
            <Header />

            <div
                className={clsx(
                    'converter-workspace__toolbar flex shrink-0 items-center justify-between gap-4 min-h-[42px] p-[0_20px]',
                    '[border-bottom:1px_solid_#111] [background:#26282c] text-[12px]'
                )}
            >
                <span className="flex items-center gap-[9px]">
                    <Images size={16} /> Пакетная обработка
                </span>
                <span className="converter-workspace__formats text-[#888] text-[10px] tracking-[1px]">
                    WEBP / JPEG / PNG
                </span>
            </div>

            <div className="converter-workspace__body">
                <div className="converter-workspace__workspace">
                    <div className="converter-workspace__canvas">
                        <div className="ui-panel__heading">
                            <span>Изображения</span>
                            <span>{converter.items.length} файлов</span>
                        </div>

                        <UploadZone onFiles={converter.addFiles}>
                            {hasFiles
                                ? (openFilePicker) => (
                                      <ImageGrid
                                          items={converter.items}
                                          selectedId={converter.selectedId}
                                          onRemove={converter.removeFile}
                                          onSelect={converter.selectItem}
                                          onAdd={openFilePicker}
                                      />
                                  )
                                : undefined}
                        </UploadZone>

                        {converter.selectedItem && (
                            <LivePreview
                                first={converter.selectedItem}
                                preview={converter.preview}
                                forecast={converter.forecast}
                                forecastDeferred={Number(converter.settings.scale) > 1}
                                format={converter.settings.format}
                                totalBytes={converter.totalBytes}
                                count={converter.items.length}
                            />
                        )}

                        {converter.progress.visible && (
                            <Progress
                                current={converter.progress.current}
                                total={converter.items.length}
                                message={
                                    <div className="inline-flex items-center gap-3">
                                        <Sparkles className="size-4 shrink-0 text-blue-400" />
                                        <span>{converter.progress.message}</span>
                                    </div>
                                }
                                complete={converter.progress.complete}
                            />
                        )}
                    </div>

                    <div className="converter-workspace__sidebar">
                        {hasFiles ? (
                            <Controls
                                items={converter.items}
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
                        ) : (
                            <aside
                                className={clsx(
                                    'ui-panel export-settings p-5 overflow-hidden',
                                    '[box-shadow:0_10px_30px_#00000020] max-[1200px]:p-6 max-[761px]:p-5',
                                    'export-settings--empty'
                                )}
                            >
                                <div className="ui-panel__heading ui-panel__heading--inset">
                                    <span className="flex items-center gap-2">
                                        <SlidersHorizontal size={15} /> Свойства экспорта
                                    </span>
                                </div>
                                <p className="my-6 text-[12px] leading-[1.8] text-[#999]">
                                    Добавьте изображения, чтобы настроить формат, качество и размер.
                                </p>
                                <div className="export-settings__formats flex gap-2">
                                    {['WEBP', 'JPEG', 'PNG'].map((format) => (
                                        <span
                                            key={format}
                                            className="rounded-[7px] border border-[#484848] px-2.5 py-1.5 text-[10px] text-[#888]"
                                        >
                                            {format}
                                        </span>
                                    ))}
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>

            <footer
                className={clsx(
                    'app-status flex shrink-0 items-center justify-between gap-4 p-[8px_20px]',
                    '[border-top:1px_solid_#111] [background:#26282c] text-[#999] text-[10px] max-[1200px]:flex-wrap'
                )}
            >
                <span>
                    {converting
                        ? 'Обработка изображений…'
                        : hasFiles
                          ? 'Готово к обработке'
                          : 'Ожидание изображений'}
                </span>
                {hasFiles && (
                    <StatsBar
                        files={converter.items.length}
                        bytes={converter.totalBytes}
                        saved={converter.savedPercent}
                    />
                )}
                <span>Image Converter</span>
            </footer>
        </main>
    );
};

export default ImageConverter;
