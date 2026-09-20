const imagePath = (pathName: string) => {
    const fullPath = process.env.NODE_ENV === 'production' ? `/img/` : `/img/`;

    return fullPath + pathName;
};

export default imagePath;
