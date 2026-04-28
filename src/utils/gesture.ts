export interface PointerState {
  x: number;
  y: number;
}

export const WHEEL_ZOOM_INTENSITY = 0.0015;

export function isBlockedPointerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      '.search-panel, .detail-panel, .map-controls, .scene-node-button, input, textarea, select, button, a',
    ),
  );
}

export function isBlockedWheelTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('.search-panel, .detail-panel, input, textarea, select'));
}

export function getDistance(a: PointerState, b: PointerState): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getMidpoint(a: PointerState, b: PointerState): PointerState {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}
