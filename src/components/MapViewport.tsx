import type { RefObject } from 'react';
import type { CareerJob, CareerMapData } from '../types/careerMap';
import type { ImageCacheApi } from '../hooks/useImageCache';
import { useVirtualWorld } from '../hooks/useVirtualWorld';
import { FloorLabelLayer } from '../renderer/FloorLabelLayer';
import { SceneRenderer } from '../renderer/SceneRenderer';

interface MapViewportProps {
  data: CareerMapData;
  imageCache: ImageCacheApi;
  selectedJobId: string | null;
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  onSelectJob: (job: CareerJob) => void;
}

export function MapViewport({
  data,
  imageCache,
  selectedJobId,
  viewportRef,
  zoom,
  onSelectJob,
}: MapViewportProps) {
  const { visibleLayers, viewportRect } = useVirtualWorld({
    viewportRef,
    world: data.world,
    assets: data.assets,
    layers: data.layers,
    zoom,
    imageCache,
  });

  return (
    <section
      className="map-viewport"
      ref={viewportRef}
      aria-label={`${data.world.title} 탐색 영역`}
      tabIndex={0}
    >
      <div
        className="map-scroll-space"
        style={{
          width: data.world.width * zoom,
          height: data.world.height * zoom,
        }}
      >
        <div
          className="map-canvas"
          style={{
            width: data.world.width,
            height: data.world.height,
            transform: `scale(${zoom})`,
          }}
        >
          <SceneRenderer
            assets={data.assets}
            layers={visibleLayers}
            imageCache={imageCache}
            jobs={data.jobs}
            selectedJobId={selectedJobId}
            scrollLeft={viewportRect.left}
            scrollTop={viewportRect.top}
            onSelectJob={onSelectJob}
          />
          <FloorLabelLayer data={data} viewportRect={viewportRect} />
        </div>
      </div>
    </section>
  );
}
