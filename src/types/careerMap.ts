export type AssetType = 'image';
export type SceneLayerKind = 'background' | 'building' | 'floor' | 'object' | 'foreground';

export interface WorldInfo {
  id: string;
  title: string;
  width: number;
  height: number;
  initialCamera?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface SceneAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  type: AssetType;
  alt?: string;
}

export interface SceneNode {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive?: boolean;
  jobId?: string;
  stageId?: string;
  floorId?: string;
  roomId?: string;
  label?: string;
}

export interface SceneLayer {
  id: string;
  kind: SceneLayerKind;
  zIndex: number;
  parallax: number;
  nodes: SceneNode[];
}

export interface StageFloor {
  id: string;
  stageId: string;
  level: string;
  y: number;
  height: number;
  title: string;
}

export interface StageRoom {
  id: string;
  stageId: string;
  floorId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CareerStage {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floors: StageFloor[];
  rooms: StageRoom[];
}

export interface CareerJob {
  id: string;
  title: string;
  site: string;
  stageId: string;
  floorId: string;
  roomId: string;
  level: string;
  tags: string[];
  description: string;
}

export interface CareerMapData {
  schemaVersion: number;
  world: WorldInfo;
  assets: SceneAsset[];
  layers: SceneLayer[];
  stages: CareerStage[];
  jobs: CareerJob[];
  initialFocus: {
    jobId?: string;
    x?: number;
    y?: number;
    zoom?: number;
  };
}

export interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}
