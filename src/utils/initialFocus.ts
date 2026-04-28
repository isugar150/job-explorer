import type { CareerJob, CareerMapData } from '../types/careerMap';
import { DEFAULT_ZOOM, getMapCenter } from './geometry';
import { getQueryJobId } from './jobQueryParams';
import { getInteractiveJobNode, getNodeFocusPoint } from './sceneGraph';

export interface InitialCameraFocus {
  x: number;
  y: number;
  zoom: number;
  job?: CareerJob;
  fromQuery: boolean;
}

export function resolveInitialFocus(data: CareerMapData): InitialCameraFocus {
  const queryJobId = getQueryJobId();
  const initialJobId = queryJobId ?? data.initialFocus.jobId;
  const initialJob = initialJobId
    ? data.jobs.find((job) => job.id === initialJobId)
    : undefined;

  if (initialJob) {
    const node = getInteractiveJobNode(data, initialJob.id);
    if (node) {
      const point = getNodeFocusPoint(node);
      return {
        x: point.x,
        y: point.y,
        zoom: queryJobId ? DEFAULT_ZOOM : data.initialFocus.zoom ?? DEFAULT_ZOOM,
        job: initialJob,
        fromQuery: Boolean(queryJobId),
      };
    }
  }

  if (
    typeof data.initialFocus.x === 'number' &&
    typeof data.initialFocus.y === 'number'
  ) {
    return {
      x: data.initialFocus.x,
      y: data.initialFocus.y,
      zoom: data.initialFocus.zoom ?? DEFAULT_ZOOM,
      fromQuery: false,
    };
  }

  if (data.world.initialCamera) {
    return {
      ...data.world.initialCamera,
      fromQuery: false,
    };
  }

  return {
    ...getMapCenter(data.world),
    zoom: DEFAULT_ZOOM,
    fromQuery: false,
  };
}
