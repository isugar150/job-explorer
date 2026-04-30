import { useMemo } from 'react';
import type { ImageCacheApi } from '../hooks/useImageCache';
import type { CareerJob, SceneAsset, SceneLayer, WorldInfo } from '../types/careerMap';
import { getAssetMap } from '../utils/sceneGraph';
import { LayerRenderer } from './LayerRenderer';

interface SceneRendererProps {
  assets: SceneAsset[];
  editMode: boolean;
  layers: SceneLayer[];
  imageCache: ImageCacheApi;
  jobs: CareerJob[];
  selectedJobId: string | null;
  scrollLeft: number;
  scrollTop: number;
  world: WorldInfo;
  zoom: number;
  onCommitSceneEdit: () => void;
  onMoveNode: (layerId: string, nodeId: string, x: number, y: number) => void;
  onSelectJob: (job: CareerJob) => void;
}

export function SceneRenderer({
  assets,
  editMode,
  layers,
  imageCache,
  jobs,
  selectedJobId,
  scrollLeft,
  scrollTop,
  world,
  zoom,
  onCommitSceneEdit,
  onMoveNode,
  onSelectJob,
}: SceneRendererProps) {
  const assetMap = useMemo(() => getAssetMap(assets), [assets]);
  const jobMap = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const orderedLayers = useMemo(
    () => layers.slice().sort((a, b) => a.zIndex - b.zIndex),
    [layers],
  );

  return (
    <>
      {orderedLayers.map((layer) => (
        <LayerRenderer
          key={layer.id}
          assetMap={assetMap}
          editMode={editMode}
          imageCache={imageCache}
          jobMap={jobMap}
          layer={layer}
          scrollLeft={scrollLeft}
          scrollTop={scrollTop}
          selectedJobId={selectedJobId}
          world={world}
          zoom={zoom}
          onCommitSceneEdit={onCommitSceneEdit}
          onMoveNode={onMoveNode}
          onSelectJob={onSelectJob}
        />
      ))}
    </>
  );
}
