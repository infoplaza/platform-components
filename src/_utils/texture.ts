import type {Device, Texture, TextureProps, TextureFormat} from '@luma.gl/core';
import type {TextureData} from './texture-data.js';

const repeatCache = new WeakMap<Device, WeakMap<TextureData, Texture>>();
const clampCache = new WeakMap<Device, WeakMap<TextureData, Texture>>();

// Strong references so disposeTextureCache() can iterate. The WeakMap above
// only releases entries once the keying TextureData is GC'd; in practice the
// shared loader cache (DEFAULT_CACHE in texture-data.ts) keeps that data
// alive forever, so without an explicit dispose path GPU textures pile up as
// the user pans the map and new tiles are fetched.
const knownDevices = new Set<Device>();
let trackedTextures = new Set<Texture>();

function getTextureProps(device: Device, image: TextureData, repeat: boolean): TextureProps {
  const {data, width, height} = image;
  const bandsCount = data.length / (width * height);

  let format: TextureFormat;
  if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    if (bandsCount === 4) {
      format = 'rgba8unorm';
    } else if (bandsCount === 2) {
      format = 'rg8unorm'; // TODO: deck.gl 9 verify
    } else if (bandsCount === 1) {
      format = 'r8unorm';
    } else {
      throw new Error('Unsupported data format');
    }
  } else if (data instanceof Float32Array) {
    if (!device.features.has('float32-renderable-webgl')) {
      throw new Error('Float textures are required');
    }

    if (bandsCount === 2) {
      format = 'rg32float';
    } else if (bandsCount === 1) {
      format = 'r32float';
    } else {
      throw new Error('Unsupported data format');
    }
  } else {
    throw new Error('Unsupported data format');
  }

  return {
    data,
    width,
    height,
    format,
    mipmaps: false,
    sampler: {
      // custom interpolation in pixel.glsl
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: repeat ? 'repeat' : 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      lodMaxClamp: 0,
    },
  } as TextureProps;
}

export function createTextureCached(device: Device, image: TextureData, repeat: boolean = false): Texture {
  knownDevices.add(device);
  const cache = repeat ? repeatCache : clampCache;
  const cache2 = cache.get(device) ?? (() => {
    const cache2 = new WeakMap<TextureData, Texture>()
    cache.set(device, cache2);
    return cache2;
  })();

  const texture = cache2.get(image) ?? (() => {
    const textureProps = getTextureProps(device, image, repeat);
    const texture = device.createTexture(textureProps);
    cache2.set(image, texture);
    trackedTextures.add(texture);
    return texture;
  })();
  return texture;
}

/**
 * Releases every GPU texture handed out by createTextureCached so far and
 * resets the per-device caches. Caller must ensure no deck.gl layer is
 * still drawing with these textures (e.g. defer until after layers have
 * been detached). Subsequent createTextureCached calls allocate fresh
 * textures.
 */
export function disposeTextureCache(): void {
  // Snapshot first so any textures created concurrently with the destroy
  // loop (e.g. from a render that fires while we're iterating) land in a
  // fresh set instead of being torn down.
  const toDispose = trackedTextures;
  trackedTextures = new Set();

  // Replace the cached WeakMaps for every device we've seen so the next
  // createTextureCached call doesn't return one of the textures we're
  // about to destroy.
  for (const device of knownDevices) {
    repeatCache.set(device, new WeakMap());
    clampCache.set(device, new WeakMap());
  }

  for (const texture of toDispose) {
    try {
      texture.destroy();
    } catch {
      // Already destroyed — nothing to do.
    }
  }
}

// empty texture required instead of null
let emptyTexture: Texture | null = null;

export function createEmptyTextureCached(device: Device): Texture {
  if (!emptyTexture) {
    emptyTexture = device.createTexture({data: new Uint8Array(4), width: 1, height: 1});
  }
  return emptyTexture;
}
