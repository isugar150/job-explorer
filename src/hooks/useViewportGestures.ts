import { RefObject, useEffect, useRef } from 'react';

interface UseViewportGesturesParams {
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  zoomAtViewportPoint: (clientX: number, clientY: number, targetZoom: number) => void;
  panBy: (deltaX: number, deltaY: number) => void;
}

interface PointerState {
  x: number;
  y: number;
}

const WHEEL_ZOOM_INTENSITY = 0.0015;

function isBlockedGestureTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      '.search-panel, .detail-panel, .map-controls, .scene-node-button, input, textarea, select, button, a',
    ),
  );
}

function getDistance(a: PointerState, b: PointerState): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getMidpoint(a: PointerState, b: PointerState): PointerState {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function useViewportGestures({
  viewportRef,
  zoom,
  zoomAtViewportPoint,
  panBy,
}: UseViewportGesturesParams): void {
  const zoomRef = useRef(zoom);
  const pointersRef = useRef(new Map<number, PointerState>());
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  });
  const pinchRef = useRef<{
    active: boolean;
    distance: number;
    zoom: number;
  }>({
    active: false,
    distance: 0,
    zoom,
  });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    const handleWheel = (event: WheelEvent) => {
      if (isBlockedGestureTarget(event.target)) {
        return;
      }

      event.preventDefault();
      const nextZoom = zoomRef.current * Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY);
      zoomAtViewportPoint(event.clientX, event.clientY, nextZoom);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isBlockedGestureTarget(event.target)) {
        return;
      }

      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointersRef.current.size === 1) {
        dragRef.current = {
          active: true,
          pointerId: event.pointerId,
          lastX: event.clientX,
          lastY: event.clientY,
        };
        try {
          viewport.setPointerCapture(event.pointerId);
        } catch {
          // Browser automation can dispatch synthetic pointer events without capture support.
        }
      }

      if (pointersRef.current.size === 2) {
        const [first, second] = Array.from(pointersRef.current.values());
        dragRef.current.active = false;
        pinchRef.current = {
          active: true,
          distance: getDistance(first, second),
          zoom: zoomRef.current,
        };
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointers = pointersRef.current;
      if (!pointers.has(event.pointerId)) {
        return;
      }

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size >= 2 && pinchRef.current.active) {
        event.preventDefault();
        const [first, second] = Array.from(pointers.values());
        const distance = getDistance(first, second);
        if (pinchRef.current.distance > 0) {
          const midpoint = getMidpoint(first, second);
          const nextZoom = pinchRef.current.zoom * (distance / pinchRef.current.distance);
          zoomAtViewportPoint(midpoint.x, midpoint.y, nextZoom);
        }
        return;
      }

      const drag = dragRef.current;
      if (!drag.active || drag.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      panBy(drag.lastX - event.clientX, drag.lastY - event.clientY);
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
    };

    const clearPointer = (event: PointerEvent) => {
      pointersRef.current.delete(event.pointerId);

      if (dragRef.current.pointerId === event.pointerId) {
        dragRef.current.active = false;
        dragRef.current.pointerId = null;
      }

      if (pointersRef.current.size < 2) {
        pinchRef.current.active = false;
      }

      if (pointersRef.current.size === 1) {
        const [[pointerId, pointer]] = Array.from(pointersRef.current.entries());
        dragRef.current = {
          active: true,
          pointerId,
          lastX: pointer.x,
          lastY: pointer.y,
        };
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('pointerdown', handlePointerDown);
    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', clearPointer);
    viewport.addEventListener('pointercancel', clearPointer);

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('pointerdown', handlePointerDown);
      viewport.removeEventListener('pointermove', handlePointerMove);
      viewport.removeEventListener('pointerup', clearPointer);
      viewport.removeEventListener('pointercancel', clearPointer);
    };
  }, [panBy, viewportRef, zoomAtViewportPoint]);
}
