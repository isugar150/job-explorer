import { useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import type { ImageCacheApi } from '../hooks/useImageCache';
import type { CareerJob, SceneAsset, SceneLayer, SceneNode, WorldInfo } from '../types/careerMap';
import { clamp } from '../utils/geometry';

interface LayerRendererProps {
  assetMap: Map<string, SceneAsset>;
  editMode: boolean;
  imageCache: ImageCacheApi;
  jobMap: Map<string, CareerJob>;
  layer: SceneLayer;
  scrollLeft: number;
  scrollTop: number;
  selectedJobId: string | null;
  world: WorldInfo;
  zoom: number;
  onCommitSceneEdit: () => void;
  onMoveNode: (layerId: string, nodeId: string, x: number, y: number) => void;
  onSelectJob: (job: CareerJob) => void;
}

interface NodeDragState {
  nodeId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
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
  editMode,
  imageCache,
  jobMap,
  layer,
  scrollLeft,
  scrollTop,
  selectedJobId,
  world,
  zoom,
  onCommitSceneEdit,
  onMoveNode,
  onSelectJob,
}: LayerRendererProps) {
  const dragRef = useRef<NodeDragState | null>(null);

  const startNodeDrag = (event: PointerEvent<HTMLElement>, node: SceneNode) => {
    if (!editMode || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      nodeId: node.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: node.x,
      startY: node.y,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer tests can run without capture support.
    }
  };

  const moveNodeDrag = (event: PointerEvent<HTMLElement>, node: SceneNode) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.nodeId !== node.id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const deltaX = (event.clientX - drag.startClientX) / zoom;
    const deltaY = (event.clientY - drag.startClientY) / zoom;
    const maxX = Math.max(0, world.width - node.width);
    const maxY = Math.max(0, world.height - node.height);
    const x = clamp(Math.round(drag.startX + deltaX), 0, maxX);
    const y = clamp(Math.round(drag.startY + deltaY), 0, maxY);
    onMoveNode(layer.id, node.id, x, y);
  };

  const stopNodeDrag = (event: PointerEvent<HTMLElement>, node: SceneNode) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.nodeId !== node.id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture can already be gone after a browser-level cancel.
    }
    onCommitSceneEdit();
  };

  const stopEditClick = (event: MouseEvent<HTMLElement>) => {
    if (!editMode) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

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
              className={`scene-node scene-node-button${selected ? ' selected' : ''}${
                editMode ? ' scene-node-editable' : ''
              }`}
              type="button"
              aria-label={`${job.title} detail, ${job.site} ${job.level}`}
              aria-pressed={selected}
              data-node-id={node.id}
              style={style}
              onClick={editMode ? stopEditClick : () => onSelectJob(job)}
              onPointerCancel={(event) => stopNodeDrag(event, node)}
              onPointerDown={(event) => startNodeDrag(event, node)}
              onPointerMove={(event) => moveNodeDrag(event, node)}
              onPointerUp={(event) => stopNodeDrag(event, node)}
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
            className={`scene-node scene-node-image${editMode ? ' scene-node-editable' : ''}`}
            src={asset.src}
            alt={asset.alt ?? node.label ?? ''}
            data-node-id={node.id}
            style={style}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => imageCache.markUsed(asset.src)}
            onPointerCancel={(event) => stopNodeDrag(event, node)}
            onPointerDown={(event) => startNodeDrag(event, node)}
            onPointerMove={(event) => moveNodeDrag(event, node)}
            onPointerUp={(event) => stopNodeDrag(event, node)}
          />
        );
      })}
    </div>
  );
}
