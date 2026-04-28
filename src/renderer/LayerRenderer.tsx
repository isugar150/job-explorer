import type { ImageCacheApi } from '../hooks/useImageCache';
import type { CareerJob, SceneAsset, SceneLayer, SceneNode } from '../types/careerMap';

interface LayerRendererProps {
  assetMap: Map<string, SceneAsset>;
  imageCache: ImageCacheApi;
  jobMap: Map<string, CareerJob>;
  layer: SceneLayer;
  scrollLeft: number;
  scrollTop: number;
  selectedJobId: string | null;
  onSelectJob: (job: CareerJob) => void;
}

function getParallaxStyle(node: SceneNode, layer: SceneLayer, scrollLeft: number, scrollTop: number) {
  return {
    left: node.x + scrollLeft * (1 - layer.parallax),
    top: node.y + scrollTop * (1 - layer.parallax),
    width: node.width,
    height: node.height,
  };
}

export function LayerRenderer({
  assetMap,
  imageCache,
  jobMap,
  layer,
  scrollLeft,
  scrollTop,
  selectedJobId,
  onSelectJob,
}: LayerRendererProps) {
  return (
    <div className={`scene-layer scene-layer-${layer.kind}`} style={{ zIndex: layer.zIndex }}>
      {layer.nodes.map((node) => {
        const asset = assetMap.get(node.assetId);
        if (!asset) {
          return null;
        }

        const style = getParallaxStyle(node, layer, scrollLeft, scrollTop);
        const selected = Boolean(node.jobId && selectedJobId === node.jobId);

        if (node.interactive && node.jobId) {
          const job = jobMap.get(node.jobId);
          if (!job) {
            return null;
          }

          return (
            <button
              key={node.id}
              className={`scene-node scene-node-button${selected ? ' selected' : ''}`}
              type="button"
              aria-label={`${job.title} 상세 보기, ${job.site} ${job.level}`}
              aria-pressed={selected}
              style={style}
              onClick={() => onSelectJob(job)}
            >
              <img
                src={asset.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={() => imageCache.markUsed(asset.src)}
              />
              <span>{job.title}</span>
            </button>
          );
        }

        return (
          <img
            key={node.id}
            className="scene-node scene-node-image"
            src={asset.src}
            alt={asset.alt ?? node.label ?? ''}
            style={style}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => imageCache.markUsed(asset.src)}
          />
        );
      })}
    </div>
  );
}
