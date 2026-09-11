/**
 * luma.gl throws if a second Deck attaches to a MapLibre canvas WebGL context
 * (React Strict Mode remounts / reuseMaps). Opt into device reuse for interleaved mode.
 * @see https://github.com/visgl/deck.gl/issues/9379
 */
export const DECK_DEVICE_PROPS = {
  _reuseDevices: true,
} as const

/** Screen-space text/icon sizing for interleaved MapLibre overlays. */
export const LAYER_SIZE_UNITS = 'pixels' as const
