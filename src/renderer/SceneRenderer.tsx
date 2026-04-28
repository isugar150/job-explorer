import { useMemo } from 'react';
import type { ImageCacheApi } from '../hooks/useImageCache';
import type { CareerJob, SceneAsset, SceneLayer } from '../types/careerMap';
import { getAssetMap } from '../utils/sceneGraph';
import { LayerRenderer } from './LayerRenderer';

interface SceneRendererProps {
  assets: SceneAsset[];
  layers: SceneLayer[];
  imageCache: ImageCacheApi;
  jobs: CareerJob[];
  selectedJobId: string | null;
  scrollLeft: number;
  scrollTop: number;
  onSelectJob: (job: CareerJob) => void;
}

export function SceneRenderer({
  assets,
  layers,
  imageCache,
  jobs,
  selectedJobId,
  scrollLeft,
  scrollTop,
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
          imageCache={imageCache}
          jobMap={jobMap}
          layer={layer}
          scrollLeft={scrollLeft}
          scrollTop={scrollTop}
          selectedJobId={selectedJobId}
          onSelectJob={onSelectJob}
        />
      ))}
    </>
  );
}
