import careerMapJson from './careerMap.json';
import type { CareerMapData } from '../types/careerMap';
import { withResolvedAssetSrc } from '../utils/asset';

export const careerMap = {
  ...(careerMapJson as CareerMapData),
  assets: withResolvedAssetSrc((careerMapJson as CareerMapData).assets),
} as CareerMapData;
