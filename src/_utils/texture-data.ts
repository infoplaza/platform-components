import type {TypedArrayWithDimensions} from 'geotiff';
import {createErrorWithCause, getLibrary} from './library';
import {Queue} from './queue';
import {retry} from './retry';

export type TextureDataArray = Uint8Array | Uint8ClampedArray | Float32Array;

export interface TextureData {
  data: TextureDataArray;
  width: number;
  height: number;
}

export type FloatDataArray = Float32Array;

export interface FloatData {
  data: FloatDataArray;
  width: number;
  height: number;
}

export interface LoadOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface CachedLoadOptions<T> extends LoadOptions {
  cache?: Map<string, T | Promise<T>> | false;
}

export type LoadFunction<T> = (url: string, options?: LoadOptions) => Promise<T>;
export type CachedLoadFunction<T> = (url: string, options?: CachedLoadOptions<T>) => Promise<T>;

const DEFAULT_CACHE = new Map<string, any>();

function maskData(data: TextureDataArray, nodata: number | null): TextureDataArray {
  if (nodata == undefined) {
    return data;
  }

  // sea_ice_fraction:
  // - real nodata: 1.27999997138977
  // - meta nodata: 1.27999997138977095, parsed in JS as 1.279999971389771
  const maskedData = data.slice(0);
  for (let i = 0; i < maskedData.length; i++) {
    if (Math.abs(maskedData[i] - nodata) < Number.EPSILON * 2) {
      maskedData[i] = NaN;
    }
  }

  return maskedData;
}

const imageDecodeQueue = new Queue();

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('Aborted', 'AbortError');
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

// Bridge a (possibly cached) value/promise to a caller-provided AbortSignal so
// that aborting only rejects this caller's wait without cancelling shared work.
function waitWithSignal<T>(value: T | Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) {
    return Promise.resolve(value);
  }
  if (signal.aborted) {
    return Promise.reject(abortReason(signal));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal));
    signal.addEventListener('abort', onAbort, {once: true});
    Promise.resolve(value).then(
      v => {
        signal.removeEventListener('abort', onAbort);
        resolve(v);
      },
      e => {
        signal.removeEventListener('abort', onAbort);
        reject(e);
      },
    );
  });
}

async function loadImage(url: string, options?: LoadOptions): Promise<TextureData | null> {
  const signal = options?.signal;
  if (signal?.aborted) {
    throw abortReason(signal);
  }

  let image: HTMLImageElement;
  try {
    image = await retry(async () => {
      // Only the blob path needs a fetch (for custom headers). The plain
      // <img src=…> path supports a lower CSP and is preferred otherwise.
      let blobUrl: string | undefined;
      if (options?.headers) {
        const response = await fetch(url, {headers: options.headers, signal});
        if (!response.ok) {
          throw new Error(`URL ${url} can't be loaded. Status: ${response.status}`);
        }
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
      }

      const img = new Image();
      try {
        await new Promise<void>((resolve, reject) => {
          if (signal?.aborted) {
            reject(abortReason(signal));
            return;
          }
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            signal?.removeEventListener('abort', onAbort);
          };
          const onLoad = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error(`URL ${url} can't be loaded.`));
          };
          // Cancel the in-flight network/decoding work for this <img>
          // by clearing src; the load event will never fire.
          const onAbort = () => {
            cleanup();
            img.src = '';
            reject(abortReason(signal!));
          };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
          signal?.addEventListener('abort', onAbort, {once: true});
          img.crossOrigin = 'anonymous';
          img.src = blobUrl ?? url;
        });
      } finally {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      }
      return img;
    }, {signal});
  } catch (e) {
    // Propagate aborts so callers (and the cache layer) can distinguish
    // cancellation from real load failures. Preserve previous behaviour
    // of returning null for non-abort errors.
    if (isAbortError(e)) {
      throw e;
    }
    return null;
  }

  if (signal?.aborted) {
    throw abortReason(signal);
  }

  // Decode images in a global queue to ensure only a single decode runs at a
  // time — fixes "Image can't be decoded" caused by parallel decodes hitting
  // a memory limit. See https://issues.chromium.org/issues/40676514.
  // Re-check the signal once we get to the front of the queue.
  try {
    await imageDecodeQueue.run(async () => {
      if (signal?.aborted) {
        throw abortReason(signal);
      }
      await image.decode();
    });
  } catch (e) {
    if (isAbortError(e)) {
      throw e;
    }
    throw createErrorWithCause(`Image ${url} can't be decoded.`, e);
  }

  if (signal?.aborted) {
    throw abortReason(signal);
  }

  // Defensive checks: never read pixels from a partially loaded image.
  // The `load` event sometimes fires for an image whose decode is incomplete
  // (network drop, layer change mid-load); reading getImageData on that
  // canvas yields zeroed/garbage RGBA. Bail out instead.
  if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error(
      `Image ${url} is not fully loaded (complete=${image.complete}, ${image.naturalWidth}x${image.naturalHeight}).`,
    );
  }

  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Image ${url} has invalid dimensions: ${image.width}x${image.height}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

async function loadGeotiff(url: string, options?: LoadOptions): Promise<TextureData> {
  const GeoTIFF = await getLibrary('geotiff');

  return retry(async () => {
    let geotiff;
    try {
      geotiff = await GeoTIFF.fromUrl(url, {
        allowFullFile: true,
        blockSize: Number.MAX_SAFE_INTEGER, // larger blockSize helps with errors, see https://github.com/geotiffjs/geotiff/issues/218
        fetch: (url: string, init?: RequestInit) => fetch(url, {...init, headers: {...init?.headers, ...options?.headers}}),
      } as any, options?.signal);
    } catch (e) {
      throw createErrorWithCause(`Image ${url} can't be decoded.`, e);
    }
    const geotiffImage = await geotiff.getImage(0);

    const sourceData = await geotiffImage.readRasters({interleave: true, signal: options?.signal}) as TypedArrayWithDimensions;
    if (!(sourceData instanceof Uint8Array || sourceData instanceof Uint8ClampedArray || sourceData instanceof Float32Array)) {
      throw new Error('Unsupported data format');
    }
    const nodata = geotiffImage.getGDALNoData();
    const data = maskData(sourceData, nodata);

    const width = geotiffImage.getWidth();
    const height = geotiffImage.getHeight();

    return {data, width, height};
  }, {signal: options?.signal});
}

function loadCached<T>(loadFunction: LoadFunction<T>): CachedLoadFunction<T> {
  return async (url: string, options?: CachedLoadOptions<T>) => {
    if (options?.cache === false) {
      return loadFunction(url, options);
    }

    const cache = options?.cache ?? DEFAULT_CACHE;
    const cacheKey = url + (options?.headers ? ':' + JSON.stringify(options?.headers) : '');
    const cached = cache.get(cacheKey);
    if (cached) {
      return waitWithSignal(cached, options?.signal);
    }

    // Per-caller signal must not cancel the shared load (other callers may be
    // awaiting it). Strip it from the options handed to the loader and bridge
    // the caller's signal at the wait site.
    const sharedOptions = {...options, cache: undefined, signal: undefined};
    const dataPromise = loadFunction(url, sharedOptions);
    cache.set(cacheKey, dataPromise);
    dataPromise.then(
      data => {
        cache.set(cacheKey, data);
      },
      () => {
        // Don't poison the cache with rejected/aborted loads — let the
        // next caller retry.
        if (cache.get(cacheKey) === dataPromise) {
          cache.delete(cacheKey);
        }
      },
    );
    return waitWithSignal(dataPromise, options?.signal);
  };
}

export const loadTextureData = loadCached(async (url: string, options?: LoadOptions) => {
  if (url.includes('png') || url.includes('.webp') || url.includes('image/png') || url.includes('image')) {
    return loadImage(url, options);
  } else if (url.includes('.tif') || url.includes('image/tif')) {
    return loadGeotiff(url, options);
  } else {
    // throw new Error('Unsupported data format');
    return null;
  }
});

const GRAYSCALE_CACHE = new Map<string, TextureData | Promise<TextureData | null> | null>();

const loadGrayscaleImageInner = loadCached(async (url: string, options?: LoadOptions): Promise<TextureData | null> => {
  if (url.includes('.tif') || url.includes('image/tif')) {
    // GeoTIFF already produces typed-array bands; pass through unchanged.
    return loadGeotiff(url, options);
  }
  const rgba = await loadImage(url, options);
  if (!rgba) {
    return null;
  }
  const {width, height, data: rgbaData} = rgba;
  const r = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < r.length; i++, j += 4) {
    r[i] = rgbaData[j];
  }
  return {data: r, width, height};
});

export const loadGrayscaleImage: CachedLoadFunction<TextureData | null> = (url, options) =>
  loadGrayscaleImageInner(url, {...options, cache: options?.cache ?? GRAYSCALE_CACHE});

const VECTOR_CACHE = new Map<string, TextureData | Promise<TextureData | null> | null>();

// Vector fields (e.g. wind u/v) pack two scalar components per pixel into the
// R and G channels. Decode them into a tightly packed 2-band Uint8Array so
// the GPU texture is uploaded as `rg8unorm` (see _utils/texture.ts) instead
// of the default RGBA.
const loadVectorImageInner = loadCached(async (url: string, options?: LoadOptions): Promise<TextureData | null> => {
  if (url.includes('.tif') || url.includes('image/tif')) {
    return loadGeotiff(url, options);
  }
  const rgba = await loadImage(url, options);
  if (!rgba) {
    return null;
  }
  const {width, height, data: rgbaData} = rgba;
  const rg = new Uint8Array(width * height * 2);
  for (let i = 0, j = 0; j < rgbaData.length; i += 2, j += 4) {
    rg[i] = rgbaData[j];
    rg[i + 1] = rgbaData[j + 1];
  }
  return {data: rg, width, height};
});

export const loadVectorImage: CachedLoadFunction<TextureData | null> = (url, options) =>
  loadVectorImageInner(url, {...options, cache: options?.cache ?? VECTOR_CACHE});

export const loadJson = loadCached(async (url: string, options?: LoadOptions)  => {
  return retry(async () => {
    const response = await fetch(url, {headers: options?.headers, signal: options?.signal});
    if (!response.ok) {
      throw new Error(`URL ${url} can't be loaded. Status: ${response.status}`);
    }
    return response.json();
  }, {signal: options?.signal});
});


export const loadBytes = loadCached(async (url: string, options?: LoadOptions) => {
  return retry(async () => {
    const res = await fetch(url, {signal: options?.signal});
    const widthHeader = res.headers.get('X-Width');
    const heightHeader = res.headers.get('X-Height');
    if (widthHeader == null || heightHeader == null) {
      throw new Error(`Missing X-Width/X-Height headers for ${url}.`);
    }
    const width = parseInt(widthHeader, 10);
    const height = parseInt(heightHeader, 10);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error(`Invalid X-Width/X-Height headers for ${url}: ${widthHeader}x${heightHeader}.`);
    }
    const raw = new Uint8Array(await res.arrayBuffer());

    const expected = width * height;
    if (raw.length === expected) {
      return {data: raw, width, height};
    }
    if (raw.length === expected * 4) {
      const rgba = new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.byteLength);
      return new ImageData(rgba, width, height);
    }
    throw new Error(
      `Unexpected byte length ${raw.length} for ${width}x${height} (expected ${expected} or ${expected * 4}).`,
    );
  }, {signal: options?.signal});
});

/**
 * Drops every entry held by the shared loader cache. Used when a new fetch
 * generation invalidates the previous URLs entirely (e.g. the user pans the
 * map and bounds change), so we don't keep image bytes around for tiles
 * that will never be rendered again. Pending promises already handed out
 * to callers continue to resolve normally; only the dedupe table is cleared.
 */
export function clearTextureDataCache(): void {
  DEFAULT_CACHE.clear();
  GRAYSCALE_CACHE.clear();
  VECTOR_CACHE.clear();
}