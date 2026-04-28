import type { CareerMapData, SceneAsset, SceneNode } from '../types/careerMap';

export function getAssetMap(assets: SceneAsset[]): Map<string, SceneAsset> {
  return new Map(assets.map((asset) => [asset.id, asset]));
}

export function getSceneNodes(data: CareerMapData): SceneNode[] {
  return data.layers.flatMap((layer) => layer.nodes);
}

export function getInteractiveJobNode(
  data: CareerMapData,
  jobId: string,
): SceneNode | undefined {
  return getSceneNodes(data).find((node) => node.interactive && node.jobId === jobId);
}

export function getNodeFocusPoint(node: SceneNode): { x: number; y: number } {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height * 0.82,
  };
}
