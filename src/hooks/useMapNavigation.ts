import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { WorldInfo } from '../types/careerMap';
import { DEFAULT_ZOOM } from '../utils/geometry';
import {
  type CameraState,
  clampZoom,
  getAnchoredZoomCamera,
  getCenteredCamera,
} from '../utils/camera';
import { useCameraAnimation } from './useCameraAnimation';

export type { CameraState } from '../utils/camera';

interface UseMapNavigationResult {
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomAtViewportPoint: (clientX: number, clientY: number, targetZoom: number) => void;
  panBy: (deltaX: number, deltaY: number) => void;
  centerOnPoint: (x: number, y: number, targetZoom?: number, behavior?: ScrollBehavior) => void;
  resetZoom: () => void;
  getCameraState: () => CameraState | null;
  restoreCameraState: (camera: CameraState, behavior?: ScrollBehavior) => void;
}

export function useMapNavigation(
  viewportRef: RefObject<HTMLDivElement | null>,
  map: WorldInfo,
): UseMapNavigationResult {
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const { animateCameraTo, cancelAnimation, setZoomAndScroll } = useCameraAnimation({
    map,
    setZoomState,
    viewportRef,
    zoomRef,
  });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const setZoom = useCallback((nextZoom: number) => {
    cancelAnimation();
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const safeZoom = clampZoom(nextZoom, viewport, map);
    zoomRef.current = safeZoom;
    setZoomState(safeZoom);
  }, [cancelAnimation, map, viewportRef]);

  const zoomAtViewportPoint = useCallback(
    (clientX: number, clientY: number, targetZoom: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      cancelAnimation();
      const currentZoom = zoomRef.current;
      const nextCamera = getAnchoredZoomCamera(
        clientX,
        clientY,
        targetZoom,
        viewport,
        map,
        currentZoom,
      );
      if (Math.abs(currentZoom - nextCamera.zoom) < 0.001) {
        return;
      }

      setZoomAndScroll(nextCamera.zoom, nextCamera.scrollLeft, nextCamera.scrollTop);
    },
    [cancelAnimation, map, setZoomAndScroll, viewportRef],
  );

  const panBy = useCallback(
    (deltaX: number, deltaY: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      cancelAnimation();
      viewport.scrollLeft += deltaX;
      viewport.scrollTop += deltaY;
    },
    [cancelAnimation, viewportRef],
  );

  const centerOnPoint = useCallback(
    (
      x: number,
      y: number,
      targetZoom = zoom,
      behavior: ScrollBehavior = 'smooth',
    ) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      animateCameraTo(getCenteredCamera(x, y, targetZoom, viewport, map), behavior);
    },
    [animateCameraTo, map, viewportRef, zoom],
  );

  const resetZoom = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    cancelAnimation();
    const safeZoom = clampZoom(DEFAULT_ZOOM, viewport, map);
    zoomRef.current = safeZoom;
    setZoomState(safeZoom);
  }, [cancelAnimation, map, viewportRef]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const syncZoomFloor = () => {
      const safeZoom = clampZoom(zoomRef.current, viewport, map);
      if (Math.abs(safeZoom - zoomRef.current) < 0.001) {
        return;
      }

      setZoomAndScroll(safeZoom, viewport.scrollLeft, viewport.scrollTop, { flush: false });
    };

    syncZoomFloor();
    window.addEventListener('resize', syncZoomFloor);

    return () => window.removeEventListener('resize', syncZoomFloor);
  }, [map, setZoomAndScroll, viewportRef]);

  const getCameraState = useCallback((): CameraState | null => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return null;
    }

    return {
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      zoom: zoomRef.current,
    };
  }, [viewportRef]);

  const restoreCameraState = useCallback(
    (camera: CameraState, behavior: ScrollBehavior = 'smooth') => {
      animateCameraTo(camera, behavior);
    },
    [animateCameraTo],
  );

  return {
    viewportRef,
    zoom,
    setZoom,
    zoomAtViewportPoint,
    panBy,
    centerOnPoint,
    resetZoom,
    getCameraState,
    restoreCameraState,
  };
}
