export const DEFAULT_RADIUS = 6370972;

function equals(position1: GeoJSON.Position, position2: GeoJSON.Position): boolean {
  if (Math.abs(position1[0] - position2[0]) > Number.EPSILON) return false;
  if (Math.abs(position1[1] - position2[1]) > Number.EPSILON) return false;
  return true;
}

function toRadians(value: number): number {
  return value / 180 * Math.PI;
}

function toDegrees(value: number): number {
  return value / Math.PI * 180;
}

function wrap360(value: number): number {
  return (value + 360) % 360;
}

/**
 * Distance along the surface of the earth from start to destination (haversine).
 */
export function distance(start: GeoJSON.Position, destination: GeoJSON.Position, radius: number = DEFAULT_RADIUS): number {
  const startLatitude = toRadians(start[1]);
  const destinationLatitude = toRadians(destination[1]);
  const latitudeDelta = destinationLatitude - startLatitude;
  const longitudeDelta = toRadians(destination[0] - start[0]);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return radius * centralAngle;
}

/**
 * Initial bearing from start to destination, in degrees from north (0°..360°).
 */
export function initialBearing(start: GeoJSON.Position, destination: GeoJSON.Position): number {
  if (equals(start, destination)) return NaN;

  const startLatitude = toRadians(start[1]);
  const destinationLatitude = toRadians(destination[1]);
  const longitudeDelta = toRadians(destination[0] - start[0]);

  const north =
    Math.cos(startLatitude) * Math.sin(destinationLatitude) -
    Math.sin(startLatitude) * Math.cos(destinationLatitude) * Math.cos(longitudeDelta);
  const east = Math.sin(longitudeDelta) * Math.cos(destinationLatitude);
  const bearing = Math.atan2(east, north);

  return wrap360(toDegrees(bearing));
}

/**
 * Destination point after travelling `distance` on `bearing` from start.
 * Distance is in the same units as `radius` (metres by default).
 */
export function destinationPoint(start: GeoJSON.Position, distance: number, bearing: number, radius: number = DEFAULT_RADIUS): GeoJSON.Position {
  const angularDistance = distance / radius;
  const bearingRadians = toRadians(bearing);

  const startLatitude = toRadians(start[1]);
  const startLongitude = toRadians(start[0]);

  const destinationLatitudeSine =
    Math.sin(startLatitude) * Math.cos(angularDistance) +
    Math.cos(startLatitude) * Math.sin(angularDistance) * Math.cos(bearingRadians);
  const destinationLatitude = Math.asin(destinationLatitudeSine);
  const longitudeDeltaEast = Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(startLatitude);
  const longitudeDeltaNorth = Math.cos(angularDistance) - Math.sin(startLatitude) * destinationLatitudeSine;
  const destinationLongitude = startLongitude + Math.atan2(longitudeDeltaEast, longitudeDeltaNorth);

  return [toDegrees(destinationLongitude), toDegrees(destinationLatitude)];
}
