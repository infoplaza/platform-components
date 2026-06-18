const MIN_LNG = -180;
const MAX_LNG = 180;
const MIN_LAT = -85.051129;
const MAX_LAT = 85.051129;

export const MERCATOR_BOUNDS: GeoJSON.BBox = [MIN_LNG, MIN_LAT, MAX_LNG, MAX_LAT];

/**
 * see https://stackoverflow.com/a/4467559/1823988
 */
function mod(x: number, y: number): number {
  return ((x % y) + y) % y;
}

export function wrapLongitude(lng: number, minLng?: number): number {
  let wrappedLng = mod(lng + 180, 360) - 180;
  if (typeof minLng === 'number' && wrappedLng < minLng) {
    wrappedLng += 360;
  }
  return wrappedLng;
}

export function wrapBounds(bounds: [number, number, number, number]): [number, number, number, number] {
  // wrap longitude
  const minLng = bounds[2] - bounds[0] < 360 ? wrapLongitude(bounds[0]) : MIN_LNG;
  const maxLng = bounds[2] - bounds[0] < 360 ? wrapLongitude(bounds[2], minLng) : MAX_LNG;
  // clip latitude
  const minLat = Math.max(bounds[1], MIN_LAT);
  const maxLat = Math.min(bounds[3], MAX_LAT);

  return [minLng, minLat, maxLng, maxLat];
}

export function clipBounds(bounds: [number, number, number, number]): [number, number, number, number] {
  // fill longitude gap between repeats
  const minLng = bounds[0] - 1;
  const maxLng = bounds[2] + 1;
  // clip latitude
  const minLat = Math.max(bounds[1], MIN_LAT);
  const maxLat = Math.min(bounds[3], MAX_LAT);

  return [minLng, minLat, maxLng, maxLat];
}

export function isRepeatBounds(bounds: GeoJSON.BBox): boolean {
  return bounds[2] - bounds[0] === 360;
}

export function isPositionInBounds(position: GeoJSON.Position, bounds: GeoJSON.BBox): boolean {
  const [lng, lat] = position;
  if (lat < bounds[1] || lat > bounds[3]) {
    return false;
  }
  if (lng >= bounds[0] && lng <= bounds[2]) {
    return true;
  }
  // The grid generator normalizes positions to [-180, 180]. When the image
  // bounds straddle the antimeridian (e.g. [170, ..., 190, ...] or
  // [-190, ..., -170, ...]) the wrapped half of the grid is geographically
  // inside the image but fails the naive numeric comparison above.
  if (bounds[2] > 180 && lng + 360 >= bounds[0] && lng + 360 <= bounds[2]) {
    return true;
  }
  if (bounds[0] < -180 && lng - 360 >= bounds[0] && lng - 360 <= bounds[2]) {
    return true;
  }
  return false;
}