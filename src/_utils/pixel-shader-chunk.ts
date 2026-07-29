/**
 * Shared GLSL pixel helpers used by raster fragment shaders.
 * Keep these helpers in sync with `pixel-value.glsl` and `pixel.glsl`.
 */
export const PIXEL_VALUE_SHADER_CHUNK = `
float atan2(float y, float x) {
  return x == 0.0 ? sign(y) * _PI / 2.0 : atan(y, x);
}

bool isNaN(float value) {
  highp uint valueUint = floatBitsToUint(value);
  return (valueUint & 0x7fffffffu) > 0x7f800000u;
}

bool hasPixelValue(vec4 pixel, vec2 imageUnscale, float imageFillValue, float imageUseAlphaValidity, float imageType) {
  if (imageFillValue >= 0.0) {
    if (round(pixel.r * 255.0) == imageFillValue) {
      return false;
    }
    if (imageType == 1.0 && round(pixel.g * 255.0) == imageFillValue) {
      return false;
    }
    return true;
  }

  if (imageUseAlphaValidity > 0.5) {
    return pixel.a >= 1.0;
  }

  return imageUnscale[0] >= imageUnscale[1] ? !isNaN(pixel.x) : pixel.a >= 1.0;
}

float getPixelScalarValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    return 0.0;
  }
  return imageUnscale[0] < imageUnscale[1]
    ? mix(imageUnscale[0], imageUnscale[1], pixel.x)
    : pixel.x;
}

vec2 decodeWindUV(vec2 encodedWind) {
  const float maxSpeed = 100.0;
  const float fillOffset = 1.0;
  float speed = exp(encodedWind.r * log(maxSpeed + fillOffset)) - fillOffset;
  float dirRad = radians(encodedWind.g * 360.0);
  return vec2(-speed * sin(dirRad), -speed * cos(dirRad));
}

vec2 getPixelVectorValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    return imageUnscale[0] < imageUnscale[1]
      ? mix(vec2(imageUnscale[0]), vec2(imageUnscale[1]), pixel.xy)
      : decodeWindUV(pixel.rg);
  }
  return vec2(0.0);
}

float getPixelMagnitudeValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  return imageType == 1.0
    ? length(getPixelVectorValue(pixel, imageType, imageUnscale))
    : getPixelScalarValue(pixel, imageType, imageUnscale);
}

float getPixelDirectionValue(vec4 pixel, float imageType, vec2 imageUnscale) {
  if (imageType == 1.0) {
    vec2 value = getPixelVectorValue(pixel, imageType, imageUnscale);
    return mod((360.0 - (atan2(value.y, value.x) / _PI * 180.0 + 180.0)) - 270.0, 360.0) / 360.0;
  }
  return 0.0;
}
`

export const PIXEL_SHADER_CHUNK = `
vec4 getPixel(sampler2D image, vec2 resolution, vec2 texel, vec2 offset) {
  return texture(image, (texel + offset + 0.5) / resolution);
}

vec4 getPixelNearest(
  sampler2D image,
  vec2 resolution,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  vec2 texel = floor(uv * resolution);
  vec4 pixel = getPixel(image, resolution, texel, vec2(0.0));
  return hasPixelValue(pixel, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType)
    ? pixel
    : vec4(0.0);
}

vec4 getPixelLinear(
  sampler2D image,
  vec2 resolution,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  vec2 position = uv * resolution - 0.5;
  vec2 texel = floor(position);
  vec2 fraction = fract(position);
  vec4 samples[4];
  samples[0] = getPixel(image, resolution, texel, vec2(0.0, 0.0));
  samples[1] = getPixel(image, resolution, texel, vec2(1.0, 0.0));
  samples[2] = getPixel(image, resolution, texel, vec2(0.0, 1.0));
  samples[3] = getPixel(image, resolution, texel, vec2(1.0, 1.0));
  float weights[4];
  weights[0] = (1.0 - fraction.x) * (1.0 - fraction.y);
  weights[1] = fraction.x * (1.0 - fraction.y);
  weights[2] = (1.0 - fraction.x) * fraction.y;
  weights[3] = fraction.x * fraction.y;

  vec4 result = vec4(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < 4; i++) {
    if (hasPixelValue(samples[i], imageUnscale, imageFillValue, imageUseAlphaValidity, imageType)) {
      vec4 sampleValue = samples[i];
      if (imageFillValue < 0.0 && imageUseAlphaValidity > 0.5) {
        sampleValue.rgb *= sampleValue.a;
      }
      result += sampleValue * weights[i];
      totalWeight += weights[i];
    }
  }

  if (totalWeight <= 0.0) {
    return vec4(0.0);
  }
  result /= totalWeight;
  if (imageFillValue < 0.0 && imageUseAlphaValidity > 0.5 && result.a > 0.0) {
    result.rgb /= result.a;
  }
  return result;
}

float cubicWeight(float x) {
  float a = abs(x);
  if (a <= 1.0) {
    return 1.5 * a * a * a - 2.5 * a * a + 1.0;
  }
  if (a < 2.0) {
    return -0.5 * a * a * a + 2.5 * a * a - 4.0 * a + 2.0;
  }
  return 0.0;
}

vec4 getPixelCubic(
  sampler2D image,
  vec2 resolution,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  vec2 position = uv * resolution - 0.5;
  vec2 texel = floor(position);
  vec2 fraction = fract(position);
  vec4 anchor = getPixel(image, resolution, floor(position + 0.5), vec2(0.0));
  vec4 result = vec4(0.0);
  float totalWeight = 0.0;

  for (int y = -1; y <= 2; y++) {
    for (int x = -1; x <= 2; x++) {
      float weight = cubicWeight(float(x) - fraction.x) * cubicWeight(float(y) - fraction.y);
      vec4 sampleValue = getPixel(image, resolution, texel, vec2(float(x), float(y)));
      if (!hasPixelValue(sampleValue, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType)) {
        sampleValue = anchor;
      }
      result += sampleValue * weight;
      totalWeight += weight;
    }
  }
  return totalWeight == 0.0 ? anchor : result / totalWeight;
}

vec4 getPixelFilter(
  sampler2D image,
  vec2 resolution,
  float interpolation,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  if (interpolation == 2.0) {
    return getPixelCubic(image, resolution, uv, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  }
  if (interpolation == 1.0) {
    return getPixelLinear(image, resolution, uv, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  }
  return getPixelNearest(image, resolution, uv, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
}

vec2 getImageUV(vec2 resolution, bool isRepeatBounds, vec2 uv) {
  return vec2(
    isRepeatBounds ? uv.x + 0.5 / resolution.x : mix(0.5 / resolution.x, 1.0 - 0.5 / resolution.x, uv.x),
    mix(0.5 / resolution.y, 1.0 - 0.5 / resolution.y, uv.y)
  );
}

vec4 getPixelSmoothInterpolate(
  sampler2D image,
  sampler2D image2,
  vec2 imageResolution,
  float imageSmoothing,
  float imageInterpolation,
  float imageWeight,
  bool isRepeatBounds,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  vec2 resolution = imageResolution / (1.0 + max(0.0, imageSmoothing));
  vec2 sampleUV = getImageUV(resolution, isRepeatBounds, uv);
  vec4 pixel = getPixelFilter(image, resolution, imageInterpolation, sampleUV, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  if (imageWeight <= 0.0) {
    return pixel;
  }

  vec4 pixel2 = getPixelFilter(image2, resolution, imageInterpolation, sampleUV, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  bool valid1 = hasPixelValue(pixel, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  bool valid2 = hasPixelValue(pixel2, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
  float weight1 = valid1 ? 1.0 - imageWeight : 0.0;
  float weight2 = valid2 ? imageWeight : 0.0;
  return weight1 + weight2 > 0.0 ? (pixel * weight1 + pixel2 * weight2) / (weight1 + weight2) : vec4(0.0);
}

bool isFillValueAnchorValid(
  sampler2D image,
  vec2 imageResolution,
  float imageSmoothing,
  bool isRepeatBounds,
  vec2 uv,
  vec2 imageUnscale,
  float imageFillValue,
  float imageUseAlphaValidity,
  float imageType
) {
  if (imageFillValue < 0.0) {
    return true;
  }
  vec2 resolution = imageResolution / (1.0 + max(0.0, imageSmoothing));
  vec2 sampleUV = getImageUV(resolution, isRepeatBounds, uv);
  vec4 anchor = getPixel(image, resolution, floor(sampleUV * resolution), vec2(0.0));
  return hasPixelValue(anchor, imageUnscale, imageFillValue, imageUseAlphaValidity, imageType);
}
`

export const PIXEL_SHADER_HELPERS = `${PIXEL_VALUE_SHADER_CHUNK}\n${PIXEL_SHADER_CHUNK}`
