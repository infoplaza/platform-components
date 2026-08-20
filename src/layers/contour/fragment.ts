/**
 * Fragment shader for ContourBitmapLayer. Inlined so the bundler does not need
 * a GLSL loader; keep pixel helpers in sync with `_utils/pixel.glsl` and
 * `_utils/pixel-value.glsl`.
 */
import { PIXEL_SHADER_HELPERS } from '../../_utils/pixel-shader-chunk'

export const CONTOUR_BITMAP_LAYER_FS = `#version 300 es
#define SHADER_NAME contour-bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
// Fragment shaders default int/uint to mediump. isNaN() and textureSize()
// rely on 32-bit integers, so force highp to avoid truncation on
// ANGLE/Direct3D (Windows Chrome).
precision highp int;
// sampler2D defaults to lowp in fragment shaders; on some mobile GPUs that
// clamps the precision of the fetched texel, which is enough to flip a
// reconstructed palette-index band. Force highp so index maps decode exactly.
precision highp sampler2D;
#endif

${PIXEL_SHADER_HELPERS}

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

  vec4 pixel = getPixelSmoothInterpolate(
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

  if (!hasPixelValue(pixel, raster.imageUnscale, raster.imageFillValue, raster.imageUseAlphaValidity, raster.imageType)) {
    discard;
  }

  float value = getPixelMagnitudeValue(pixel, raster.imageType, raster.imageUnscale);
  if (
    (!isNaN(raster.imageMinValue) && value < raster.imageMinValue) ||
    (!isNaN(raster.imageMaxValue) && value > raster.imageMaxValue)
  ) {
    discard;
  }

  float safeInterval = max(abs(contour.interval), 1e-6);
  float majorIntervalRatio = contour.majorInterval > safeInterval ? floor(contour.majorInterval / safeInterval) : 1.0;
  float contourValue = value / safeInterval;

  float contourMajor = (step(fract(contourValue / majorIntervalRatio), 0.1) + 1.0) / 2.0;
  float contourWidth = contour.width * contourMajor;

  float factor = abs(fract(contourValue + 0.5) - 0.5);
  float dFactor = length(vec2(dFdx(contourValue), dFdy(contourValue)));
  float contourOpacity = 1.0 - clamp((factor / dFactor) + 0.5 - contourWidth, 0.0, 1.0);
  if (dFactor == 0.0) {
    contourOpacity = 0.0;
  }
  float contourOpacityMajor = contourOpacity * contourMajor;

  vec4 targetColor = applyPalette(paletteTexture, palette.paletteBounds, palette.paletteColor, value);
  fragColor = vec4(targetColor.rgb, targetColor.a * contourOpacityMajor * layer.opacity);

  geometry.uv = uv;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`
