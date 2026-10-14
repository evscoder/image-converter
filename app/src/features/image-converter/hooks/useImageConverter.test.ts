import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createImageThumbnail, processImage } from '../lib/imageProcessing';
import { useImageConverter } from './useImageConverter';

vi.mock('../lib/imageProcessing', async (importOriginal) => ({
    ...await importOriginal<typeof import('../lib/imageProcessing')>(),
    createImageThumbnail: vi.fn(),
    processImage: vi.fn()
}));

beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:preview'),
        revokeObjectURL: vi.fn()
    });
    vi.mocked(createImageThumbnail).mockResolvedValue(new Blob(['thumbnail']));
    vi.mocked(processImage).mockResolvedValue({ blob: new Blob(['output']), size: 6 });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

test('upscaling previews only the selected file and computes totals on conversion', async () => {
    const { result } = renderHook(useImageConverter);
    await act(async () => {
        result.current.updateSettings({ scale: '3' });
        await result.current.addFiles([
            new File(['original-one'], 'one.png', { type: 'image/png' }),
            new File(['original-two'], 'two.png', { type: 'image/png' })
        ]);
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

    expect(processImage).toHaveBeenCalledTimes(1);
    expect(result.current.preview).not.toBeNull();
    expect(result.current.forecast).toBeNull();

    await act(async () => { await result.current.convert(); });
    expect(processImage).toHaveBeenCalledTimes(2);
    expect(result.current.forecast?.resultSize).toBe(12);

    await act(async () => { result.current.updateSettings({ scale: '0.5' }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(processImage).toHaveBeenCalledTimes(4);
    expect(result.current.forecast?.resultSize).toBe(12);
});

test('adding a large portrait clamps the current scale and later inputs', async () => {
    vi.mocked(createImageThumbnail).mockImplementation(async (_file, _limit, onDimensions) => {
        onDimensions?.(3000, 5000);
        return new Blob(['thumbnail']);
    });
    const { result } = renderHook(useImageConverter);
    await act(async () => {
        result.current.updateSettings({ scale: '4' });
        await result.current.addFiles([new File(['image'], 'portrait.png', { type: 'image/png' })]);
    });
    expect(result.current.settings.scale).toBe('1.6');
    await act(async () => { result.current.updateSettings({ scale: '3' }); });
    expect(result.current.settings.scale).toBe('1.6');
    await act(async () => { result.current.updateSettings({ maxWidth: '8000000' }); });
    expect(result.current.settings.maxWidth).toBe('8000');
    expect(result.current.settings.scale).toBe('1');
});
