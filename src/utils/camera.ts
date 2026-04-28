import type { WorldInfo } from '../types/careerMap';
import { clamp, DEFAULT_ZOOM } from './geometry';

export const MAX_ZOOM = 3;
export const CAMERA_ANIMATION_MS = 520;

export interface CameraState {
  scrollLeft: number;
  scrollTop: number;
  zoom: number;
}

export function getMinimumZoom(viewport: HTMLDivElement, map: WorldInfo): number {
  if (viewport.clientWidth <= 0 || viewport.clientHeight <= 0) {
    return DEFAULT_ZOOM;
  }

  return Math.min(
    MAX_ZOOM,
    Math.max(viewport.clientWidth / map.width, viewport.clientHeight / map.height),
  );
}

export function clampZoom(nextZoom: number, viewport: HTMLDivElement, map: WorldInfo): number {
  return clamp(nextZoom, getMinimumZoom(viewport, map), MAX_ZOOM);
}

export function getCameraBounds(
  viewport: HTMLDivElement,
  map: WorldInfo,
  zoom: number,
): { maxLeft: number; maxTop: number } {
  return {
    maxLeft: Math.max(0, map.width * zoom - viewport.clientWidth),
    maxTop: Math.max(0, map.height * zoom - viewport.clientHeight),
  };
}

export function clampCamera(
  camera: CameraState,
  viewport: HTMLDivElement,
  map: WorldInfo,
): CameraState {
  const safeZoom = clampZoom(camera.zoom, viewport, map);
  const { maxLeft, maxTop } = getCameraBounds(viewport, map, safeZoom);

  return {
    scrollLeft: clamp(camera.scrollLeft, 0, maxLeft),
    scrollTop: clamp(camera.scrollTop, 0, maxTop),
    zoom: safeZoom,
  };
}

export function getCenteredCamera(
  x: number,
  y: number,
  targetZoom: number,
  viewport: HTMLDivElement,
  map: WorldInfo,
): CameraState {
  const safeZoom = clampZoom(targetZoom, viewport, map);
  const { maxLeft, maxTop } = getCameraBounds(viewport, map, safeZoom);

  return {
    scrollLeft: clamp(x * safeZoom - viewport.clientWidth / 2, 0, maxLeft),
    scrollTop: clamp(y * safeZoom - viewport.clientHeight / 2, 0, maxTop),
    zoom: safeZoom,
  };
}

export function getAnchoredZoomCamera(
  clientX: number,
  clientY: number,
  targetZoom: number,
  viewport: HTMLDivElement,
  map: WorldInfo,
  currentZoom: number,
): CameraState {
  const safeZoom = clampZoom(targetZoom, viewport, map);
  const rect = viewport.getBoundingClientRect();
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;
  const worldX = (viewport.scrollLeft + offsetX) / currentZoom;
  const worldY = (viewport.scrollTop + offsetY) / currentZoom;

  return clampCamera(
    {
      scrollLeft: worldX * safeZoom - offsetX,
      scrollTop: worldY * safeZoom - offsetY,
      zoom: safeZoom,
    },
    viewport,
    map,
  );
}

export function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}
