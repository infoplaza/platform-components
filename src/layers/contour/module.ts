import type {ShaderModule} from '@luma.gl/shadertools';

const sourceCode = `uniform contourUniforms {
  float interval;
  float majorInterval;
  float width;
} contour;`;

const tokens = {
  interval: 'interval',
  majorInterval: 'majorInterval',
  width: 'width',
} as const;

export type ContourModuleProps = {
  interval: number;
  majorInterval: number;
  width: number;
};

type ContourModuleUniforms = {[_K in keyof typeof tokens]: any};

function getUniforms(props: Partial<ContourModuleProps> = {}): ContourModuleUniforms {
  return {
    [tokens.interval]: props.interval,
    [tokens.majorInterval]: props.majorInterval,
    [tokens.width]: props.width,
  };
}

export const contourModule = {
  name: 'contour',
  vs: sourceCode,
  fs: sourceCode,
  uniformTypes: {
    [tokens.interval]: 'f32',
    [tokens.majorInterval]: 'f32',
    [tokens.width]: 'f32',
  },
  getUniforms,
} as const satisfies ShaderModule<ContourModuleProps, ContourModuleUniforms>;
