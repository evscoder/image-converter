import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface ReadJsonFileOptions<T> {
  defaultValue: T;
  isValid?: (value: unknown) => value is T;
}

const ensureDir = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

export const readJsonFile = async <T>(
  filePath: string,
  { defaultValue, isValid }: ReadJsonFileOptions<T>,
): Promise<T> => {
  await ensureDir(filePath);

  try {
    const file = await readFile(filePath, 'utf-8');
    const data = JSON.parse(file) as unknown;

    if (!isValid || isValid(data)) {
      return data as T;
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeJsonFile(filePath, defaultValue);

  return defaultValue;
};

export const writeJsonFile = async <T>(filePath: string, data: T): Promise<T> => {
  await ensureDir(filePath);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);

  return data;
};
