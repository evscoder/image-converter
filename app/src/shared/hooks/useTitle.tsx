import {useEffect, useRef} from 'react';

const useTitle = (title: string) => {
    const documentDefined = typeof document !== 'undefined';
    const originalTitle = useRef(documentDefined ? document.title : null);

    useEffect(() => {
        if (!documentDefined) return;

        const originalTitleRef = originalTitle;

        if (document.title !== title) document.title = title;

        return () => {
            document.title = originalTitleRef?.current as string;
        };
    }, [documentDefined, title]);
};

export default useTitle;
