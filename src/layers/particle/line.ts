import {CoordinateSystem, COORDINATE_SYSTEM} from '@deck.gl/core';
import type {Color, LayerProps, DefaultProps, UpdateParameters, LayerContext} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import type {LineLayerProps, BitmapBoundingBox} from '@deck.gl/layers';
import type {Buffer, Texture} from '@luma.gl/core';
import {BufferTransform} from '@luma.gl/engine';
import {DEFAULT_LINE_WIDTH, DEFAULT_LINE_COLOR, ensureDefaultProps} from '../../_utils/props';
import {ImageInterpolation} from '../../_utils/image-interpolation';
import {ImageType} from '../../_utils/image-type';
import type {ImageUnscale} from '../../_utils/image-unscale';
import type {ImageFillValue} from '../../_utils/image-fill-value';
import {isViewportGlobe, isViewportMercator, isViewportInZoomBounds, getViewportGlobeCenter, getViewportGlobeRadius, getViewportBounds, getViewportZoom} from '../../_utils/viewport';
import {parsePalette} from '../../_utils/palette';
import type {Palette} from '../../_utils/palette';
import {createPaletteTexture} from '../../_utils/palette-texture';
import {createEmptyTextureCached} from '../../_utils/texture';
import {bitmapModule} from '../../shaders/bitmap-module/bitmap-module';
import type {BitmapModuleProps} from '../../shaders/bitmap-module/bitmap-module';
import {rasterModule} from '../../shaders/raster-module/raster-module';
import type {RasterModuleProps} from '../../shaders/raster-module/raster-module';
import {paletteModule} from '../../shaders/palette-module/palette-module';
import type {PaletteModuleProps} from '../../shaders/palette-module/palette-module';
import {particleModule} from './module';
import type {ParticleModuleProps} from './module';
import {PARTICLE_LINE_LAYER_UPDATE_VS as updateVs} from './vertex';

function intersectLngLatBounds(
  viewport: [number, number, number, number],
  data: [number, number, number, number]
): [number, number, number, number] {
  const minLng = Math.max(viewport[0], data[0]);
  const minLat = Math.max(viewport[1], data[1]);
  const maxLng = Math.min(viewport[2], data[2]);
  const maxLat = Math.min(viewport[3], data[3]);
  if (minLng > maxLng || minLat > maxLat) {
    return data;
  }
  return [minLng, minLat, maxLng, maxLat];
}

const FPS = 30;
const SOURCE_POSITION = 'sourcePosition';
const TARGET_POSITION = 'targetPosition';
const SOURCE_COLOR = 'sourceColor';
const TARGET_COLOR = 'targetColor';
const DROP_POSITION_Z = -1;

type _ParticleLineLayerProps = LineLayerProps<unknown> & {
  _imageCoordinateSystem: CoordinateSystem;
  imageTexture: Texture | null;
  imageTexture2: Texture | null;
  imageSmoothing: number;
  imageInterpolation: ImageInterpolation;
  imageWeight: number;
  imageType: ImageType;
  imageUnscale: ImageUnscale;
  imageMinValue: number | null;
  imageMaxValue: number | null;
  imageFillValue: ImageFillValue;
  isAlphaImage: boolean;
  bounds: BitmapBoundingBox;
  minZoom: number | null;
  maxZoom: number | null;

  palette: Palette | null;
  color: Color | null;

  numParticles: number;
  maxAge: number;
  speedFactor: number;

  width: number;
  animate: boolean;
};

export type ParticleLineLayerProps = _ParticleLineLayerProps & LayerProps;

const defaultProps: DefaultProps<ParticleLineLayerProps> = {
  _imageCoordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  imageTexture: {type: 'object', value: null},
  imageTexture2: {type: 'object', value: null},
  imageSmoothing: {type: 'number', value: 0},
  imageInterpolation: {type: 'object', value: ImageInterpolation.CUBIC},
  imageWeight: {type: 'number', value: 0},
  imageType: {type: 'object', value: ImageType.VECTOR},
  imageUnscale: {type: 'array', value: null},
  imageMinValue: {type: 'object', value: null},
  imageMaxValue: {type: 'object', value: null},
  imageFillValue: {type: 'object', value: null},
  isAlphaImage: {type: 'boolean', value: false},
  bounds: {type: 'array', value: [-180, -90, 180, 90], compare: true},
  minZoom: {type: 'object', value: null},
  maxZoom: {type: 'object', value: 15}, // drop rendering artifacts in high zoom levels due to a low precision

  palette: {type: 'object', value: null},
  color: {type: 'color', value: DEFAULT_LINE_COLOR},

  numParticles: {type: 'number', min: 1, max: 1000000, value: 5000},
  maxAge: {type: 'number', min: 1, max: 255, value: 10},
  speedFactor: {type: 'number', min: 0, max: 50, value: 1},

  width: {type: 'number', value: DEFAULT_LINE_WIDTH},
  animate: true,

  wrapLongitude: true,
};

export class ParticleLineLayer<ExtraPropsT extends {} = {}> extends LineLayer<unknown, ExtraPropsT & Required<_ParticleLineLayerProps>> {
  static layerName = 'ParticleLineLayer';
  static defaultProps = defaultProps;

  declare state: LineLayer['state'] & {
    initialized?: boolean;
    numInstances?: number;
    numAgedInstances?: number;
    sourcePositions?: Buffer;
    targetPositions?: Buffer;
    sourceColors?: Buffer;
    targetColors?: Buffer;
    opacities?: Buffer;
    transform?: BufferTransform;
    previousViewportZoom?: number;
    previousTime?: number;
    paletteTexture?: Texture;
    paletteBounds?: [number, number];
  };

  getShaders(): any {
    const parentShaders = super.getShaders();

    return {
      ...parentShaders,
      inject: {
        ...parentShaders.inject,
        'vs:#decl': (parentShaders.inject?.['vs:#decl'] || '') + `
          in float instanceOpacities;
          out float drop;
          const float DROP_POSITION_Z = -1.;
        `,
        'vs:#main-start': (parentShaders.inject?.['vs:#main-start'] || '') + `
          drop = float(instanceSourcePositions.z == DROP_POSITION_Z || instanceTargetPositions.z == DROP_POSITION_Z);
        `,
        'vs:DECKGL_FILTER_COLOR': (parentShaders.inject?.['vs:DECKGL_FILTER_COLOR'] || '') + `
          color.a = color.a * instanceOpacities;
        `,
        'fs:#decl': (parentShaders.inject?.['fs:#decl'] || '') + `
          in float drop;
        `,
        'fs:#main-start': (parentShaders.inject?.['fs:#main-start'] || '') + `
          if (drop > 0.5) discard;
        `,
      },
    };
  }

  initializeState(): void {
    super.initializeState();

    const attributeManager = this.getAttributeManager()!;
    attributeManager.remove(['instanceSourcePositions', 'instanceTargetPositions', 'instanceColors', 'instanceWidths']);
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: 'float32',
        noAlloc: true,
      },
      instanceTargetPositions: {
        size: 3,
        type: 'float32',
        noAlloc: true,
      },
      instanceColors: {
        size: 4,
        type: 'float32', // unorm8?
        noAlloc: true,
      },
      instanceOpacities: {
        size: 1,
        type: 'float32',
        noAlloc: true,
      },
    });
  }

  updateState(params: UpdateParameters<this>): void {
    const {imageType, numParticles, maxAge, width, palette, visible} = params.props;

    super.updateState(params);

    if (!visible) {
      this._deleteTransformFeedback();
      return;
    }

    if (imageType !== ImageType.VECTOR || !numParticles || !maxAge || !width) {
      this._deleteTransformFeedback();
      return;
    }

    if (
      imageType !== params.oldProps.imageType ||
      numParticles !== params.oldProps.numParticles ||
      maxAge !== params.oldProps.maxAge ||
      width !== params.oldProps.width ||
      visible !== params.oldProps.visible
    ) {
      this._setupTransformFeedback();
    }

    if (palette !== params.oldProps.palette) {
      this._updatePalette();
    }
  }

  finalizeState(context: LayerContext): void {
    this._deleteTransformFeedback();

    super.finalizeState(context);
  }

  draw(opts: any): void {
    const {initialized} = this.state;
    if (!initialized) {
      return;
    }

    const {viewport} = this.context;
    const {model} = this.state;
    const {minZoom, maxZoom, width, animate} = ensureDefaultProps(this.props, defaultProps);
    const {sourcePositions, targetPositions, sourceColors, opacities, transform} = this.state;
    if (!sourcePositions || !targetPositions || !sourceColors || !opacities || !transform) {
      return;
    }

    if (model && isViewportInZoomBounds(viewport, minZoom, maxZoom)) {
      model.setAttributes({
        instanceSourcePositions: sourcePositions,
        instanceTargetPositions: targetPositions,
        instanceColors: sourceColors,
        instanceOpacities: opacities,
      });
      model.setConstantAttributes({
        instanceSourcePositions64Low: new Float32Array([0, 0, 0]),
        instanceTargetPositions64Low: new Float32Array([0, 0, 0]),
        instanceWidths: new Float32Array([width]),
      });
      
      model.setParameters({
        ...model.parameters,
        cullMode: 'front', // enable culling to avoid rendering on both sides of the globe; front-face culling because it seems deck.gl uses a wrong winding order and setting frontFace: 'cw' throws "GL_INVALID_ENUM: Enum 0x0000 is currently not supported."
        ...this.props.parameters,
      });

      super.draw(opts);

      if (animate) {
        this.step();
      }
    }
  }

  private _setupTransformFeedback(): void {
    const {device} = this.context;
    const {initialized} = this.state;
    if (initialized) {
      this._deleteTransformFeedback();
    }

    const {numParticles, maxAge} = ensureDefaultProps(this.props, defaultProps);

    // sourcePositions/targetPositions buffer layout:
    // |          age0             |          age1             |          age2             |...|          age(N-1)         |
    // |pos0,pos1,pos2,...,pos(N-1)|pos0,pos1,pos2,...,pos(N-1)|pos0,pos1,pos2,...,pos(N-1)|...|pos0,pos1,pos2,...,pos(N-1)|
    const numInstances = numParticles * maxAge;
    const numAgedInstances = numParticles * (maxAge - 1);
    const initialPositions = new Float32Array(numInstances * 3);
    for (let i = 2; i < initialPositions.length; i += 3) {
      initialPositions[i] = DROP_POSITION_Z;
    }

    const sourcePositions = device.createBuffer(initialPositions);
    const targetPositions = device.createBuffer(initialPositions);
    const sourceColors = device.createBuffer(new Float32Array(numInstances * 4));
    const targetColors = device.createBuffer(new Float32Array(numInstances * 4));
    const opacities = device.createBuffer(new Float32Array(new Array(numInstances).fill(undefined).map((_, i) => {
      const particleAge = Math.floor(i / numParticles);
      const ageMix = 1 - particleAge / maxAge;
      return ageMix * ageMix;
    })));

    // setup transform feedback for particles age0
    const transform = new BufferTransform(device, {
      vs: updateVs,
      modules: [bitmapModule, rasterModule, paletteModule, particleModule],
      vertexCount: numParticles,

      attributes: {
        [SOURCE_POSITION]: sourcePositions,
        [SOURCE_COLOR]: sourceColors,
      },
      bufferLayout: [
        {name: SOURCE_POSITION, format: 'float32x3'},
        {name: SOURCE_COLOR, format: 'float32x4'}, // unorm8x4?
      ],

      feedbackBuffers: {
        [TARGET_POSITION]: targetPositions,
        [TARGET_COLOR]: targetColors,
      },
      varyings: [TARGET_POSITION, TARGET_COLOR],
    });

    this.setState({
      initialized: true,
      numInstances,
      numAgedInstances,
      sourcePositions,
      targetPositions,
      sourceColors,
      targetColors,
      opacities,
      transform,
      previousViewportZoom: 0,
      previousTime: 0,
    });
  }

  private _runTransformFeedback(): void {
    const {initialized} = this.state;
    if (!initialized) {
      return;
    }

    const {device, viewport, timeline} = this.context;
    const {imageTexture, imageTexture2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, imageFillValue, isAlphaImage, bounds, color, numParticles, maxAge, speedFactor, _imageCoordinateSystem} = ensureDefaultProps(this.props, defaultProps);
    const {paletteTexture, paletteBounds, numAgedInstances, sourcePositions, targetPositions, sourceColors, targetColors, transform, previousViewportZoom, previousTime} = this.state;
    if (!imageTexture || typeof numAgedInstances !== 'number' || !sourcePositions || !targetPositions || !sourceColors || !targetColors || !transform) {
      return;
    }

    const time = timeline.getTime();
    if (typeof previousTime === 'number' && time < previousTime + 1000 / FPS) {
      return;
    }

    // viewport
    const viewportGlobe = isViewportGlobe(viewport);
    const viewportGlobeCenter = isViewportGlobe(viewport) ? getViewportGlobeCenter(viewport) : undefined;
    const viewportGlobeRadius = isViewportGlobe(viewport) ? getViewportGlobeRadius(viewport) : undefined;
    // const viewportBounds = isViewportMercator(viewport) ? getViewportBounds(viewport) : undefined;
    const rawViewportBounds = isViewportMercator(viewport) ? getViewportBounds(viewport) : undefined;
    const viewportBounds =
      rawViewportBounds && Array.isArray(bounds) && bounds.length >= 4
        ? intersectLngLatBounds(rawViewportBounds, bounds as [number, number, number, number])
        : rawViewportBounds;
    const viewportZoomChangeFactor = 2 ** ((typeof previousViewportZoom === 'number' ? previousViewportZoom - getViewportZoom(viewport) : 0) * 4);

    // speed factor for current zoom level
    const currentSpeedFactor = speedFactor / 2 ** (getViewportZoom(viewport) + 7);

    const boundImageTexture = imageTexture ?? createEmptyTextureCached(device);
    const boundImageTexture2 = imageTexture2 ?? createEmptyTextureCached(device);
    const boundPaletteTexture = paletteTexture ?? createEmptyTextureCached(device);

    // update particle positions and colors age0
    transform.model.shaderInputs.setProps({
      [bitmapModule.name]: {
        viewportGlobe, 
        bounds, 
        _imageCoordinateSystem,
      } satisfies BitmapModuleProps,
      [rasterModule.name]: {
        imageTexture: boundImageTexture,
        imageTexture2: boundImageTexture2,
        imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, imageFillValue, isAlphaImage,
      } satisfies RasterModuleProps,
      [paletteModule.name]: {
        paletteTexture: boundPaletteTexture,
        paletteBounds, paletteColor: color,
      } satisfies PaletteModuleProps,
      [particleModule.name]: {
        viewportGlobe, viewportGlobeCenter, viewportGlobeRadius, viewportBounds, viewportZoomChangeFactor,
        numParticles, maxAge, speedFactor: currentSpeedFactor,
        time, seed: Math.random(),
      } satisfies ParticleModuleProps,
    });

    transform.model.setBindings({
      imageTexture: boundImageTexture,
      imageTexture2: boundImageTexture2,
      paletteTexture: boundPaletteTexture,
    });

    transform.run({
      clearColor: false,
      clearDepth: false,
      clearStencil: false,
      depthReadOnly: true,
      stencilReadOnly: true,
    });

    const commandEncoder = device.createCommandEncoder();

    // update particle positions age1-age(N-1)
    // copy age0-age(N-2) sourcePositions to age1-age(N-1) targetPositions
    commandEncoder.copyBufferToBuffer({
      sourceBuffer: sourcePositions,
      sourceOffset: 0,
      destinationBuffer: targetPositions,
      destinationOffset: numParticles * 4 * 3,
      size: numAgedInstances * 4 * 3,
    });

    // update particle colors age1-age(N-1)
    // copy age0-age(N-2) colors to age1-age(N-1) colors
    // needs a duplicate copy buffer, because read and write regions overlap
    commandEncoder.copyBufferToBuffer({
      sourceBuffer: sourceColors,
      sourceOffset: 0,
      destinationBuffer: targetColors,
      destinationOffset: numParticles * 4 * 4,
      size: numAgedInstances * 4 * 4,
    });

    const commandBuffer = commandEncoder.finish();
    device.submit(commandBuffer);
    commandEncoder.destroy();

    this._swapTransformFeedback();

    // debug logging position buffer content
    // console.log(new Float32Array(sourcePositions.readSyncWebGL().slice(0, 4 * 4 * 3).buffer), new Float32Array(targetPositions.readSyncWebGL().slice(0, 4 * 4 * 3).buffer), sourceColors.readSyncWebGL().slice(0, 4 * 4 * 1));

    this.state.previousViewportZoom = getViewportZoom(viewport);
    this.state.previousTime = time;
  }

  // see https://github.com/visgl/luma.gl/pull/1883
  private _swapTransformFeedback(): void {
    const {sourcePositions, targetPositions, sourceColors, targetColors, transform} = this.state;
    if (!sourcePositions || !targetPositions || !sourceColors || !targetColors || !transform) {
      return;
    }

    this.state.sourcePositions = targetPositions;
    this.state.targetPositions = sourcePositions;
    this.state.sourceColors = targetColors;
    this.state.targetColors = sourceColors;

    transform.model.setAttributes({
      [SOURCE_POSITION]: targetPositions,
      [SOURCE_COLOR]: targetColors,
    });
    transform.transformFeedback.setBuffers({
      [TARGET_POSITION]: sourcePositions,
      [TARGET_COLOR]: sourceColors,
    });
  }

  private _resetTransformFeedback(): void {
    const {initialized} = this.state;
    if (!initialized) {
      return;
    }

    const {numInstances, sourcePositions, targetPositions, sourceColors, targetColors} = this.state;
    if (typeof numInstances !== 'number' || !sourcePositions || !targetPositions || !sourceColors || !targetColors) {
      return;
    }

    const initialPositions = new Float32Array(numInstances * 3);
    for (let i = 2; i < initialPositions.length; i += 3) {
      initialPositions[i] = DROP_POSITION_Z;
    }

    sourcePositions.write(initialPositions);
    targetPositions.write(initialPositions);
    sourceColors.write(new Float32Array(numInstances * 4));
    targetColors.write(new Float32Array(numInstances * 4));
  }

  private _deleteTransformFeedback(): void {
    const {initialized} = this.state;
    if (!initialized) {
      return;
    }

    const {sourcePositions, targetPositions, sourceColors, targetColors, opacities, transform} = this.state;
    if (!sourcePositions || !targetPositions || !sourceColors || !targetColors || !opacities || !transform) {
      return;
    }

    sourcePositions.destroy();
    targetPositions.destroy();
    sourceColors.destroy();
    targetColors.destroy();
    opacities.destroy();
    transform.destroy();

    this.setState({
      initialized: false,
      sourcePositions: undefined,
      targetPositions: undefined,
      sourceColors: undefined,
      targetColors: undefined,
      opacities: undefined,
      transform: undefined,
    });
  }

  private _updatePalette(): void {
    const {device} = this.context;
    const {palette} = ensureDefaultProps(this.props, defaultProps);
    if (!palette) {
      this.setState({paletteTexture: undefined, paletteBounds: undefined});
      return;
    }

    const paletteScale = parsePalette(palette);
    const {paletteBounds, paletteTexture} = createPaletteTexture(device, paletteScale);

    this.setState({paletteTexture, paletteBounds});
  }

  step(): void {
    this._runTransformFeedback();

    this.setNeedsRedraw();
  }

  clear(): void {
    this._resetTransformFeedback();

    this.setNeedsRedraw();
  }
}