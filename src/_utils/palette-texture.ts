import type {Device, Texture} from '@luma.gl/core';
import {colorRampCanvas} from './palette';
import type {Scale} from './palette';

export function createPaletteTexture(device: Device, paletteScale: Scale): {paletteBounds: readonly [number, number], paletteTexture: Texture} {
  const paletteDomain = paletteScale.domain() as unknown as number[];
  const paletteBounds = [paletteDomain[0], paletteDomain[paletteDomain.length - 1]] as const;
  const paletteCanvas = colorRampCanvas(paletteScale);
  const paletteTexture = device.createTexture({
    data: paletteCanvas,
    width: paletteCanvas.width,
    height: paletteCanvas.height,
    sampler: {
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
    },
  });

  return {paletteBounds, paletteTexture};
}