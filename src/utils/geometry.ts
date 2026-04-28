import type { ViewportRect, WorldInfo } from '../types/careerMap';

export const DEFAULT_ZOOM = 1;
export const SELECTED_JOB_ZOOM = 1.75;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function intersects(a: ViewportRect, b: ViewportRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function rectFromBounds(
  left: number,
  top: number,
  width: number,
  height: number,
): ViewportRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

export function expandRect(rect: ViewportRect, buffer: number, map: WorldInfo): ViewportRect {
  const left = clamp(rect.left - buffer, 0, map.width);
  const top = clamp(rect.top - buffer, 0, map.height);
  const right = clamp(rect.right + buffer, 0, map.width);
  const bottom = clamp(rect.bottom + buffer, 0, map.height);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function getMapCenter(map: WorldInfo): { x: number; y: number } {
  return { x: map.width / 2, y: map.height / 2 };
}
