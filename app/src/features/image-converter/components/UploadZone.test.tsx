import { afterEach, expect, test, vi } from 'vitest';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { readFile } from '@tauri-apps/plugin-fs';
import { UploadZone } from './UploadZone';

vi.mock('@tauri-apps/api/core', () => ({ isTauri: vi.fn() }));
vi.mock('@tauri-apps/api/webview', () => ({ getCurrentWebview: vi.fn() }));
vi.mock('@tauri-apps/plugin-fs', () => ({ readFile: vi.fn() }));

afterEach(() => vi.resetAllMocks());

test('browser drops pass File objects without invoking desktop APIs', () => {
    vi.mocked(isTauri).mockReturnValue(false);
    const onFiles = vi.fn();
    const { getByText } = render(<UploadZone onFiles={onFiles} />);
    const files = [new File(['image'], 'photo.png', { type: 'image/png' })];
    fireEvent.drop(getByText('Перетащите изображения сюда'), { dataTransfer: { files } });
    expect(onFiles).toHaveBeenCalledWith(files);
    expect(getCurrentWebview).not.toHaveBeenCalled();
});

test('native paths become image files, failed reads are reported, listener is removed', async () => {
    vi.mocked(isTauri).mockReturnValue(true);
    const unlisten = vi.fn();
    const listen = vi.fn().mockResolvedValue(unlisten);
    vi.mocked(getCurrentWebview).mockReturnValue(
        { onDragDropEvent: listen } as unknown as ReturnType<typeof getCurrentWebview>
    );
    vi.mocked(readFile)
        .mockResolvedValueOnce(new Uint8Array([1, 2, 3]))
        .mockRejectedValueOnce(new Error('Unreadable'));
    const onFiles = vi.fn();
    const { getByRole, unmount } = render(<UploadZone onFiles={onFiles} />);
    await waitFor(() => expect(listen).toHaveBeenCalledTimes(1));
    await act(async () => {
        await listen.mock.calls[0][0]({
            payload: {
                type: 'drop',
                paths: ['C:\\Pictures\\Фото.PNG', '/tmp/bad.jpg', '/tmp/note.txt']
            }
        });
    });
    expect(onFiles).toHaveBeenCalledTimes(1);
    const files = onFiles.mock.calls[0][0] as File[];
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('Фото.PNG');
    expect(files[0].type).toBe('image/png');
    expect(files[0].size).toBe(3);
    expect(readFile).toHaveBeenCalledTimes(2);
    expect(getByRole('alert').textContent).toContain('1');
    unmount();
    expect(unlisten).toHaveBeenCalledTimes(1);
});
