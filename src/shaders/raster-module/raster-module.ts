import type { Color } from '@deck.gl/core'
import type { Texture } from '@luma.gl/core'
import type { ShaderModule } from '@luma.gl/shadertools'
import { deckColorToGl } from '../../_utils/color'
import { ImageInterpolation } from '../../_utils/image-interpolation'
import { ImageType } from '../../_utils/image-type'

const sourceCode = `uniform sampler2D imageTexture;
uniform sampler2D imageTexture2;

uniform rasterUniforms {
  vec2 imageResolution;
  float imageSmoothing;
  float imageInterpolation;
  float imageWeight;
  float imageType;
  vec2 imageUnscale;
  float imageMinValue;
  float imageMaxValue;
  float borderEnabled;
  float borderWidth;
  vec4 borderColor;
  float gridEnabled;
  float gridSize;
  vec4 gridColor;
} raster;`

const tokens = {
    imageResolution: 'imageResolution',
    imageSmoothing: 'imageSmoothing',
    imageInterpolation: 'imageInterpolation',
    imageWeight: 'imageWeight',
    imageType: 'imageType',
    imageUnscale: 'imageUnscale',
    imageMinValue: 'imageMinValue',
    imageMaxValue: 'imageMaxValue',
    borderEnabled: 'borderEnabled',
    borderWidth: 'borderWidth',
    borderColor: 'borderColor',
    gridEnabled: 'gridEnabled',
    gridSize: 'gridSize',
    gridColor: 'gridColor'
} as const

export type RasterModuleProps = {
  imageTexture: Texture;
  imageTexture2?: Texture;
  imageResolution?: [number, number] | null;
  imageSmoothing?: number | null;
  imageInterpolation?: ImageInterpolation | null;
  imageWeight?: number | null;
  imageType?: ImageType | null;
  imageUnscale?: [number, number] | null;
  imageMinValue?: number | null;
  imageMaxValue?: number | null;
  borderEnabled?: boolean | null;
  borderWidth?: number | null;
  borderColor?: Color | null;
  gridEnabled?: boolean | null;
  gridSize?: number | null;
  gridColor?: Color | null;
};

type RasterModuleUniforms = { [_K in keyof typeof tokens]: any }

function getUniforms(props: Partial<RasterModuleProps> = {}): RasterModuleUniforms {
    const imageResolution = props.imageResolution ?? (props.imageTexture ? [props.imageTexture.width, props.imageTexture.height] : [0, 0]);
    return {
        [tokens.imageResolution]: imageResolution,
        [tokens.imageSmoothing]: props.imageSmoothing ?? 0,
        [tokens.imageInterpolation]: Object.values(ImageInterpolation).indexOf(props.imageInterpolation ?? ImageInterpolation.NEAREST),
        [tokens.imageWeight]: props.imageTexture2 !== props.imageTexture && props.imageWeight ? props.imageWeight : 0,
        [tokens.imageType]: Object.values(ImageType).indexOf(props.imageType ?? ImageType.SCALAR),
        [tokens.imageUnscale]: props.imageUnscale ?? [0, 0],
        [tokens.imageMinValue]: props.imageMinValue ?? Number.MIN_SAFE_INTEGER,
        [tokens.imageMaxValue]: props.imageMaxValue ?? Number.MAX_SAFE_INTEGER,
        [tokens.borderEnabled]: props.borderEnabled ? 1 : 0,
        [tokens.borderWidth]: props.borderWidth ?? 0,
        [tokens.borderColor]: props.borderColor ? deckColorToGl(props.borderColor) : [0, 0, 0, 0],
        [tokens.gridEnabled]: props.gridEnabled ? 1 : 0,
        [tokens.gridSize]: props.gridSize ?? 0,
        [tokens.gridColor]: props.gridColor ? deckColorToGl(props.gridColor) : [0, 0, 0, 0],
    }
}

export const rasterModule = {
    name: 'raster',
    vs: sourceCode,
    fs: sourceCode,
    uniformTypes: {
        [tokens.imageResolution]: 'vec2<f32>',
        [tokens.imageSmoothing]: 'f32',
        [tokens.imageInterpolation]: 'f32',
        [tokens.imageWeight]: 'f32',
        [tokens.imageType]: 'f32',
        [tokens.imageUnscale]: 'vec2<f32>',
        [tokens.imageMinValue]: 'f32',
        [tokens.imageMaxValue]: 'f32',
        [tokens.borderEnabled]: 'f32',
        [tokens.borderWidth]: 'f32',
        [tokens.borderColor]: 'vec4<f32>',
        [tokens.gridEnabled]: 'f32',
        [tokens.gridSize]: 'f32',
        [tokens.gridColor]: 'vec4<f32>',
    },
    getUniforms,
} as const satisfies ShaderModule<RasterModuleProps, RasterModuleUniforms>