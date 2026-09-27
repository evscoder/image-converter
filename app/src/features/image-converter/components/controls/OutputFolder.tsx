import { AlertTriangle, CircleCheck } from 'lucide-react';

interface OutputFolderProps {
    directory: string | null;
    error: string | null;
    onSelect: () => void;
}

const getDirectoryName = (directory: string) => (
    directory.split(/[\\/]/).filter(Boolean).pop()
);

export const OutputFolder = ({ directory, error, onSelect }: OutputFolderProps) => {
    const statusClassName = error
        ? 'font-semibold text-amber-500'
        : directory
        ? 'font-semibold text-emerald-500'
        : 'text-slate-400';
    const statusText = error
      ? error
      : directory
        ? `${getDirectoryName(directory)} (автосохранение)`
        : 'Папка не выбрана — будет скачивание ZIP';
  
  const StatusIcon = error || !directory
    ? <AlertTriangle className="text-yellow-300"/>
    : <CircleCheck className="text-green-500"/>;
  
  return (
    <div
      className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 max-md:flex-col max-md:items-stretch">
      <div className="min-w-[200px] flex-1">
        <div className="text-xs text-slate-400 flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     className="lucide lucide-folder-bookmark preview-icon">
                  <path
                    d="M12 6v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834a.25.25 0 00.406-.195V6"/>
                  <path
                    d="M20 20a2 2 0 002-2V8a2 2 0 00-2-2h-7.9a2 2 0 01-1.69-.9L9.6 3.9A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z"/>
                </svg>
                Автосохранение в папку
              </div>
              <div className={`flex items-center gap-2 text-[.95rem] ${statusClassName}`}>
                {StatusIcon}
                <span>{statusText}</span>
              </div>
            </div>
          
          <button
            className="inline-flex items-center gap-2 folder-btn rounded-[10px] border border-emerald-500/30 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/30"
            type="button"
            onClick={onSelect}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
            Выбрать папку
            </button>
        </div>
    );
};
