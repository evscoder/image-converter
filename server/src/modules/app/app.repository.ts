import path from 'node:path';
import { readJsonFile, writeJsonFile } from '../../utils/json-file';
import type { AppData } from './app.types';

const storageDir = path.resolve(process.cwd(), 'storage');
const appDataPath = path.join(storageDir, 'app.json');
const defaultAppData: AppData = {
  title: 'React App',
};

export const readAppData = async (): Promise<AppData> => {
  return readJsonFile(appDataPath, {
    defaultValue: defaultAppData,
  });
};

export const writeAppData = async (data: AppData): Promise<AppData> => {
  return writeJsonFile(appDataPath, data);
};
