export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

interface AssetLike {
  src: string;
}

export const withResolvedAssetSrc = <T extends AssetLike>(items: T[]): T[] =>
  items.map((item) => ({
    ...item,
    src: asset(item.src),
  }));
