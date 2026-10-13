import clsx from 'clsx';
import { useId, useMemo, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { buildOutputFilenames, defaultNameTemplate, getNumberingDirection } from '../../lib/filenames';
import type { ConverterSettings, ImageItem } from '../../types';
import { ControlField, inputClassName } from './ControlField';

interface FilenameSettingsProps {
    items: ImageItem[];
    settings: ConverterSettings;
    onChange: (next: Partial<ConverterSettings>) => void;
}

const tokenButtonClassName = clsx(
    'rounded-[7px] border px-2 py-1.5 text-[11px] transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]'
);

const inactiveTokenClassName = 'border-[#42454b] text-[#bcc4d4] hover:border-[#5cd2bc] hover:text-[#ddd]';
const activeTokenClassName = 'border-[#5cd2bc66] bg-[#26bbab14] text-[#8ee1ca]';

export const FilenameSettings = ({ items, settings, onChange }: FilenameSettingsProps) => {
    const id = useId();
    const templateInput = useRef<HTMLInputElement>(null);
    const selection = useRef<{ start: number; end: number } | null>(null);
    const template = settings.nameTemplate.trim() || defaultNameTemplate;
    const direction = getNumberingDirection(template);
    const hasNumber = direction !== 'none';
    const numberDigits = template.match(/\$(n+|N+)/)?.[1].length ?? 3;
    const output = useMemo(
        () => buildOutputFilenames(items.map(item => item.file.name), settings),
        [items, settings]
    );
    const startLabel = direction === 'descending'
        ? 'Закончить на'
        : direction === 'mixed' ? 'Отсчёт от' : 'Начать с';

    const rememberSelection = (input: HTMLInputElement) => {
        selection.current = {
            start: input.selectionStart ?? input.value.length,
            end: input.selectionEnd ?? input.value.length
        };
    };

    const updateTemplate = (value: string, cursor: number) => {
        onChange({ nameTemplate: value });
        selection.current = { start: cursor, end: cursor };

        window.requestAnimationFrame(() => {
            templateInput.current?.focus();
            templateInput.current?.setSelectionRange(cursor, cursor);
        });
    };

    const insertToken = (token: string) => {
        const value = settings.nameTemplate;
        const start = Math.min(selection.current?.start ?? value.length, value.length);
        const end = Math.min(selection.current?.end ?? value.length, value.length);
        updateTemplate(value.slice(0, start) + token + value.slice(end), start + token.length);
    };

    const setNumberDirection = (counter: 'n' | 'N') => {
        if (!/\$(n+|N+)/.test(settings.nameTemplate)) {
            insertToken(`$${counter.repeat(numberDigits)}`);
            return;
        }

        const updated = template.replace(/\$(n+|N+)/g, (_, token: string) => `$${counter.repeat(token.length)}`);
        updateTemplate(updated, updated.length);
    };

    return (
        <section className="mt-6 border-t border-[#424242] pt-5" aria-labelledby={`${id}-heading`}>
            <h2 id={`${id}-heading`} className="mb-2 text-[14px] font-medium text-[#aaa]">
                Имена файлов
            </h2>
            <p className="mb-4 text-[12px] leading-relaxed text-[#969da8]">
                Задайте имя для всех изображений. Исходные имена и номера подставятся автоматически.
            </p>

            <ControlField label="Шаблон имени">
                <input
                    ref={templateInput}
                    className={clsx(inputClassName, 'font-mono')}
                    value={settings.nameTemplate}
                    placeholder={defaultNameTemplate}
                    aria-describedby={`${id}-template-help`}
                    spellCheck={false}
                    autoComplete="off"
                    onSelect={(event) => rememberSelection(event.currentTarget)}
                    onChange={(event) => {
                        rememberSelection(event.currentTarget);
                        onChange({ nameTemplate: event.currentTarget.value });
                    }}
                />
            </ControlField>

            <div className="my-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Подстановка имени и номера">
                <button
                    type="button"
                    className={clsx(tokenButtonClassName, inactiveTokenClassName)}
                    title="Вставить исходное имя без расширения в позицию курсора"
                    onClick={() => insertToken('$&')}
                >
                    Исходное имя
                </button>
                <button
                    type="button"
                    className={clsx(
                        tokenButtonClassName,
                        direction === 'ascending' ? activeTokenClassName : inactiveTokenClassName
                    )}
                    aria-label="Номер по возрастанию"
                    aria-pressed={direction === 'ascending'}
                    title="Номера от меньшего к большему"
                    onClick={() => setNumberDirection('n')}
                >
                    Номер ↑
                </button>
                <button
                    type="button"
                    className={clsx(
                        tokenButtonClassName,
                        direction === 'descending' ? activeTokenClassName : inactiveTokenClassName
                    )}
                    aria-label="Номер по убыванию"
                    aria-pressed={direction === 'descending'}
                    title="Номера от большего к меньшему"
                    onClick={() => setNumberDirection('N')}
                >
                    Номер ↓
                </button>
            </div>

            <p id={`${id}-template-help`} className="mb-4 text-[11px] leading-relaxed text-[#969da8]">
                Добавьте имя и номер кнопками или измените шаблон вручную.{' '}
                <span className="font-mono text-[#afcfcb]">$&</span> — исходное имя без расширения,{' '}
                <span className="font-mono text-[#afcfcb]">$n</span> — 1,{' '}
                <span className="font-mono text-[#afcfcb]">$nn</span> — 01,{' '}
                <span className="font-mono text-[#afcfcb]">$nnn</span> — 001.
            </p>

            <label
                className={clsx(
                    'flex min-w-0 items-center gap-3',
                    !hasNumber && 'pointer-events-none opacity-30'
                )}
            >
                <span className="ui-field__label shrink-0 whitespace-nowrap">{startLabel}</span>
                <input
                    className={clsx(inputClassName, 'min-w-0 flex-1')}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    disabled={!hasNumber}
                    value={settings.startNumber}
                    placeholder="1"
                    onChange={(event) => onChange({ startNumber: event.currentTarget.value.replace(/\D/g, '') })}
                />
            </label>

            <div className="mt-4 rounded-[8px] border border-[#3d756a80] bg-[#26bbab08] p-3">
                <h3 className="mb-2.5 text-[12px] font-medium text-[#afcfcb]">Будут сохранены как</h3>
                <ol className="space-y-2" aria-label="Пример имён файлов" aria-live="polite">
                    {output.names.slice(0, 3).map((name, index) => (
                        <li
                            key={items[index].id}
                            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] items-center gap-2"
                        >
                            <span className="truncate text-[11px] text-[#969da8]" title={items[index].file.name}>
                                {items[index].file.name}
                            </span>
                            <ArrowRight className="size-3 text-[#6f9390]" aria-hidden="true" />
                            <span className="truncate font-mono text-[11px] text-[#d6eee7]" title={name}>
                                {name}
                            </span>
                        </li>
                    ))}
                </ol>
                {items.length > 3 && (
                    <p className="mt-2.5 text-[11px] text-[#969da8]">Показаны первые 3 из {items.length} файлов.</p>
                )}
            </div>

            {!settings.nameTemplate.trim() && (
                <p className="mt-2 text-[11px] leading-relaxed text-[#969da8]">
                    Пустой шаблон использует имя image и номер из трёх цифр.
                </p>
            )}
            {output.hasDuplicates && (
                <p className="mt-2 text-[11px] leading-relaxed text-[#afcfcb]">
                    Совпадающие имена дополнены номерами в скобках, чтобы сохранить все файлы.
                </p>
            )}
            {output.hasReplacements && (
                <p className="mt-2 text-[11px] leading-relaxed text-[#afcfcb]">
                    Недопустимые имена исправлены. Результат показан в примере.
                </p>
            )}
        </section>
    );
};
