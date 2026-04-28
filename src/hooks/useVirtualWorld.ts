import { RefObject, useEffect, useMemo, useState } from 'react';
import type { ImageCacheApi } from './useImageCache';
import type { SceneAsset, SceneLayer, ViewportRect, WorldInfo } from '../types/careerMap';
import { expandRect, intersects, rectFromBounds } from '../utils/geometry';
import { getAssetMap } from '../utils/sceneGraph';

const RENDER_BUFFER = 720;
const PRELOAD_BUFFER = 1440;

const EMPTY_RECT: ViewportRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  right: 0,
  bottom: 0,
};

interface UseVirtualWorldParams {
  viewportRef: RefObject<HTMLDivElement | null>;
  world: WorldInfo;
  assets: SceneAsset[];
  layers: SceneLayer[];
  zoom: number;
  imageCache: ImageCacheApi;
}

export function useVirtualWorld({
  viewportRef,
  world,
  assets,
  layers,
  zoom,
  imageCache,
}: UseVirtualWorldParams): {
  visibleLayers: SceneLayer[];
  viewportRect: ViewportRect;
} {
  const [viewportRect, setViewportRect] = useState<ViewportRect>(EMPTY_RECT);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    let frameId = 0;

    const updateViewport = () => {
      frameId = 0;
      setViewportRect(
        rectFromBounds(
          viewport.scrollLeft / zoom,
          viewport.scrollTop / zoom,
          viewport.clientWidth / zoom,
          viewport.clientHeight / zoom,
        ),
      );
    };

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateViewport);
    };

    updateViewport();
    viewport.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      viewport.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [viewportRef, zoom]);

  const renderRect = useMemo(
    () => expandRect(viewportRect, RENDER_BUFFER, world),
    [viewportRect, world],
  );

  const preloadRect = useMemo(
    () => expandRect(viewportRect, PRELOAD_BUFFER, world),
    [viewportRect, world],
  );

  const visibleLayers = useMemo(
    () =>
      layers
        .map((layer) => ({
          ...layer,
          nodes: layer.nodes.filter((node) =>
            intersects(renderRect, rectFromBounds(node.x, node.y, node.width, node.height)),
          ),
        }))
        .filter((layer) => layer.nodes.length > 0),
    [layers, renderRect],
  );

  const preloadNodes = useMemo(
    () =>
      layers.flatMap((layer) =>
        layer.nodes.filter((node) =>
          intersects(preloadRect, rectFromBounds(node.x, node.y, node.width, node.height)),
        ),
      ),
    [layers, preloadRect],
  );

  useEffect(() => {
    const assetMap = getAssetMap(assets);
    for (const node of preloadNodes) {
      const asset = assetMap.get(node.assetId);
      if (asset) {
        imageCache.preload(asset.src);
      }
    }
  }, [assets, imageCache, preloadNodes]);

  return { visibleLayers, viewportRect };
}
