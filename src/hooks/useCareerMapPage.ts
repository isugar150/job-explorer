import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { CareerJob, CareerMapData } from '../types/careerMap';
import { useImageCache } from './useImageCache';
import { type CameraState, useMapNavigation } from './useMapNavigation';
import { useViewportGestures } from './useViewportGestures';
import { getMinimumZoom } from '../utils/camera';
import { SELECTED_JOB_ZOOM } from '../utils/geometry';
import { searchJobs } from '../utils/searchJobs';
import { getInteractiveJobNode, getNodeFocusPoint } from '../utils/sceneGraph';
import { clearQueryJobId, setQueryJobId } from '../utils/jobQueryParams';
import { resolveInitialFocus } from '../utils/initialFocus';
import { useSceneEditor } from './useSceneEditor';

interface UseCareerMapPageResult {
  copyEditorJson: () => Promise<void>;
  copyState: 'idle' | 'copied' | 'failed';
  data: CareerMapData;
  editMode: boolean;
  editedNodeCount: number;
  editorJson: string;
  imageCache: ReturnType<typeof useImageCache>;
  lastEditedNodeId: string | null;
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
  commitEditorJson: () => void;
  moveEditorNode: (layerId: string, nodeId: string, x: number, y: number) => void;
}

export function useCareerMapPage(data: CareerMapData): UseCareerMapPageResult {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const returnCameraRef = useRef<CameraState | null>(null);
  const imageCache = useImageCache(28);
  const {
    copyEditorJson,
    copyState,
    editMode,
    editedNodeCount,
    editorJson,
    lastEditedNodeId,
    sceneData,
    commitEditorJson,
    moveEditorNode,
  } = useSceneEditor(data);
  const {
    zoom,
    zoomAtViewportPoint,
    panBy,
    centerOnPoint,
    getCameraState,
    restoreCameraState,
  } = useMapNavigation(viewportRef, sceneData.world);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const selectedJob = useMemo(
    () => sceneData.jobs.find((job) => job.id === selectedJobId) ?? null,
    [sceneData.jobs, selectedJobId],
  );

  const results = useMemo(() => searchJobs(sceneData.jobs, query), [sceneData.jobs, query]);

  useViewportGestures({
    editMode,
    viewportRef,
    zoom,
    zoomAtViewportPoint,
    panBy,
  });

  const openJob = useCallback(
    (job: CareerJob) => {
      const node = getInteractiveJobNode(sceneData, job.id);
      if (!node) {
        return;
      }

      const point = getNodeFocusPoint(node);
      if (editMode) {
        centerOnPoint(point.x, point.y, SELECTED_JOB_ZOOM);
        setSearchOpen(false);
        return;
      }

      if (!selectedJobId) {
        returnCameraRef.current = getCameraState();
      }

      setSelectedJobId(job.id);
      centerOnPoint(point.x, point.y, SELECTED_JOB_ZOOM);
      setQueryJobId(job.id);
      setSearchOpen(false);
    },
    [centerOnPoint, editMode, getCameraState, sceneData, selectedJobId],
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
    const initialFocus = resolveInitialFocus(sceneData);
    const viewport = viewportRef.current;
    const minimumZoom = viewport ? getMinimumZoom(viewport, sceneData.world) : initialFocus.zoom;

    if (initialFocus.job && initialFocus.fromQuery) {
      if (!editMode) {
        setSelectedJobId(initialFocus.job.id);
      }
      centerOnPoint(initialFocus.x, initialFocus.y, SELECTED_JOB_ZOOM, 'auto');
      return;
    }

    centerOnPoint(initialFocus.x, initialFocus.y, minimumZoom, 'auto');
  }, [centerOnPoint, editMode, sceneData, viewportRef]);

  return {
    copyEditorJson,
    copyState,
    data: sceneData,
    editMode,
    editedNodeCount,
    editorJson,
    imageCache,
    lastEditedNodeId,
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
    commitEditorJson,
    moveEditorNode,
  };
}
