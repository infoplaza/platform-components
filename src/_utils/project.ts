import proj4 from "proj4";

export type ProjectFunction = (point: GeoJSON.Position) => GeoJSON.Position;

// Web Mercator (EPSG:3857) constants. We compute mercator coords directly
// rather than via proj4 because proj4 wraps any longitude outside
// [-180, 180] back into range (e.g. proj4(190) == proj4(-170)). That breaks
// images whose bounds straddle the antimeridian, e.g. [170, ..., 190, ...],
// because the eastern edge would project to a negative mercator x, the
// xResolution would flip sign, and every sample collapses to the left or
// right edge column. The formulas below are linear in longitude and accept
// any value, including ranges past ±180.
const MERCATOR_RADIUS = 6378137;
const MERCATOR_HALF_EQUATOR = Math.PI * MERCATOR_RADIUS; // ≈ 20037508.342789244

function lngToMercatorX(lng: number): number {
    return (lng / 180) * MERCATOR_HALF_EQUATOR;
}

function latToMercatorY(lat: number): number {
    return Math.log(Math.tan((90 + lat) * Math.PI / 360)) * MERCATOR_RADIUS;
}

function mercatorXToLng(x: number): number {
    return (x / MERCATOR_HALF_EQUATOR) * 180;
}

function mercatorYToLat(y: number): number {
    return (Math.atan(Math.exp(y / MERCATOR_RADIUS)) * 360 / Math.PI) - 90;
}

// Grid positions arrive normalized to [-180, 180]. If the image bounds
// extend past ±180 (antimeridian straddle), a position on the wrapped side
// is geographically inside the image but numerically outside the bounds —
// shift it by ±360 so the projection lands in the correct pixel range.
function wrapLngIntoBounds(lng: number, bounds: GeoJSON.BBox): number {
    if (bounds[2] > 180 && lng < bounds[0]) {
        return lng + 360;
    }
    if (bounds[0] < -180 && lng > bounds[2]) {
        return lng - 360;
    }
    return lng;
}

export function getProjectFunction(width: number, height: number, bounds: GeoJSON.BBox): ProjectFunction {
    const originX = lngToMercatorX(bounds[0]);
    const originY = latToMercatorY(bounds[3]);
    const xResolution = (lngToMercatorX(bounds[2]) - originX) / width;
    const yResolution = (originY - latToMercatorY(bounds[1])) / height; // Note: Y is inverted (top is higher Y in Mercator)

    return position => {
        const lng = wrapLngIntoBounds(position[0], bounds);
        const lat = position[1];

        const x = (lngToMercatorX(lng) - originX) / xResolution;
        const y = (originY - latToMercatorY(lat)) / yResolution;

        return [x, y];
    }
}

export function getUnprojectFunction(width: number, height: number, bounds: GeoJSON.BBox): ProjectFunction {
    const originX = lngToMercatorX(bounds[0]);
    const originY = latToMercatorY(bounds[3]);
    const xResolution = (lngToMercatorX(bounds[2]) - originX) / width;
    const yResolution = (originY - latToMercatorY(bounds[1])) / height;

    return point => {
        const [x, y] = point;

        const mercatorX = originX + x * xResolution;
        const mercatorY = originY - y * yResolution;

        return [mercatorXToLng(mercatorX), mercatorYToLat(mercatorY)];
    }
}

export function getProjectFunction2(width: number, height: number, bounds: GeoJSON.BBox): ProjectFunction {
    const origin = [bounds[0], bounds[3]] // top-left
    const lngResolution = (bounds[2] - bounds[0]) / width
    const latResolution = (bounds[3] - bounds[1]) / height

    return position => {
        const [lng, lat] = position
        const wgs84 = "EPSG:4326";   // latitude/longitude
        const webMercator = "EPSG:3857"; // meters
        const point = proj4(wgs84, webMercator, [lng, lat])
        return point
    }
}