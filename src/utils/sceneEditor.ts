import type { CareerMapData } from '../types/careerMap';

const REMOTE_SRC_PATTERN = /^(?:[a-z]+:)?\/\//i;

export function isSceneEditMode(): boolean {
  const editParam = new URLSearchParams(window.location.search).get('edit');
  return editParam?.toUpperCase() === 'Y';
}

export function moveSceneNode(
  data: CareerMapData,
  layerId: string,
  nodeId: string,
  x: number,
  y: number,
): CareerMapData {
  return {
    ...data,
    layers: data.layers.map((layer) => {
      if (layer.id !== layerId) {
        return layer;
      }

      return {
        ...layer,
        nodes: layer.nodes.map((node) =>
          node.id === nodeId ? { ...node, x, y } : node,
        ),
      };
    }),
  };
}

export function serializeSceneData(data: CareerMapData): string {
  return JSON.stringify(
    {
      ...data,
      assets: data.assets.map((asset) => ({
        ...asset,
        src: getSourceAssetPath(asset.src),
      })),
    },
    null,
    2,
  );
}

function getSourceAssetPath(src: string): string {
  if (REMOTE_SRC_PATTERN.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl !== '/' && src.startsWith(baseUrl)) {
    return `/${src.slice(baseUrl.length).replace(/^\/+/, '')}`;
  }

  return src.startsWith('/') ? src : `/${src.replace(/^\/+/, '')}`;
}
