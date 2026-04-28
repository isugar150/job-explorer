import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { WorldInfo } from '../types/careerMap';
import { clamp, DEFAULT_ZOOM } from '../utils/geometry';

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;

interface UseMapNavigationResult {
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomAtViewportPoint: (clientX: number, clientY: number, targetZoom: number) => void;
  panBy: (deltaX: number, deltaY: number) => void;
  centerOnPoint: (x: number, y: number, targetZoom?: number, behavior?: ScrollBehavior) => void;
  resetZoom: () => void;
}

export function useMapNavigation(
  viewportRef: RefObject<HTMLDivElement | null>,
  map: WorldInfo,
): UseMapNavigationResult {
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const zoomRef = useRef(DEFAULT_ZOOM);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const scrollToPoint = useCallback(
    (x: number, y: number, targetZoom: number, behavior: ScrollBehavior) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const maxLeft = Math.max(0, map.width * targetZoom - viewport.clientWidth);
      const maxTop = Math.max(0, map.height * targetZoom - viewport.clientHeight);
      const left = clamp(x * targetZoom - viewport.clientWidth / 2, 0, maxLeft);
      const top = clamp(y * targetZoom - viewport.clientHeight / 2, 0, maxTop);

      viewport.scrollTo({ left, top, behavior });
    },
    [map.height, map.width, viewportRef],
  );

  const setZoom = useCallback((nextZoom: number) => {
    const safeZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    zoomRef.current = safeZoom;
    setZoomState(safeZoom);
  }, []);

  const zoomAtViewportPoint = useCallback(
    (clientX: number, clientY: number, targetZoom: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const currentZoom = zoomRef.current;
      const safeZoom = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM);
      if (Math.abs(currentZoom - safeZoom) < 0.001) {
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      const worldX = (viewport.scrollLeft + offsetX) / currentZoom;
      const worldY = (viewport.scrollTop + offsetY) / currentZoom;
      const maxLeft = Math.max(0, map.width * safeZoom - viewport.clientWidth);
      const maxTop = Math.max(0, map.height * safeZoom - viewport.clientHeight);

      zoomRef.current = safeZoom;
      flushSync(() => {
        setZoomState(safeZoom);
      });

      viewport.scrollTo({
        left: clamp(worldX * safeZoom - offsetX, 0, maxLeft),
        top: clamp(worldY * safeZoom - offsetY, 0, maxTop),
        behavior: 'auto',
      });
    },
    [map.height, map.width, viewportRef],
  );

  const panBy = useCallback(
    (deltaX: number, deltaY: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      viewport.scrollLeft += deltaX;
      viewport.scrollTop += deltaY;
    },
    [viewportRef],
  );

  const centerOnPoint = useCallback(
    (
      x: number,
      y: number,
      targetZoom = zoom,
      behavior: ScrollBehavior = 'smooth',
    ) => {
      const safeZoom = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM);
      zoomRef.current = safeZoom;
      setZoomState(safeZoom);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => scrollToPoint(x, y, safeZoom, behavior));
      });
    },
    [scrollToPoint, zoom],
  );

  const resetZoom = useCallback(() => {
    zoomRef.current = DEFAULT_ZOOM;
    setZoomState(DEFAULT_ZOOM);
  }, []);

  return {
    viewportRef,
    zoom,
    setZoom,
    zoomAtViewportPoint,
    panBy,
    centerOnPoint,
    resetZoom,
  };
}
