import { IPath } from './paths.ts';

export const getActiveIndex = (location: string, paths: IPath[]) => {
    return paths.findIndex((item) => location.indexOf(item.path) === 0);
};
