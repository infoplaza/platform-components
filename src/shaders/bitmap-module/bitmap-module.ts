import type { ShaderModule } from '@luma.gl/shadertools'
import type { CoordinateSystem } from '@deck.gl/core'
import type { Color } from '@deck.gl/core'
import type { BitmapBoundingBox } from '@deck.gl/layers'
import { deckColorToGl } from '../../_utils/color'
import { isRepeatBounds } from '../../_utils/bounds'

const sourceCode = `uniform bitmap2Uniforms {
  vec4 bounds;
  bool isRepeatBounds;
  float coordinateConversion;
  vec4 transparentColor;
} bitmap2;

// copied from https://github.com/visgl/deck.gl/blob/master/modules/layers/src/bitmap-layer/bitmap-layer-fragment.ts

/* projection utils */
// duplicate consts from project shader module, but can't be used because they are missing in vertex shaders
const float _TILE_SIZE = 512.0;
const float _PI = 3.1415926536;
const float _WORLD_SCALE = _TILE_SIZE / _PI / 2.0;

// from degrees to Web Mercator
vec2 lnglat_to_mercator(vec2 lnglat) {
  float x = lnglat.x;
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + _PI,
    _PI + log(tan(_PI * 0.25 + radians(y) * 0.5))
  ) * _WORLD_SCALE;
}

// from Web Mercator to degrees
vec2 mercator_to_lnglat(vec2 xy) {
  xy /= _WORLD_SCALE;
  return degrees(vec2(
    xy.x - _PI,
    atan(exp(xy.y - _PI)) * 2.0 - _PI * 0.5
  ));
}
/* End projection utils */

vec4 apply_opacity(vec3 color, float alpha) {
  // return mix(bitmap2.transparentColor, vec4(color, 1.0), alpha);
  if (bitmap2.transparentColor.a == 0.0) {
    return vec4(color, alpha);
  }
  float blendedAlpha = alpha + bitmap2.transparentColor.a * (1.0 - alpha);
  float highLightRatio = alpha / blendedAlpha;
  vec3 blendedRGB = mix(bitmap2.transparentColor.rgb, color, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - bitmap2.bounds[0]) / (bitmap2.bounds[2] - bitmap2.bounds[0]),
    (pos.y - bitmap2.bounds[3]) / (bitmap2.bounds[1] - bitmap2.bounds[3])
  );
}

vec2 getUVWithCoordinateConversion(vec2 texCoord, vec2 texPos) {
  vec2 uv = texCoord;
  if (bitmap2.coordinateConversion < -0.5) {
    vec2 lnglat = mercator_to_lnglat(texPos);
    uv = getUV(lnglat);
  } else if (bitmap2.coordinateConversion > 0.5) {
    vec2 commonPos = lnglat_to_mercator(texPos);
    uv = getUV(commonPos);
  }
  return uv;
}`

const tokens = {
    bounds: 'bounds',
    isRepeatBounds: 'isRepeatBounds',
    coordinateConversion: 'coordinateConversion',
    transparentColor: 'transparentColor'
} as const

export type BitmapModuleProps = {
  viewportGlobe?: boolean;
  bounds?: BitmapBoundingBox;
  _imageCoordinateSystem?: CoordinateSystem;
  transparentColor?: Color | null;
};

type BitmapModuleUniforms = {[K in keyof typeof tokens]: any};

function isRectangularBounds(bounds: BitmapBoundingBox): bounds is [number, number, number, number] {
    return Number.isFinite(bounds[0])
}

// copied from https://github.com/visgl/math.gl/blob/master/modules/web-mercator/src/web-mercator-utils.ts
const PI = Math.PI
const PI_4 = PI / 4
const DEGREES_TO_RADIANS = PI / 180
const TILE_SIZE = 512

function lngLatToWorld(lngLat: number[]): [number, number] {
    const [lng, lat] = lngLat
    const lambda2 = lng * DEGREES_TO_RADIANS
    const phi2 = lat * DEGREES_TO_RADIANS
    const x = (TILE_SIZE * (lambda2 + PI)) / (2 * PI)
    const y = (TILE_SIZE * (PI + Math.log(Math.tan(PI_4 + phi2 * 0.5)))) / (2 * PI)

    return [x, y]
}

// copied from https://github.com/visgl/deck.gl/blob/master/modules/layers/src/bitmap-layer/bitmap-layer.ts
function _getCoordinateUniforms(props: Partial<BitmapModuleProps> = {}): {coordinateConversion: number; bounds: [number, number, number, number]} {
    let { viewportGlobe, bounds, _imageCoordinateSystem: imageCoordinateSystem } = props
    if (!isRectangularBounds(bounds!)) {
        throw new Error('_imageCoordinateSystem only supports rectangular bounds')
    }

    if (imageCoordinateSystem !== 'default') {
    // The default behavior (linearly interpolated tex coords)
        const defaultImageCoordinateSystem: CoordinateSystem = viewportGlobe ? 'lnglat' : 'cartesian'
        imageCoordinateSystem = imageCoordinateSystem === 'lnglat' ? 'lnglat' : 'cartesian'

        if (imageCoordinateSystem === 'lnglat' && defaultImageCoordinateSystem === 'cartesian') {
            // LNGLAT in Mercator, e.g. display LNGLAT-encoded image in WebMercator projection
            return { coordinateConversion: -1, bounds }
        }
        if (imageCoordinateSystem === 'cartesian' && defaultImageCoordinateSystem === 'lnglat') {
            // Mercator in LNGLAT, e.g. display WebMercator encoded image in Globe projection
            const bottomLeft = lngLatToWorld([bounds[0], bounds[1]])
            const topRight = lngLatToWorld([bounds[2], bounds[3]])

            return {
                coordinateConversion: 1,
                bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
            }
        }
    }

    return { coordinateConversion: 0, bounds } // bounds are used by particle layer in globe
}

function getUniforms(props: Partial<BitmapModuleProps> = {}): BitmapModuleUniforms {
    const { bounds, coordinateConversion } = _getCoordinateUniforms(props)

    return {
        [tokens.bounds]: bounds,
        [tokens.isRepeatBounds]: isRepeatBounds(bounds) ? 1 : 0,
        [tokens.coordinateConversion]: coordinateConversion,
        [tokens.transparentColor]: props.transparentColor ? deckColorToGl(props.transparentColor) : [0, 0, 0, 0],
    }
}

export const bitmapModule = {
    name: 'bitmap2',
    vs: sourceCode,
    fs: sourceCode,
    uniformTypes: {
        [tokens.bounds]: 'vec4<f32>',
        [tokens.isRepeatBounds]: 'f32',
        [tokens.coordinateConversion]: 'f32',
        [tokens.transparentColor]: 'vec4<f32>',
    },
    getUniforms,
} as const satisfies ShaderModule<BitmapModuleProps, BitmapModuleUniforms>