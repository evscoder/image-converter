import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { readFile } from '@tauri-apps/plugin-fs';
import { UploadZone } from './UploadZone';

jest.mock('@tauri-apps/api/core', () => ({ isTauri: jest.fn() }));
jest.mock('@tauri-apps/api/webview', () => ({ getCurrentWebview: jest.fn() }));
jest.mock('@tauri-apps/plugin-fs', () => ({ readFile: jest.fn() }));

afterEach(() => jest.resetAllMocks());

test('browser drops pass File objects without invoking desktop APIs', () => {
    jest.mocked(isTauri).mockReturnValue(false);
    const onFiles = jest.fn();
    const { getByText } = render(<UploadZone onFiles={onFiles} />);
    const files = [new File(['image'], 'photo.png', { type: 'image/png' })];
    fireEvent.drop(getByText('Перетащите изображения сюда'), { dataTransfer: { files } });
    expect(onFiles).toHaveBeenCalledWith(files);
    expect(getCurrentWebview).not.toHaveBeenCalled();
});

test('native paths become image files, failed reads are reported, listener is removed', async () => {
    jest.mocked(isTauri).mockReturnValue(true);
    const unlisten = jest.fn();
    const listen = jest.fn().mockResolvedValue(unlisten);
    jest.mocked(getCurrentWebview).mockReturnValue({ onDragDropEvent: listen } as unknown as ReturnType<typeof getCurrentWebview>);
    jest.mocked(readFile).mockResolvedValueOnce(new Uint8Array([1, 2, 3])).mockRejectedValueOnce(new Error('Unreadable'));
    const onFiles = jest.fn();
    const { getByRole, unmount } = render(<UploadZone onFiles={onFiles} />);
    await waitFor(() => expect(listen).toHaveBeenCalledTimes(1));
    await act(async () => {
        await listen.mock.calls[0][0]({ payload: { type: 'drop', paths: ['C:\\Pictures\\Фото.PNG', '/tmp/bad.jpg', '/tmp/note.txt'] } });
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
