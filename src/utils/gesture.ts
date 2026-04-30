export interface PointerState {
  x: number;
  y: number;
}

export const WHEEL_ZOOM_INTENSITY = 0.0015;

interface BlockedPointerTargetOptions {
  allowSceneNodes?: boolean;
}

export function isBlockedPointerTarget(
  target: EventTarget | null,
  options: BlockedPointerTargetOptions = {},
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const blockedSelectors = [
    '.search-panel',
    '.detail-panel',
    '.edit-panel',
    '.map-controls',
    'input',
    'textarea',
    'select',
    'button:not(.scene-node-button)',
    'a',
  ];

  if (!options.allowSceneNodes) {
    blockedSelectors.push('.scene-node-editable', '.scene-node-button');
  }

  return Boolean(
    target.closest(blockedSelectors.join(', ')),
  );
}

export function isBlockedWheelTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('.search-panel, .detail-panel, .edit-panel, input, textarea, select'));
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
