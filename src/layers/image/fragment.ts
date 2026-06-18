/**
 * Fragment shader for RasterBitmapLayer. Inlined so the bundler does not need
 * a GLSL loader; keep pixel helpers in sync with `_utils/pixel.glsl` and
 * `_utils/pixel-value.glsl`.
 */
export const RASTER_BITMAP_LAYER_FS = `#version 300 es
#define SHADER_NAME raster-bitmap-layer-fragment-shader

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

//   return mix(
//     mix(getPixel(image, imageDownscaleResolution, iuv, vec2(0, 0)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 0)), fuv.x),
//     mix(getPixel(image, imageDownscaleResolution, iuv, vec2(0, 1)), getPixel(image, imageDownscaleResolution, iuv, vec2(1, 1)), fuv.x),
//     fuv.y
//   );

  vec4 p00 = getPixel(image, imageDownscaleResolution, iuv, vec2(0, 0));
  vec4 p10 = getPixel(image, imageDownscaleResolution, iuv, vec2(1, 0));
  vec4 p01 = getPixel(image, imageDownscaleResolution, iuv, vec2(0, 1));
  vec4 p11 = getPixel(image, imageDownscaleResolution, iuv, vec2(1, 1));

  // Alpha-weighted (premultiplied) bilinear filter: transparent neighbors in
  // straight-alpha PNGs store RGB=(0,0,0), and a naive component-wise mix()
  // would bleed that black into edge texels and produce a gray halo around
  // colored regions. Premultiply, interpolate, then un-premultiply so the
  // rest of the pipeline keeps seeing straight alpha.
  p00.rgb *= p00.a;
  p10.rgb *= p10.a;
  p01.rgb *= p01.a;
  p11.rgb *= p11.a;

  vec4 result = mix(
    mix(p00, p10, fuv.x),
    mix(p01, p11, fuv.x),
    fuv.y
  );

  if (result.a > 0.0) {
    result.rgb /= result.a;
  }
  return result;
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
  uint valueUint = floatBitsToUint(value);
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

float getPixelDirectionValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    vec2 value = getPixelVectorValue(pixel, imageType, imageUnscale);
    return mod((360.0 - (atan2(value.y, value.x) / _PI * 180.0 + 180.0)) - 270.0, 360.0) / 360.0;
  }

  return 0.0;
}

in vec2 vTexCoord;
in vec2 vTexPos;
out vec4 fragColor;

void main(void) {
  vec2 uv = getUVWithCoordinateConversion(vTexCoord, vTexPos);

  vec4 pixel = getPixelSmoothInterpolate(imageTexture, imageTexture2, raster.imageResolution, raster.imageSmoothing, raster.imageInterpolation, raster.imageWeight, bitmap2.isRepeatBounds, uv);
  
  if (isNaN(pixel.a)) {
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
    // fragColor = vec4(pixel.rgb, pixel.a * layer.opacity);
    fragColor = apply_opacity(pixel.rgb, pixel.a * layer.opacity);
  } else {
    float paletteWidth = float(textureSize(paletteTexture, 0).x);
    float paletteGrayscaleValue = pixel.r * max(paletteWidth - 1.0, 0.0);
    vec4 targetColor = applyPaletteGrayscale(paletteTexture, paletteGrayscaleValue);
    fragColor = apply_opacity(targetColor.rgb, targetColor.a * layer.opacity);

    if (bool(raster.borderEnabled)) {
      vec2 pixelSize = vec2(length(dFdx(uv)), length(dFdy(uv)));
      vec2 borderWidth = raster.borderWidth / 2.0 * pixelSize;
      if ((uv.x < borderWidth.x || uv.x > 1.0 - borderWidth.x) || (uv.y < borderWidth.y || uv.y > 1.0 - borderWidth.y)) {
        fragColor = apply_opacity(raster.borderColor.rgb, raster.borderColor.a * layer.opacity * 2.0);
      }
    }

    if (bool(raster.gridEnabled)) {
      float imageDownscaleResolutionFactor = 1.0 + max(0.0, raster.imageSmoothing);
      vec2 imageDownscaleResolution = raster.imageResolution / imageDownscaleResolutionFactor;

      vec2 uvWithOffset;
      uvWithOffset.x = bitmap2.isRepeatBounds ?
        uv.x + 0.5 / imageDownscaleResolution.x :
        mix(0.0 + 0.5 / imageDownscaleResolution.x, 1.0 - 0.5 / imageDownscaleResolution.x, uv.x);
      uvWithOffset.y =
        mix(0.0 + 0.5 / imageDownscaleResolution.y, 1.0 - 0.5 / imageDownscaleResolution.y, uv.y);

      vec2 tuv = uvWithOffset * imageDownscaleResolution - 0.5;
      vec2 fuv = fract(tuv);

      vec2 pixelSize = vec2(length(dFdx(uv)), length(dFdy(uv)));
      vec2 gridSize = raster.gridSize / 2.0 * pixelSize * raster.imageResolution;
      if ((fuv.x < gridSize.x || fuv.x > 1.0 - gridSize.x) || (fuv.y < gridSize.y || fuv.y > 1.0 - gridSize.y)) {
        fragColor = apply_opacity(raster.gridColor.rgb, raster.gridColor.a * layer.opacity * 2.0);
      }
    }
  }

  // During the picking pass, force alpha to 1.0 so deck.gl's hit test
  // (which keys on framebuffer alpha) succeeds regardless of how transparent
  // the visible pixel is. RGB is preserved so getPickingInfo can recover the
  // data value from the rendered/palette-mapped color.
  if (bool(picking.isActive) && !bool(picking.isAttribute)) {
    if (bool(palette.hasPaletteTexture)) {
      float paletteValue = getPaletteValue(palette.paletteBounds[0], palette.paletteBounds[1], value);
      float directionValue = getPixelDirectionValue(pixel, raster.imageType, raster.imageUnscale);
      float paletteWidth = float(textureSize(paletteTexture, 0).x);
      float paletteGrayscaleValue = pixel.r * max(paletteWidth - 1.0, 0.0);
      vec4 targetColor = applyPaletteGrayscale(paletteTexture, paletteGrayscaleValue);
      fragColor = vec4(paletteValue, targetColor.rgb);
    }
    fragColor.a = 1.0;
  }
}`;
