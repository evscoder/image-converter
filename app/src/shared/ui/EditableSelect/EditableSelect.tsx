import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './EditableSelect.module.scss';

interface EditableSelectProps {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
    suffix?: string;
    errorMessage?: string;
    normalizeInput?: (value: string) => string;
    normalize?: (value: string) => string | null;
}

export const EditableSelect = ({
    label,
    value,
    options,
    onChange,
    suffix,
    errorMessage = 'Проверьте введённое значение',
    normalizeInput = (text) => text,
    normalize = (text) => text.trim() || null
}: EditableSelectProps) => {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState(value);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        setDraft(value);
        setInvalid(false);
    }, [value]);

    useEffect(() => {
        if (!open) return;

        const closeOutside = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };

        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [open]);

    const commit = () => {
        const normalized = normalize(draft);
        if (normalized === null) {
            setInvalid(true);
            return;
        }

        setInvalid(false);
        setDraft(normalized);
        onChange(normalized);
        setOpen(false);
    };

    const select = (option: string) => {
        setDraft(option);
        setInvalid(false);
        onChange(option);
        setOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div
            ref={rootRef}
            className={styles.root}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    commit();
                    setOpen(false);
                }
            }}
        >
            <div className={styles.control}>
                <input
                    ref={inputRef}
                    className={`ui-input ${styles.input}`}
                    role="combobox"
                    aria-label={label}
                    aria-expanded={open}
                    aria-controls={open ? `${id}-list` : undefined}
                    aria-autocomplete="list"
                    aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? `${id}-error` : undefined}
                    inputMode="decimal"
                    value={draft}
                    onChange={(event) => {
                        const text = event.target.value;
                        const normalized = normalizeInput(text);
                        setDraft(normalized);
                        if (normalized !== text) onChange(normalized);
                        setInvalid(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                            event.preventDefault();
                            const direction = event.key === 'ArrowDown' ? 1 : -1;
                            setActiveIndex(open
                                ? (activeIndex + direction + options.length) % options.length
                                : Math.max(0, options.indexOf(value)));
                            setOpen(true);
                        } else if (event.key === 'Enter') {
                            event.preventDefault();
                            if (open) select(options[activeIndex]);
                            else commit();
                        } else if (event.key === 'Escape') {
                            event.preventDefault();
                            setOpen(false);
                            setDraft(value);
                            setInvalid(false);
                        }
                    }}
                />
                <span className={styles.suffix} aria-hidden="true">{suffix}</span>
                <button
                    type="button"
                    className={styles.toggle}
                    aria-label={`Варианты: ${label}`}
                    aria-expanded={open}
                    aria-controls={open ? `${id}-list` : undefined}
                    onClick={(event) => {
                        event.preventDefault();
                        setActiveIndex(Math.max(0, options.indexOf(value)));
                        setOpen(!open);
                        inputRef.current?.focus();
                    }}
                >
                    <ChevronDown size={16} aria-hidden="true" />
                </button>
            </div>
            {open && (
                <ul id={`${id}-list`} role="listbox" aria-label={label} className={styles.list}>
                    {options.map((option, index) => (
                        <li
                            key={option}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={option === value}
                            className={index === activeIndex ? styles.active : undefined}
                            onPointerMove={() => setActiveIndex(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={(event) => {
                                event.preventDefault();
                                select(option);
                            }}
                        >
                            {option}{suffix}
                        </li>
                    ))}
                </ul>
            )}
            {invalid && (
                <span id={`${id}-error`} role="alert" className={styles.error}>
                    {errorMessage}
                </span>
            )}
        </div>
    );
};
