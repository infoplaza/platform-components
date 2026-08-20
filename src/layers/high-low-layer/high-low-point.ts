import type {ImageProperties} from '../../_utils/image-properties';
import {getHighLowPointDataMain} from './high-low-point-worker-main';

export const HighLowType = {
  LOW: 'L',
  HIGH: 'H',
} as const;

export type HighLowType = (typeof HighLowType)[keyof typeof HighLowType];

export interface HighLowPointProperties {
  type: HighLowType;
  value: number;
}

function createHighLowPoint(position: GeoJSON.Position, properties: HighLowPointProperties): GeoJSON.Feature<GeoJSON.Point, HighLowPointProperties> {
  return {type: 'Feature', geometry: { type: 'Point', coordinates: position }, properties};
}

function getHighLowPointsFromData(highLowPointData: Float32Array): GeoJSON.Feature<GeoJSON.Point, HighLowPointProperties>[] {
  let i = 0;

  const highLowPoints: GeoJSON.Feature<GeoJSON.Point, HighLowPointProperties>[] = [];
  const highCount = highLowPointData[i++];
  for (let j = 0; j < highCount; j++) {
    const position = [highLowPointData[i++], highLowPointData[i++]];
    const value = highLowPointData[i++];
    highLowPoints.push(createHighLowPoint(position, {type: HighLowType.HIGH, value}));
  }
  const lowCount = highLowPointData[i++];
  for (let j = 0; j < lowCount; j++) {
    const position = [highLowPointData[i++], highLowPointData[i++]];
    const value = highLowPointData[i++];
    highLowPoints.push(createHighLowPoint(position, {type: HighLowType.LOW, value}));
  }

  return highLowPoints;
}

export async function getHighLowPoints(imageProperties: ImageProperties, bounds: GeoJSON.BBox, radius: number): Promise<GeoJSON.FeatureCollection<GeoJSON.Point, HighLowPointProperties>> {
  const highLowPointData = getHighLowPointDataMain(imageProperties, bounds, radius);
  const highLowPoints = getHighLowPointsFromData(highLowPointData);

  return {type: 'FeatureCollection', features: highLowPoints};
}
