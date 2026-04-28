import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import careerMapJson from '../data/careerMap.json';
import type { CareerJob, CareerMapData } from '../types/careerMap';
import { useImageCache } from '../hooks/useImageCache';
import { useMapNavigation } from '../hooks/useMapNavigation';
import { useViewportGestures } from '../hooks/useViewportGestures';
import { getMapCenter, SELECTED_JOB_ZOOM } from '../utils/geometry';
import { withResolvedAssetSrc } from '../utils/asset';
import { searchJobs } from '../utils/searchJobs';
import { getInteractiveJobNode, getNodeFocusPoint } from '../utils/sceneGraph';
import { MapViewport } from './MapViewport';
import { SearchPanel } from './SearchPanel';
import { DetailPanel } from './DetailPanel';
import { MapControls } from './MapControls';

const careerMap = {
  ...(careerMapJson as CareerMapData),
  assets: withResolvedAssetSrc((careerMapJson as CareerMapData).assets),
} as CareerMapData;

function resolveInitialJob(jobs: CareerJob[]): CareerJob | undefined {
  const params = new URLSearchParams(window.location.search);
  const queryJobId = params.get('job');
  if (queryJobId) {
    return jobs.find((job) => job.id === queryJobId);
  }

  if (careerMap.initialFocus.jobId) {
    return jobs.find((job) => job.id === careerMap.initialFocus.jobId);
  }

  return undefined;
}

export function CareerMapPage() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const imageCache = useImageCache(28);
  const { zoom, setZoom, zoomAtViewportPoint, panBy, centerOnPoint, resetZoom } = useMapNavigation(
    viewportRef,
    careerMap.world,
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const selectedJob = useMemo(
    () => careerMap.jobs.find((job) => job.id === selectedJobId) ?? null,
    [selectedJobId],
  );

  const results = useMemo(() => searchJobs(careerMap.jobs, query), [query]);

  useViewportGestures({
    viewportRef,
    zoom,
    zoomAtViewportPoint,
    panBy,
  });

  const openJob = useCallback(
    (job: CareerJob) => {
      const node = getInteractiveJobNode(careerMap, job.id);
      if (!node) {
        return;
      }

      const point = getNodeFocusPoint(node);
      setSelectedJobId(job.id);
      centerOnPoint(point.x, point.y, SELECTED_JOB_ZOOM);
      const params = new URLSearchParams(window.location.search);
      params.set('job', job.id);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    },
    [centerOnPoint],
  );

  const closeDetail = useCallback(() => {
    setSelectedJobId(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('job');
    const nextUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, []);

  const resetView = useCallback(() => {
    resetZoom();
    closeDetail();
    const center = getMapCenter(careerMap.world);
    centerOnPoint(center.x, center.y, 1, 'smooth');
  }, [centerOnPoint, closeDetail, resetZoom]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const initialJob = resolveInitialJob(careerMap.jobs);
    const queryHasJob = new URLSearchParams(window.location.search).has('job');

    if (initialJob) {
      const node = getInteractiveJobNode(careerMap, initialJob.id);
      if (!node) {
        return;
      }

      const point = getNodeFocusPoint(node);
      if (queryHasJob) {
        setSelectedJobId(initialJob.id);
        centerOnPoint(point.x, point.y, SELECTED_JOB_ZOOM, 'auto');
        return;
      }

      centerOnPoint(point.x, point.y, careerMap.initialFocus.zoom ?? 1, 'auto');
      return;
    }

    if (
      typeof careerMap.initialFocus.x === 'number' &&
      typeof careerMap.initialFocus.y === 'number'
    ) {
      centerOnPoint(
        careerMap.initialFocus.x,
        careerMap.initialFocus.y,
        careerMap.initialFocus.zoom ?? 1,
        'auto',
      );
      return;
    }

    if (careerMap.world.initialCamera) {
      centerOnPoint(
        careerMap.world.initialCamera.x,
        careerMap.world.initialCamera.y,
        careerMap.world.initialCamera.zoom,
        'auto',
      );
      return;
    }

    const center = getMapCenter(careerMap.world);
    centerOnPoint(center.x, center.y, 1, 'auto');
  }, [centerOnPoint]);

  return (
    <main className={`career-map-page${selectedJob ? ' has-detail' : ''}`}>
      <SearchPanel
        query={query}
        results={results}
        totalCount={careerMap.jobs.length}
        onQueryChange={setQuery}
        onSelectJob={openJob}
      />
      <MapViewport
        data={careerMap}
        imageCache={imageCache}
        selectedJobId={selectedJobId}
        viewportRef={viewportRef}
        zoom={zoom}
        onSelectJob={openJob}
      />
      <MapControls
        zoom={zoom}
        onZoomIn={() => setZoom(zoom + 0.25)}
        onZoomOut={() => setZoom(zoom - 0.25)}
        onReset={resetView}
      />
      <DetailPanel job={selectedJob} onClose={closeDetail} />
    </main>
  );
}
