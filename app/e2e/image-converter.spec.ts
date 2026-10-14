import { readFile } from 'node:fs/promises';
import { expect, test, type Download, type Page } from '@playwright/test';
import JSZip from 'jszip';

// Generate a valid image in the browser so fixtures need no external assets.
const uploadImages = async (page: Page) => {
    const base64 = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 40;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        context.fillStyle = '#488676';
        context.fillRect(0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png').split(',')[1];
    });

    await page.getByLabel('Выбрать изображения', { exact: true }).setInputFiles(
        ['first.png', 'second.png'].map(name => ({
            name,
            mimeType: 'image/png',
            buffer: Buffer.from(base64, 'base64')
        }))
    );
    await expect(page.getByRole('heading', { name: 'Все изображения (2)' })).toBeVisible();
};

const readArchive = async (download: Download) => {
    expect(await download.failure()).toBeNull();
    const path = await download.path();
    if (!path) throw new Error('Download path is unavailable');
    return JSZip.loadAsync(await readFile(path));
};

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('uploads, removes images, and clears the workspace', async ({ page }) => {
    const download = page.getByRole('button', { name: 'Скачать ZIP' });
    await expect(download).toHaveCount(0);
    await uploadImages(page);
    await expect(download).toBeDisabled();
    await page.getByRole('article').filter({ hasText: 'first.png' }).hover();
    await page.getByRole('button', { name: 'Удалить first.png' }).click();
    await expect(page.getByRole('heading', { name: 'Все изображения (1)' })).toBeVisible();
    await expect(page.getByRole('article').filter({ hasText: 'first.png' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Очистить', exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByText('Перетащите изображения сюда', { exact: true })).toBeVisible();
    await expect(download).toHaveCount(0);
});

for (const format of ['WEBP', 'JPEG', 'PNG'] as const) {
    test(`converts and exports resized ${format} images with configured names`, async ({ page }) => {
        await uploadImages(page);
        await page.getByLabel('Шаблон имени').fill('export_$nn');
        await page.getByLabel('Начать с').fill('7');
        await page.getByLabel('Макс. ширина (px)').fill('20');
        await page.getByRole('button').filter({ hasText: new RegExp(`^${format}$`) }).click();
        const extension = format === 'JPEG' ? 'jpg' : format.toLowerCase();
        const namePreview = page.getByRole('list', { name: 'Пример имён файлов' });
        await expect(namePreview.getByText(`export_07.${extension}`, { exact: true })).toBeVisible();
        await expect(namePreview.getByText(`export_08.${extension}`, { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Перекодировать', exact: true }).click();
        const downloadButton = page.getByRole('button', { name: 'Скачать ZIP' });
        await expect(downloadButton).toBeEnabled();

        const pendingDownload = page.waitForEvent('download');
        await downloadButton.click();
        const download = await pendingDownload;
        expect(download.suggestedFilename()).toBe('ImageConverter_images.zip');
        const archive = await readArchive(download);
        expect(Object.keys(archive.files).sort()).toEqual([
            `export_07.${extension}`,
            `export_08.${extension}`
        ]);

        for (const entry of Object.values(archive.files)) {
            const bytes = await entry.async('nodebuffer');
            // Check the encoder output as well as the extension and decoded dimensions.
            if (format === 'PNG') {
                expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
            } else if (format === 'JPEG') {
                expect(bytes.subarray(0, 3)).toEqual(Buffer.from([255, 216, 255]));
            } else {
                expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
                expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
            }

            const dimensions = await page.evaluate(async ({ base64, mime }) => {
                const image = new Image();
                image.src = `data:${mime};base64,${base64}`;
                await image.decode();
                return { width: image.naturalWidth, height: image.naturalHeight };
            }, {
                base64: bytes.toString('base64'),
                mime: `image/${format.toLowerCase()}`
            });
            expect(dimensions).toEqual({ width: 20, height: 10 });
        }

        await page.getByLabel('Шаблон имени').fill('updated_$nn');
        await expect(downloadButton).toBeDisabled();
    });
}

test('template buttons and reverse order update both the preview and exported names', async ({ page }) => {
    await uploadImages(page);
    const template = page.getByLabel('Шаблон имени');
    const preview = page.getByRole('list', { name: 'Пример имён файлов' });

    await template.fill('');
    await page.getByRole('button', { name: 'Исходное имя', exact: true }).click();
    await expect(template).toHaveValue('$&');
    await expect(preview.getByText('first.webp', { exact: true })).toBeVisible();

    await template.fill('$&_');
    await page.getByRole('button', { name: 'Номер по возрастанию' }).click();
    await expect(template).toHaveValue('$&_$nnn');
    await page.getByLabel('Начать с').fill('7');
    await template.fill('$&_$nn');
    await expect(template).toHaveValue('$&_$nn');
    await expect(preview.getByText('first_07.webp', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Номер по убыванию' }).click();
    await expect(template).toHaveValue('$&_$NN');
    await expect(page.getByLabel('Закончить на')).toHaveValue('7');
    await page.getByRole('button').filter({ hasText: /^JPEG$/ }).click();
    await expect(preview.getByText('first_08.jpg', { exact: true })).toBeVisible();
    await expect(preview.getByText('second_07.jpg', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Перекодировать', exact: true }).click();
    const downloadButton = page.getByRole('button', { name: 'Скачать ZIP' });
    await expect(downloadButton).toBeEnabled();
    const pendingDownload = page.waitForEvent('download');
    await downloadButton.click();
    const download = await pendingDownload;
    const archive = await readArchive(download);
    expect(Object.keys(archive.files).sort()).toEqual(['first_08.jpg', 'second_07.jpg']);

    await page.getByLabel('Закончить на').fill('10');
    await expect(downloadButton).toBeDisabled();
});

test('duplicate names are explained in the preview and preserve every file in the ZIP', async ({ page }) => {
    await uploadImages(page);
    await page.getByLabel('Шаблон имени').fill('photo');
    const preview = page.getByRole('list', { name: 'Пример имён файлов' });
    await expect(preview.getByText('photo.webp', { exact: true })).toBeVisible();
    await expect(preview.getByText('photo (2).webp', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Начать с')).toBeDisabled();
    await expect(page.getByText('Совпадающие имена дополнены номерами в скобках, чтобы сохранить все файлы.')).toBeVisible();

    await page.getByRole('button', { name: 'Перекодировать', exact: true }).click();
    const downloadButton = page.getByRole('button', { name: 'Скачать ZIP' });
    await expect(downloadButton).toBeEnabled();
    const pendingDownload = page.waitForEvent('download');
    await downloadButton.click();
    const download = await pendingDownload;
    const archive = await readArchive(download);
    expect(Object.keys(archive.files).sort()).toEqual(['photo (2).webp', 'photo.webp']);
});


test('scale supports presets, decimal input, keyboard selection and exclusive width', async ({ page }) => {
    await uploadImages(page);
    const scale = page.getByRole('combobox', { name: 'Масштаб', exact: true });
    const width = page.getByLabel('Макс. ширина (px)');
    await expect(scale).toHaveValue('1');
    await width.fill('100');
    await page.getByRole('button', { name: 'Варианты: Масштаб' }).click();
    await page.getByRole('option', { name: '2×', exact: true }).click();
    await expect(scale).toHaveValue('2');
    await expect(width).toHaveValue('');
    await width.fill('200');
    await expect(scale).toHaveValue('1');
    await scale.fill('0,75');
    await scale.press('Enter');
    await expect(scale).toHaveValue('0.75');
    await expect(width).toHaveValue('');
    await scale.press('ArrowDown');
    await scale.press('ArrowDown');
    await scale.press('Enter');
    await expect(scale).toHaveValue('1');
    for (const invalid of ['5', '4.01', '10']) {
        await scale.fill(invalid);
        await scale.press('Enter');
        await expect(scale).toHaveValue('4');
        await expect(scale).toHaveAttribute('aria-invalid', 'false');
    }
    await width.fill('8000000');
    await expect(width).toHaveValue('8000');
    await expect(scale).toHaveValue('1');
    await scale.fill('0');
    await scale.press('Enter');
    await expect(scale).toHaveAttribute('aria-invalid', 'true');
    await scale.press('Escape');
    await expect(scale).toHaveValue('1');
});

for (const scale of ['0.5', '2', '4']) {
    test(`exports images at ${scale} times their original dimensions`, async ({ page }) => {
        await uploadImages(page);
        await page.getByRole('button', { name: 'PNG', exact: true }).click();
        const field = page.getByRole('combobox', { name: 'Масштаб', exact: true });
        await field.fill(scale);
        await field.press('Enter');
        await page.getByRole('button', { name: 'Перекодировать', exact: true }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Скачать ZIP' }).click();
        const archive = await readArchive(await downloadPromise);
        const entry = Object.values(archive.files).find(file => !file.dir);
        if (!entry) throw new Error('Empty archive');
        const png = await entry.async('nodebuffer');
        expect(png.readUInt32BE(16)).toBe(80 * Number(scale));
        expect(png.readUInt32BE(20)).toBe(40 * Number(scale));
    });
}

test('large images lower the scale limit and clamp typed values immediately', async ({ page }) => {
    await uploadImages(page);
    const scale = page.getByRole('combobox', { name: 'Масштаб', exact: true });
    await scale.fill('4');
    await scale.press('Enter');
    const base64 = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 5000;
        return canvas.toDataURL('image/png').split(',')[1];
    });
    await page.getByLabel('Выбрать изображения', { exact: true }).setInputFiles({
        name: 'portrait.png',
        mimeType: 'image/png',
        buffer: Buffer.from(base64, 'base64')
    });
    await expect(scale).toHaveValue('1.6');
    await scale.fill('3');
    await expect(scale).toHaveValue('1.6');
    await expect(scale).toHaveAttribute('aria-invalid', 'false');
    await page.getByRole('button', { name: 'Варианты: Масштаб' }).click();
    await expect(page.getByRole('option', { name: '4×', exact: true })).toHaveCount(0);
    await expect(page.getByRole('option', { name: '1.6×', exact: true })).toBeVisible();
});
