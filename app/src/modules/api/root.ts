export const productionPath = 'react-starter-blond.vercel.app';

/** Basename for React Router when the app is served from a subdirectory (e.g. /web/). */
const resolveBasename = () => {
    if (typeof window === 'undefined') return '';
    const path = window.location.pathname;
    if (path === '/web' || path.startsWith('/web/')) return '/web';
    return '';
};

export const paths = {
    api: '/api',
    basename: resolveBasename(),
    index: '/'
};
