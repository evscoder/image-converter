export const HOME = '/';
export const LOGIN_PATH = '/sign-in';
export const SIGN_IN = 'sign-in';

export interface IPath {
    [key: string]: string;
}

export const PATHS_CONFIG = {
    home: {
        path: '/',
        name: HOME
    },
    signIn: {
        path: LOGIN_PATH,
        name: SIGN_IN
    }
};

