import { expect, test } from 'vitest';
import { clampScaleInput, clampWidth, getMaximumScale } from './resizeLimits';

test('width inputs cap oversized values and preserve an empty field', () => {
    expect(clampWidth('8000000')).toBe('8000');
    expect(clampWidth('1200')).toBe('1200');
    expect(clampWidth('')).toBe('');
});

test('scale limits account for every image and portrait height', () => {
    expect(getMaximumScale([{ width: 800, height: 800 }])).toBe(4);
    expect(getMaximumScale([{ width: 800, height: 800 }, { width: 3000, height: 5000 }])).toBe(1.6);
    expect(getMaximumScale([{ width: 10000, height: 2000 }])).toBe(0.8);
    const maximum = getMaximumScale([{ width: 6000, height: 3000 }]);
    expect(maximum * 6000).toBeLessThanOrEqual(8000);
    expect(clampScaleInput('3', maximum)).toBe(String(maximum));
    expect(clampScaleInput('0,75', maximum)).toBe('0,75');
    expect(clampScaleInput('0.', maximum)).toBe('0.');
});
