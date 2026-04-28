import { type Dispatch, type RefObject, type SetStateAction, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { WorldInfo } from '../types/careerMap';
import {
  CAMERA_ANIMATION_MS,
  type CameraState,
  clampCamera,
  clampZoom,
  easeOutCubic,
  getCameraBounds,
} from '../utils/camera';
import { clamp } from '../utils/geometry';

interface UseCameraAnimationParams {
  map: WorldInfo;
  setZoomState: Dispatch<SetStateAction<number>>;
  viewportRef: RefObject<HTMLDivElement | null>;
  zoomRef: { current: number };
}

interface UseCameraAnimationResult {
  animateCameraTo: (target: CameraState, behavior: ScrollBehavior) => void;
  cancelAnimation: () => void;
  setZoomAndScroll: (
    nextZoom: number,
    nextLeft: number,
    nextTop: number,
    options?: { flush?: boolean },
  ) => void;
}

export function useCameraAnimation({
  map,
  setZoomState,
  viewportRef,
  zoomRef,
}: UseCameraAnimationParams): UseCameraAnimationResult {
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const setZoomAndScroll = useCallback(
    (
      nextZoom: number,
      nextLeft: number,
      nextTop: number,
      options: { flush?: boolean } = { flush: true },
    ) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const safeZoom = clampZoom(nextZoom, viewport, map);
      const { maxLeft, maxTop } = getCameraBounds(viewport, map, safeZoom);
      const nextCamera = {
        left: clamp(nextLeft, 0, maxLeft),
        top: clamp(nextTop, 0, maxTop),
      };

      zoomRef.current = safeZoom;
      const scroll = () => {
        viewport.scrollTo({
          left: nextCamera.left,
          top: nextCamera.top,
          behavior: 'auto',
        });
      };

      if (options.flush) {
        flushSync(() => setZoomState(safeZoom));
        scroll();
        return;
      }

      setZoomState(safeZoom);
      window.requestAnimationFrame(scroll);
    },
    [map, setZoomState, viewportRef, zoomRef],
  );

  const animateCameraTo = useCallback(
    (target: CameraState, behavior: ScrollBehavior) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      cancelAnimation();
      const start = {
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        zoom: zoomRef.current,
      };
      const end = clampCamera(target, viewport, map);

      if (behavior === 'auto') {
        setZoomAndScroll(end.zoom, end.scrollLeft, end.scrollTop, { flush: false });
        return;
      }

      const startedAt = window.performance.now();
      const step = (now: number) => {
        const progress = clamp((now - startedAt) / CAMERA_ANIMATION_MS, 0, 1);
        const eased = easeOutCubic(progress);

        setZoomAndScroll(
          start.zoom + (end.zoom - start.zoom) * eased,
          start.scrollLeft + (end.scrollLeft - start.scrollLeft) * eased,
          start.scrollTop + (end.scrollTop - start.scrollTop) * eased,
        );

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    },
    [cancelAnimation, map, setZoomAndScroll, viewportRef, zoomRef],
  );

  return {
    animateCameraTo,
    cancelAnimation,
    setZoomAndScroll,
  };
}
