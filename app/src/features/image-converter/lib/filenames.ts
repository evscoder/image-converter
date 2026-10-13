import type { ConverterSettings } from '../types';

export const defaultNameTemplate = 'image_$nnn';

type NamingSettings = Pick<ConverterSettings, 'nameTemplate' | 'startNumber' | 'format'>;

export const getNumberingDirection = (nameTemplate: string) => {
    const template = nameTemplate.trim() || defaultNameTemplate;
    const ascending = /\$n/.test(template);
    const descending = /\$N/.test(template);

    if (ascending && descending) return 'mixed';
    if (ascending) return 'ascending';
    if (descending) return 'descending';
    return 'none';
};

const getStartNumber = (value: string) => {
    const number = Number(value.trim() || '1');
    return Number.isSafeInteger(number) && number >= 0 ? number : 1;
};

const sanitizeFilename = (value: string) => {
    const cleaned = Array.from(value, character => character.charCodeAt(0) < 32 ? '_' : character)
        .join('')
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/^[. ]+|[. ]+$/g, '') || 'image';

    // These device names cannot be used as filenames on Windows, even with an extension.
    return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(cleaned) ? `_${cleaned}` : cleaned;
};

export const buildOutputFilenames = (sourceNames: string[], settings: NamingSettings) => {
    const template = settings.nameTemplate.trim() || defaultNameTemplate;
    const start = getStartNumber(settings.startNumber);
    const extension = settings.format === 'jpeg' ? 'jpg' : settings.format;
    const usedNames = new Set<string>();
    const nextSuffixes = new Map<string, number>();
    let hasDuplicates = false;
    let hasReplacements = false;

    const names = sourceNames.map((sourceName, index) => {
        const originalName = sourceName.replace(/\.[^.]*$/, '') || 'image';
        const expandedName = template.replace(/\$(n+|N+|&)/g, (_, token: string) => {
            if (token === '&') return originalName;

            const number = token[0] === 'n' ? start + index : start + sourceNames.length - index - 1;
            return String(number).padStart(token.length, '0');
        });
        const stem = sanitizeFilename(expandedName);
        hasReplacements ||= stem !== expandedName;

        let name = `${stem}.${extension}`;
        const stemKey = stem.normalize('NFC').toLowerCase();
        let suffix = nextSuffixes.get(stemKey) ?? 2;

        while (usedNames.has(name.normalize('NFC').toLowerCase())) {
            name = `${stem} (${suffix++}).${extension}`;
            hasDuplicates = true;
        }

        usedNames.add(name.normalize('NFC').toLowerCase());
        nextSuffixes.set(stemKey, suffix);
        return name;
    });

    return { names, hasDuplicates, hasReplacements };
};
