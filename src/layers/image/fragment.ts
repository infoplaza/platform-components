import {PIXEL_SHADER_HELPERS} from '../../_utils/pixel-shader-chunk';

export const RASTER_BITMAP_LAYER_FS = `#version 300 es
#define SHADER_NAME raster-bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

${PIXEL_SHADER_HELPERS}

#define MAX_BAND_AA 0.15

float applyPaletteBands(float normalizedIndex) {
  float numEntries = float(textureSize(paletteTexture, 0).x);
  float maxIndex = max(numEntries - 1.0, 0.0);
  float smoothIndex = clamp(normalizedIndex * maxIndex, 0.0, maxIndex);
  float aa = clamp(fwidth(smoothIndex) * 0.5, 1e-4, MAX_BAND_AA);
  float bandFloor = floor(smoothIndex);
  float bandFrac = smoothIndex - bandFloor;
  float banded = bandFloor + smoothstep(0.5 - aa, 0.5 + aa, bandFrac);
  return clamp(banded, 0.0, maxIndex) / max(maxIndex, 1.0);
}

float sampleIndexValue(
  sampler2D image,
  vec2 imageDownscaleResolution,
  float numEntries,
  vec2 texelPos
) {
  vec2 clamped = clamp(texelPos, vec2(0.0), imageDownscaleResolution - 1.0);
  vec2 uv = (clamped + 0.5) / imageDownscaleResolution;
  return texture(image, uv).r * max(numEntries - 1.0, 0.0);
}

vec4 catmullRomWeights(float t) {
  float t2 = t * t;
  float t3 = t2 * t;
  return vec4(
    -0.5 * t3 + t2 - 0.5 * t,
     1.5 * t3 - 2.5 * t2 + 1.0,
    -1.5 * t3 + 2.0 * t2 + 0.5 * t,
     0.5 * t3 - 0.5 * t2
  );
}

vec4 getPixelIndexTypeAware(
  sampler2D image,
  vec2 resolution,
  float stride,
  vec2 uv
) {
  float numEntries = float(textureSize(paletteTexture, 0).x);
  vec2 texelPos = uv * resolution - 0.5;
  vec2 texelFloor = floor(texelPos);
  vec2 fraction = fract(texelPos);
  vec2 nearestTexel = floor(texelPos + 0.5);
  float nearestRounded = floor(sampleIndexValue(image, resolution, numEntries, nearestTexel) + 0.5);
  float nearestType = mod(nearestRounded, stride);
  float nearestIntensity = floor(nearestRounded / stride);
  vec4 wx = catmullRomWeights(fraction.x);
  vec4 wy = catmullRomWeights(fraction.y);
  float interpolatedIntensity = 0.0;

  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 offset = vec2(float(x) - 1.0, float(y) - 1.0);
      float rounded = floor(sampleIndexValue(image, resolution, numEntries, texelFloor + offset) + 0.5);
      float type = mod(rounded, stride);
      float intensity = abs(type - nearestType) < 0.5
        ? floor(rounded / stride)
        : nearestIntensity;
      interpolatedIntensity += wx[x] * wy[y] * intensity;
    }
  }

  float maxIntensity = floor(numEntries / stride) - 1.0;
  float quantizedIntensity = clamp(floor(interpolatedIntensity + 0.5), 0.0, maxIntensity);
  float finalIndex = quantizedIntensity * stride + nearestType;
  vec4 pixel = getPixel(image, resolution, nearestTexel, vec2(0.0));
  pixel.r = finalIndex / max(numEntries - 1.0, 1.0);
  return pixel;
}

vec4 getPixelIndexSmooth(
  sampler2D image,
  vec2 resolution,
  bool banded,
  vec2 uv
) {
  float numEntries = float(textureSize(paletteTexture, 0).x);
  vec2 texelPos = uv * resolution - 0.5;
  vec2 texelFloor = floor(texelPos);
  vec2 fraction = fract(texelPos);
  vec4 wx = catmullRomWeights(fraction.x);
  vec4 wy = catmullRomWeights(fraction.y);
  float interpolatedValue = 0.0;
  float localMin = numEntries;
  float localMax = 0.0;

  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 offset = vec2(float(x) - 1.0, float(y) - 1.0);
      float value = sampleIndexValue(image, resolution, numEntries, texelFloor + offset);
      interpolatedValue += wx[x] * wy[y] * value;
      if (x >= 1 && x <= 2 && y >= 1 && y <= 2) {
        localMin = min(localMin, value);
        localMax = max(localMax, value);
      }
    }
  }

  float smoothIndex = clamp(interpolatedValue, localMin, localMax);
  vec2 nearestTexel = floor(texelPos + 0.5);
  vec4 pixel = getPixel(image, resolution, nearestTexel, vec2(0.0));
  float normalizedIndex = smoothIndex / max(numEntries - 1.0, 1.0);
  pixel.r = banded ? applyPaletteBands(normalizedIndex) : normalizedIndex;
  return pixel;
}

vec4 getPixelSmoothTypeAware(
  sampler2D image,
  sampler2D image2,
  vec2 imageResolution,
  float imageSmoothing,
  float imageWeight,
  float stride,
  bool isRepeatBounds,
  vec2 uv
) {
  vec2 resolution = imageResolution / (1.0 + max(0.0, imageSmoothing));
  vec2 sampleUV = getImageUV(resolution, isRepeatBounds, uv);
  vec4 pixel = getPixelIndexTypeAware(image, resolution, stride, sampleUV);
  if (imageWeight > 0.0) {
    vec4 pixel2 = getPixelIndexTypeAware(image2, resolution, stride, sampleUV);
    return mix(pixel, pixel2, imageWeight);
  }
  return pixel;
}

vec4 getPixelSmoothIndex(
  sampler2D image,
  sampler2D image2,
  vec2 imageResolution,
  float imageSmoothing,
  float imageWeight,
  bool banded,
  bool isRepeatBounds,
  vec2 uv
) {
  vec2 resolution = imageResolution / (1.0 + max(0.0, imageSmoothing));
  vec2 sampleUV = getImageUV(resolution, isRepeatBounds, uv);
  vec4 pixel = getPixelIndexSmooth(image, resolution, banded, sampleUV);
  if (imageWeight > 0.0) {
    vec4 pixel2 = getPixelIndexSmooth(image2, resolution, banded, sampleUV);
    return mix(pixel, pixel2, imageWeight);
  }
  return pixel;
}

in vec2 vTexCoord;
in vec2 vTexPos;
out vec4 fragColor;

void main(void) {
  vec2 uv = getUVWithCoordinateConversion(vTexCoord, vTexPos);

  if (!isFillValueAnchorValid(
    imageTexture,
    raster.imageResolution,
    raster.imageSmoothing,
    bitmap2.isRepeatBounds,
    uv,
    raster.imageUnscale,
    raster.imageFillValue,
    raster.imageUseAlphaValidity,
    raster.imageType
  )) {
    discard;
  }

  vec4 pixel;
  if (bool(palette.hasPaletteTexture) && raster.imageInterpolation < 0.5) {
    if (raster.imageStride > 1.5) {
      pixel = getPixelSmoothTypeAware(
        imageTexture,
        imageTexture2,
        raster.imageResolution,
        raster.imageSmoothing,
        raster.imageWeight,
        raster.imageStride,
        bitmap2.isRepeatBounds,
        uv
      );
    } else {
      pixel = getPixelSmoothIndex(
        imageTexture,
        imageTexture2,
        raster.imageResolution,
        raster.imageSmoothing,
        raster.imageWeight,
        raster.imageBanded > 0.5,
        bitmap2.isRepeatBounds,
        uv
      );
    }
  } else {
    pixel = getPixelSmoothInterpolate(
      imageTexture,
      imageTexture2,
      raster.imageResolution,
      raster.imageSmoothing,
      raster.imageInterpolation,
      raster.imageWeight,
      bitmap2.isRepeatBounds,
      uv,
      raster.imageUnscale,
      raster.imageFillValue,
      raster.imageUseAlphaValidity,
      raster.imageType
    );
    if (bool(palette.hasPaletteTexture) && raster.imageBanded > 0.5) {
      pixel.r = applyPaletteBands(pixel.r);
    }
  }

  if (!hasPixelValue(
    pixel,
    raster.imageUnscale,
    raster.imageFillValue,
    raster.imageUseAlphaValidity,
    raster.imageType
  )) {
    discard;
  }

  if (isNaN(pixel.a)) {
    if (bool(palette.hasPaletteTexture)) {
      discard;
    }
    fragColor = pixel;
    return;
  }

  float value = getPixelMagnitudeValue(pixel, raster.imageType, raster.imageUnscale);
  if (
    (!isNaN(raster.imageMinValue) && value < raster.imageMinValue) ||
    (!isNaN(raster.imageMaxValue) && value > raster.imageMaxValue)
  ) {
    discard;
  }

  if (!bool(palette.hasPaletteTexture)) {
    fragColor = apply_opacity(pixel.rgb, pixel.a * layer.opacity);
  } else {
    float paletteWidth = float(textureSize(paletteTexture, 0).x);
    float paletteGrayscaleValue = pixel.r * max(paletteWidth - 1.0, 0.0);
    vec4 targetColor = applyPaletteGrayscale(paletteTexture, paletteGrayscaleValue);
    fragColor = apply_opacity(targetColor.rgb, targetColor.a * layer.opacity);

    if (bool(raster.borderEnabled)) {
      vec2 pixelSize = vec2(length(dFdx(uv)), length(dFdy(uv)));
      vec2 borderWidth = raster.borderWidth / 2.0 * pixelSize;
      if (
        uv.x < borderWidth.x ||
        uv.x > 1.0 - borderWidth.x ||
        uv.y < borderWidth.y ||
        uv.y > 1.0 - borderWidth.y
      ) {
        fragColor = apply_opacity(raster.borderColor.rgb, raster.borderColor.a * layer.opacity * 2.0);
      }
    }

    if (bool(raster.gridEnabled)) {
      vec2 resolution = raster.imageResolution / (1.0 + max(0.0, raster.imageSmoothing));
      vec2 sampleUV = getImageUV(resolution, bitmap2.isRepeatBounds, uv);
      vec2 fraction = fract(sampleUV * resolution - 0.5);
      vec2 pixelSize = vec2(length(dFdx(uv)), length(dFdy(uv)));
      vec2 gridSize = raster.gridSize / 2.0 * pixelSize * raster.imageResolution;
      if (
        fraction.x < gridSize.x ||
        fraction.x > 1.0 - gridSize.x ||
        fraction.y < gridSize.y ||
        fraction.y > 1.0 - gridSize.y
      ) {
        fragColor = apply_opacity(raster.gridColor.rgb, raster.gridColor.a * layer.opacity * 2.0);
      }
    }
  }

  if (bool(picking.isActive) && !bool(picking.isAttribute)) {
    if (bool(palette.hasPaletteTexture)) {
      float paletteValue = getPaletteValue(palette.paletteBounds[0], palette.paletteBounds[1], value);
      float paletteWidth = float(textureSize(paletteTexture, 0).x);
      float paletteGrayscaleValue = pixel.r * max(paletteWidth - 1.0, 0.0);
      vec4 targetColor = applyPaletteGrayscale(paletteTexture, paletteGrayscaleValue);
      fragColor = vec4(paletteValue, targetColor.rgb);
    }
    fragColor.a = 1.0;
  }
}`;
