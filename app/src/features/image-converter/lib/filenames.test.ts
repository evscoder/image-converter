import { expect, test } from 'vitest';
import { buildOutputFilenames } from './filenames';

const sourceNames = ['first.photo.png', 'second.jpg', 'third.webp'];
const settings = { nameTemplate: 'image_$nnn', startNumber: '7', format: 'webp' as const };

test('ascending numbers use the chosen start and padding without truncating larger numbers', () => {
    expect(buildOutputFilenames(sourceNames, settings).names).toEqual([
        'image_007.webp', 'image_008.webp', 'image_009.webp'
    ]);
    expect(buildOutputFilenames(sourceNames, { ...settings, startNumber: '999' }).names).toEqual([
        'image_999.webp', 'image_1000.webp', 'image_1001.webp'
    ]);
});

test('descending numbers end at the chosen number in upload order', () => {
    expect(buildOutputFilenames(sourceNames, { ...settings, nameTemplate: '$NN_$&', format: 'jpeg' }).names)
        .toEqual(['09_first.photo.jpg', '08_second.jpg', '07_third.jpg']);
});

test('templates support original names and multiple counters without expanding tokens from source names', () => {
    expect(buildOutputFilenames(['photo_$nn.png', 'second.jpg'], {
        ...settings,
        nameTemplate: '$n_$&_$NNN'
    }).names).toEqual(['7_photo_$nn_008.webp', '8_second_007.webp']);
});

test('a zero start is supported and empty values use the default template and start', () => {
    expect(buildOutputFilenames(sourceNames, { ...settings, startNumber: '0' }).names)
        .toEqual(['image_000.webp', 'image_001.webp', 'image_002.webp']);
    expect(buildOutputFilenames(['photo.png'], { ...settings, nameTemplate: '', startNumber: '' }).names)
        .toEqual(['image_001.webp']);
});

test('duplicate names receive unique suffixes even after case folding and character replacement', () => {
    const result = buildOutputFilenames(['Photo.jpg', 'photo.png', 'Photo (2).png', 'photo.webp'], {
        ...settings,
        nameTemplate: '$&'
    });
    expect(result.names).toEqual([
        'Photo.webp', 'photo (2).webp', 'Photo (2) (2).webp', 'photo (3).webp'
    ]);
    expect(result.hasDuplicates).toBe(true);

    expect(buildOutputFilenames(['one.png', 'two.png'], { ...settings, nameTemplate: 'export' }).names)
        .toEqual(['export.webp', 'export (2).webp']);
});

test('unsafe path characters and reserved filenames are normalized before export', () => {
    const result = buildOutputFilenames(['../photo:?.png', 'CON.jpg', '...png'], {
        ...settings,
        nameTemplate: '$&',
        format: 'png'
    });
    expect(result.names).toEqual(['_photo__.png', '_CON.png', 'image.png']);
    expect(result.hasReplacements).toBe(true);
});
