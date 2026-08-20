/**
 * Vertex shader for the particle transform step. Inlined so the project does
 * not need custom GLSL file imports; keep pixel helpers in sync with
 * `_utils/pixel.glsl` and `_utils/pixel-value.glsl`.
 */
export const PARTICLE_LINE_LAYER_UPDATE_VS = `#version 300 es
#define SHADER_NAME particle-line-layer-update-vertex-shader

#ifdef GL_ES
precision highp float;
#endif

vec4 getPixel(sampler2D image, vec2 imageDownscaleResolution, vec2 iuv, vec2 offset) {
  vec2 uv = (iuv + offset + 0.5) / imageDownscaleResolution;

  return texture(image, uv);
}

const vec4 BS_A = vec4(3.0, -6.0, 0.0, 4.0) / 6.0;
const vec4 BS_B = vec4(-1.0, 6.0, -12.0, 8.0) / 6.0;

vec4 powers(float x) {
  return vec4(x * x * x, x * x, x, 1.0);
}

vec4 spline(vec4 c0, vec4 c1, vec4 c2, vec4 c3, float a) {
  vec4 color =
    c0 * dot(BS_B, powers(a + 1.0)) +
    c1 * dot(BS_A, powers(a)) +
    c2 * dot(BS_A, powers(1.0 - a)) +
    c3 * dot(BS_B, powers(2.0 - a));

  color.a = (c0.a > 0.0 && c1.a > 0.0 && c2.a > 0.0 && c3.a > 0.0) ? max(max(max(c0.a, c1.a), c2.a), c3.a) : 0.0;

  return color;
}

vec4 getPixelCubic(sampler2D image, vec2 imageDownscaleResolution, vec2 uv) {
  vec2 tuv = uv * imageDownscaleResolution - 0.5;
  vec2 iuv = floor(tuv);
  vec2 fuv = fract(tuv);

  return spline(
    spline(getPixel(image, imageDownscaleResolution, iuv, vec2(-1, -1)), getPixel(image, imageDownscaleResolution, iuv, vec2(0, -1)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, -1)), getPixel(image, imageDownscaleResolution, iuv, vec2(2, -1)), fuv.x),
    spline(getPixel(image, imageDownscaleResolution, iuv, vec2(-1, 0)), getPixel(image, imageDownscaleResolution, iuv, vec2(0, 0)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 0)), getPixel(image, imageDownscaleResolution, iuv, vec2(2, 0)), fuv.x),
    spline(getPixel(image, imageDownscaleResolution, iuv, vec2(-1, 1)), getPixel(image, imageDownscaleResolution, iuv, vec2(0, 1)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 1)), getPixel(image, imageDownscaleResolution, iuv, vec2(2, 1)), fuv.x),
    spline(getPixel(image, imageDownscaleResolution, iuv, vec2(-1, 2)), getPixel(image, imageDownscaleResolution, iuv, vec2(0, 2)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 2)), getPixel(image, imageDownscaleResolution, iuv, vec2(2, 2)), fuv.x),
    fuv.y
  );
}

vec4 getPixelLinear(sampler2D image, vec2 imageDownscaleResolution, vec2 uv) {
  vec2 tuv = uv * imageDownscaleResolution - 0.5;
  vec2 iuv = floor(tuv);
  vec2 fuv = fract(tuv);

  return mix(
    mix(getPixel(image, imageDownscaleResolution, iuv, vec2(0, 0)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 0)), fuv.x),
    mix(getPixel(image, imageDownscaleResolution, iuv, vec2(0, 1)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 1)), fuv.x),
    fuv.y
  );
}

vec4 getPixelNearest(sampler2D image, vec2 imageDownscaleResolution, vec2 uv) {
  vec2 tuv = uv * imageDownscaleResolution - 0.5;
  vec2 iuv = floor(tuv + 0.5);

  return getPixel(image, imageDownscaleResolution, iuv, vec2(0, 0));
}

vec4 getPixelFilter(sampler2D image, vec2 imageDownscaleResolution, float imageInterpolation, vec2 uv) {
  if (imageInterpolation == 2.0) {
    return getPixelCubic(image, imageDownscaleResolution, uv);
  }
  if (imageInterpolation == 1.0) {
    return getPixelLinear(image, imageDownscaleResolution, uv);
  }
  return getPixelNearest(image, imageDownscaleResolution, uv);
}

vec4 getPixelInterpolate(sampler2D image, sampler2D image2, vec2 imageDownscaleResolution, float imageInterpolation, float imageWeight, bool isRepeatBounds, vec2 uv) {
  vec2 uvWithOffset;
  uvWithOffset.x = isRepeatBounds ?
    uv.x + 0.5 / imageDownscaleResolution.x :
    mix(0.0 + 0.5 / imageDownscaleResolution.x, 1.0 - 0.5 / imageDownscaleResolution.x, uv.x);
  uvWithOffset.y =
    mix(0.0 + 0.5 / imageDownscaleResolution.y, 1.0 - 0.5 / imageDownscaleResolution.y, uv.y);

  if (imageWeight > 0.0) {
    vec4 pixel = getPixelFilter(image, imageDownscaleResolution, imageInterpolation, uvWithOffset);
    vec4 pixel2 = getPixelFilter(image2, imageDownscaleResolution, imageInterpolation, uvWithOffset);
    return mix(pixel, pixel2, imageWeight);
  }

  return getPixelFilter(image, imageDownscaleResolution, imageInterpolation, uvWithOffset);
}

vec4 getPixelSmoothInterpolate(sampler2D image, sampler2D image2, vec2 imageResolution, float imageSmoothing, float imageInterpolation, float imageWeight, bool isRepeatBounds, vec2 uv) {
  float imageDownscaleResolutionFactor = 1.0 + max(0.0, imageSmoothing);
  vec2 imageDownscaleResolution = imageResolution / imageDownscaleResolutionFactor;

  return getPixelInterpolate(image, image2, imageDownscaleResolution, imageInterpolation, imageWeight, isRepeatBounds, uv);
}

float atan2(float y, float x) {
  return x == 0.0 ? sign(y) * _PI / 2.0 : atan(y, x);
}

bool isNaN(float value) {
  highp uint valueUint = floatBitsToUint(value);
  return (valueUint & 0x7fffffffu) > 0x7f800000u;
}

bool hasPixelValue(vec4 pixel, vec2 imageUnscale) {
  if (imageUnscale[0] < imageUnscale[1]) {
    return pixel.a >= 1.0;
  }
  return !isNaN(pixel.x);
}

float getPixelScalarValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    return 0.0;
  }

  if (imageUnscale[0] < imageUnscale[1]) {
    return mix(imageUnscale[0], imageUnscale[1], pixel.x);
  }

  return pixel.x;
}

vec2 decodeWindUV(vec2 encodedWind) {
  const float maxSpeed = 100.0;
  const float fillOffset = 1.0;

  float speed = exp(encodedWind.r * log(maxSpeed + fillOffset)) - fillOffset;
  float dirRad = radians(encodedWind.g * 360.0);

  float u = -speed * sin(dirRad);
  float v = -speed * cos(dirRad);

  return vec2(u, v);
}

vec2 getPixelVectorValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    if (imageUnscale[0] < imageUnscale[1]) {
      return mix(vec2(imageUnscale[0]), vec2(imageUnscale[1]), pixel.xy);
    }
    return decodeWindUV(pixel.rg);
  }

  return vec2(0.0);
}

float getPixelMagnitudeValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    vec2 value = getPixelVectorValue(pixel, imageType, imageUnscale);
    return length(value);
  }

  return getPixelScalarValue(pixel, imageType, imageUnscale);
}

in vec3 sourcePosition;
in vec4 sourceColor;
out vec3 targetPosition;
out vec4 targetColor;

const float DROP_POSITION_Z = -1.0;
const vec4 HIDE_COLOR = vec4(0.0);

const float _EARTH_RADIUS = 6370972.0;

vec2 destinationPoint(vec2 from, float dist, float bearing) {
  float d = dist / _EARTH_RADIUS;
  float r = radians(bearing);

  float y1 = radians(from.y);
  float x1 = radians(from.x);

  float siny2 = sin(y1) * cos(d) + cos(y1) * sin(d) * cos(r);
  float y2 = asin(siny2);
  float y = sin(r) * sin(d) * cos(y1);
  float x = cos(d) - sin(y1) * siny2;
  float x2 = x1 + atan2(y, x);

  float lat = degrees(y2);
  float lon = degrees(x2);

  return vec2(lon, lat);
}

float wrapLongitude(float lng) {
  float wrappedLng = mod(lng + 180.0, 360.0) - 180.0;
  return wrappedLng;
}

float wrapLongitude(float lng, float minLng) {
  float wrappedLng = wrapLongitude(lng);
  if (wrappedLng < minLng) {
    wrappedLng += 360.0;
  }
  return wrappedLng;
}

float randFloat(vec2 seed) {
  return fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 randPoint(vec2 seed) {
  return vec2(randFloat(seed + 1.3), randFloat(seed + 2.1));
}

vec2 randPointToPosition(vec2 point) {
  if (particle.viewportGlobe == 1.0) {
    point.x += 0.0001;
    point.x = sqrt(point.x);
    float dist = point.x * particle.viewportGlobeRadius;
    float bearing = point.y * 360.0;
    return destinationPoint(particle.viewportGlobeCenter, dist, bearing);
  }

  point.y = smoothstep(0.0, 1.0, point.y);
  vec2 viewportBoundsMin = particle.viewportBounds.xy;
  vec2 viewportBoundsMax = particle.viewportBounds.zw;
  return mix(viewportBoundsMin, viewportBoundsMax, point);
}

vec2 movePositionBySpeed(vec2 position, vec2 speed) {
  bool isMercatorRasterSpace = bitmap2.coordinateConversion < -0.5;
  vec2 lngLatPosition = isMercatorRasterSpace ? mercator_to_lnglat(position) : position;

  if (particle.viewportGlobe == 1.0) {
    float distortion = cos(radians(lngLatPosition.y));
    vec2 nextLngLatPosition = lngLatPosition + vec2(speed.x / distortion, speed.y);
    return isMercatorRasterSpace ? lnglat_to_mercator(nextLngLatPosition) : nextLngLatPosition;
  }

  // Integrate in Web Mercator world space (same projection as deck.gl basemap) so
  // trajectories match the Mercator map. Direct lng/lat addition matches equirectangular
  // / plate-carrée flow and drifts visually relative to the basemap.
  const float DEG2RAD = 0.017453292519943295;
  float latRad = radians(clamp(lngLatPosition.y, -89.9, 89.9));
  float cosLat = cos(latRad);
  float cosLatSafe = max(abs(cosLat), 0.01);

  float dLngDeg = speed.x;
  float dLatDeg = speed.y * cosLat;

  vec2 merc = lnglat_to_mercator(lngLatPosition);
  vec2 dMerc = vec2(
    _WORLD_SCALE * dLngDeg * DEG2RAD,
    _WORLD_SCALE * dLatDeg * DEG2RAD / cosLatSafe
  );
  vec2 nextLngLatPosition = mercator_to_lnglat(merc + dMerc);
  return isMercatorRasterSpace ? lnglat_to_mercator(nextLngLatPosition) : nextLngLatPosition;
}

vec2 toRasterSpace(vec2 position) {
  if (bitmap2.coordinateConversion < -0.5) {
    return lnglat_to_mercator(position);
  }
  return position;
}

vec2 fromRasterSpace(vec2 rasterPosition) {
  if (bitmap2.coordinateConversion < -0.5) {
    return mercator_to_lnglat(rasterPosition);
  }
  return rasterPosition;
}

vec2 getParticleUV(vec2 rasterPosition) {
  vec2 samplePosition = rasterPosition;
  if (bitmap2.coordinateConversion > 0.5) {
    samplePosition = lnglat_to_mercator(samplePosition);
  } else if (bitmap2.coordinateConversion < -0.5) {
    samplePosition = mercator_to_lnglat(samplePosition);
  } else if (particle.viewportGlobe != 1.0) {
    vec2 mercPos = lnglat_to_mercator(samplePosition);
    vec2 mercBoundsMin = lnglat_to_mercator(bitmap2.bounds.xy);
    vec2 mercBoundsMax = lnglat_to_mercator(bitmap2.bounds.zw);
    return vec2(
      (mercPos.x - mercBoundsMin.x) / (mercBoundsMax.x - mercBoundsMin.x),
      (mercPos.y - mercBoundsMax.y) / (mercBoundsMin.y - mercBoundsMax.y)
    );
  }
  return getUV(samplePosition);
}

bool isPositionInBounds(vec2 position, vec4 bounds) {
  vec2 boundsMin = bounds.xy;
  vec2 boundsMax = bounds.zw;
  float lng = wrapLongitude(position.x, boundsMin.x);
  float lat = position.y;
  return (
    boundsMin.x <= lng && lng <= boundsMax.x &&
    boundsMin.y <= lat && lat <= boundsMax.y
  );
}

void main() {
  float particleIndex = mod(float(gl_VertexID), particle.numParticles);
  float particleAge = floor(float(gl_VertexID) / particle.numParticles);

  if (particleAge > 0.0) {
    return;
  }

  if (sourcePosition.z == DROP_POSITION_Z) {
    vec2 particleSeed = vec2(particleIndex * particle.seed / particle.numParticles);
    vec2 point = randPoint(particleSeed);
    vec2 position = randPointToPosition(point);
    targetPosition.xy = position;
    targetPosition.x = wrapLongitude(targetPosition.x);
    targetPosition.z = 0.0;
    targetColor = HIDE_COLOR;
    return;
  }

  if (particle.viewportZoomChangeFactor > 1.0 && mod(particleIndex, particle.viewportZoomChangeFactor) >= 1.0) {
    targetPosition.xy = sourcePosition.xy;
    targetPosition.z = DROP_POSITION_Z;
    targetColor = HIDE_COLOR;
    return;
  }

  if (abs(mod(particleIndex, particle.maxAge + 2.0) - mod(particle.time, particle.maxAge + 2.0)) < 1.0) {
    targetPosition.xy = sourcePosition.xy;
    targetPosition.z = DROP_POSITION_Z;
    targetColor = HIDE_COLOR;
    return;
  }

  if (!isPositionInBounds(sourcePosition.xy, bitmap2.bounds)) {
    targetPosition.xy = sourcePosition.xy;
    targetPosition.z = DROP_POSITION_Z;
    targetColor = HIDE_COLOR;
    return;
  }

  vec2 rasterPosition = toRasterSpace(sourcePosition.xy);
  vec2 uv = getParticleUV(rasterPosition);

  vec4 pixel = getPixelSmoothInterpolate(imageTexture, imageTexture2, raster.imageResolution, raster.imageSmoothing, raster.imageInterpolation, raster.imageWeight, bitmap2.isRepeatBounds, uv);
  if (!hasPixelValue(pixel, raster.imageUnscale)) {
    targetPosition.xy = sourcePosition.xy;
    targetPosition.z = DROP_POSITION_Z;
    targetColor = HIDE_COLOR;
    return;
  }

  float value = getPixelMagnitudeValue(pixel, raster.imageType, raster.imageUnscale);
  if (
    (!isNaN(raster.imageMinValue) && value < raster.imageMinValue) ||
    (!isNaN(raster.imageMaxValue) && value > raster.imageMaxValue)
  ) {
    targetPosition.xy = sourcePosition.xy;
    targetPosition.z = DROP_POSITION_Z;
    targetColor = HIDE_COLOR;
    return;
  }

  vec2 speed = getPixelVectorValue(pixel, raster.imageType, raster.imageUnscale) * particle.speedFactor;
  vec2 movedRasterPosition = movePositionBySpeed(rasterPosition, speed);
  targetPosition.xy = fromRasterSpace(movedRasterPosition);
  targetPosition.x = wrapLongitude(targetPosition.x);
  targetPosition.z = 0.0;
  targetColor = sourceColor;

  targetColor = applyPalette(paletteTexture, palette.paletteBounds, palette.paletteColor, value);
}`;
