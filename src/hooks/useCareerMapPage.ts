import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { CareerJob, CareerMapData } from '../types/careerMap';
import { useImageCache } from './useImageCache';
import { type CameraState, useMapNavigation } from './useMapNavigation';
import { useViewportGestures } from './useViewportGestures';
import { SELECTED_JOB_ZOOM } from '../utils/geometry';
import { searchJobs } from '../utils/searchJobs';
import { getInteractiveJobNode, getNodeFocusPoint } from '../utils/sceneGraph';
import { clearQueryJobId, setQueryJobId } from '../utils/jobQueryParams';
import { resolveInitialFocus } from '../utils/initialFocus';

interface UseCareerMapPageResult {
  imageCache: ReturnType<typeof useImageCache>;
  openJob: (job: CareerJob) => void;
  closeDetail: () => void;
  query: string;
  results: CareerJob[];
  searchOpen: boolean;
  selectedJob: CareerJob | null;
  selectedJobId: string | null;
  setQuery: (query: string) => void;
  setSearchOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
}

export function useCareerMapPage(data: CareerMapData): UseCareerMapPageResult {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const returnCameraRef = useRef<CameraState | null>(null);
  const imageCache = useImageCache(28);
  const {
    zoom,
    zoomAtViewportPoint,
    panBy,
    centerOnPoint,
    getCameraState,
    restoreCameraState,
  } = useMapNavigation(viewportRef, data.world);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const selectedJob = useMemo(
    () => data.jobs.find((job) => job.id === selectedJobId) ?? null,
    [data.jobs, selectedJobId],
  );

  const results = useMemo(() => searchJobs(data.jobs, query), [data.jobs, query]);

  useViewportGestures({
    viewportRef,
    zoom,
    zoomAtViewportPoint,
    panBy,
  });

  const openJob = useCallback(
    (job: CareerJob) => {
      const node = getInteractiveJobNode(data, job.id);
      if (!node) {
        return;
      }

      if (!selectedJobId) {
        returnCameraRef.current = getCameraState();
      }

      const point = getNodeFocusPoint(node);
      setSelectedJobId(job.id);
      centerOnPoint(point.x, point.y, SELECTED_JOB_ZOOM);
      setQueryJobId(job.id);
      setSearchOpen(false);
    },
    [centerOnPoint, data, getCameraState, selectedJobId],
  );

  const closeDetail = useCallback(() => {
    setSelectedJobId(null);
    clearQueryJobId();

    if (returnCameraRef.current) {
      restoreCameraState(returnCameraRef.current);
      returnCameraRef.current = null;
    }
  }, [restoreCameraState]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const initialFocus = resolveInitialFocus(data);

    if (initialFocus.job && initialFocus.fromQuery) {
      setSelectedJobId(initialFocus.job.id);
      centerOnPoint(initialFocus.x, initialFocus.y, SELECTED_JOB_ZOOM, 'auto');
      return;
    }

    centerOnPoint(initialFocus.x, initialFocus.y, initialFocus.zoom, 'auto');
  }, [centerOnPoint, data]);

  return {
    imageCache,
    openJob,
    closeDetail,
    query,
    results,
    searchOpen,
    selectedJob,
    selectedJobId,
    setQuery,
    setSearchOpen,
    viewportRef,
    zoom,
  };
}
