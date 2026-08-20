import type { Texture } from '@luma.gl/core'
import type { ShaderModule } from '@luma.gl/shadertools'
import type { Color } from '@deck.gl/core'
import { deckColorToGl } from '../../_utils/color'

const sourceCode = `uniform sampler2D paletteTexture;

uniform paletteUniforms {
  vec2 paletteBounds;
  vec4 paletteColor;
  float hasPaletteTexture;
} palette;

float getPaletteValue(float min, float max, float value) {
  return (value - min) / (max - min);
}

vec4 applyPaletteGrayscale(sampler2D paletteTexture, float value) {
  float paletteWidth = float(textureSize(paletteTexture, 0).x);
  if (paletteWidth <= 0.) {
    return vec4(0.);
  }

  float paletteIndex = clamp(value, 0., paletteWidth - 1.);
  float paletteValue = (paletteIndex + 0.5) / paletteWidth;
  return texture(paletteTexture, vec2(paletteValue, 0.5));
}

vec4 applyPalette(sampler2D paletteTexture, vec2 paletteBounds, vec4 paletteColor, float value) {
  if (paletteBounds[0] < paletteBounds[1]) {
    float paletteValue = getPaletteValue(paletteBounds[0], paletteBounds[1], value);
    return texture(paletteTexture, vec2(paletteValue, 0.));
  } else {
    return paletteColor;
  }
}`

const tokens = {
    paletteBounds: 'paletteBounds',
    paletteColor: 'paletteColor',
    hasPaletteTexture: 'hasPaletteTexture',
} as const

export type PaletteModuleProps = {
  paletteTexture?: Texture;
  paletteBounds?: [number, number];
  paletteColor?: Color | null;
  hasPaletteTexture?: boolean | null;
};

type PaletteModuleUniforms = {
  paletteBounds: [number, number];
  paletteColor: [number, number, number, number];
  hasPaletteTexture: number;
}

type PaletteModuleBindings = Pick<PaletteModuleProps, 'paletteTexture'>

function getUniforms(props: Partial<PaletteModuleProps> = {}): PaletteModuleUniforms {
    return {
        [tokens.paletteBounds]: props.paletteBounds ?? [0, 0],
        [tokens.paletteColor]: props.paletteColor ? deckColorToGl(props.paletteColor) : [0, 0, 0, 0],
        [tokens.hasPaletteTexture]: Number(Boolean(props.hasPaletteTexture)),
    }
}

export const paletteModule = {
    name: 'palette',
    vs: sourceCode,
    fs: sourceCode,
    uniformTypes: {
        [tokens.paletteBounds]: 'vec2<f32>',
        [tokens.paletteColor]: 'vec4<f32>',
        [tokens.hasPaletteTexture]: 'f32',
    },
    getUniforms,
} as const satisfies ShaderModule<PaletteModuleProps, PaletteModuleUniforms, PaletteModuleBindings>