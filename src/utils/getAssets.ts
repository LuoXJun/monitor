export const getImg = (imgName: string) => {
    return new URL(`../assets/imgs/${imgName}`, import.meta.url).href;
};
