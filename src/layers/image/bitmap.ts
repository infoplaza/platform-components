import type {Color, LayerProps, DefaultProps, UpdateParameters, GetPickingInfoParams} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import type {BitmapLayerProps, BitmapBoundingBox, BitmapLayerPickingInfo} from '@deck.gl/layers';
import type {Texture} from '@luma.gl/core';
import {DEFAULT_LINE_WIDTH, DEFAULT_LINE_COLOR, ensureDefaultProps} from '../../_utils/props';
import {ImageInterpolation} from '../../_utils/image-interpolation';
import {ImageType} from '../../_utils/image-type';
import type {ImageUnscale} from '../../_utils/image-unscale';
import {isViewportGlobe, isViewportInZoomBounds} from '../../_utils/viewport';
import type {RasterPointProperties} from '../../_utils/raster-data';
import type {Palette} from '../../_utils/palette';
import {createEmptyTextureCached} from '../../_utils/texture';
import type {TextureData} from '../../_utils/texture-data';
import {getPixelMagnitudeValue, type Legend} from '../../_utils/pixel-value';
import {bitmapModule} from '@/src/shaders/bitmap-module/bitmap-module';
import type {BitmapModuleProps} from '@/src/shaders/bitmap-module/bitmap-module';
import {rasterModule} from '@/src/shaders/raster-module/raster-module';
import type {RasterModuleProps} from '@/src/shaders/raster-module/raster-module';
import {paletteModule} from '@/src/shaders/palette-module/palette-module';
import type {PaletteModuleProps} from '@/src/shaders/palette-module/palette-module';
import {RASTER_BITMAP_LAYER_FS as fs} from './fragment';

type _ImageBitmapLayerProps = BitmapLayerProps & {
  imageTexture: Texture | null;
  imageTexture2: Texture | null;
  imageSmoothing: number;
  imageInterpolation: ImageInterpolation;
  imageWeight: number;
  imageType: ImageType;
  imageUnscale: ImageUnscale;
  imageMinValue: number | null;
  imageMaxValue: number | null;
  bounds: BitmapBoundingBox;
  minZoom: number | null;
  maxZoom: number | null;

  palette: Palette | null;
  legend?: Legend;
  isAlphaImage: boolean;
  paletteData: TextureData | null;
  paletteTexture: Texture | null;
  paletteBounds: [number, number];
  borderEnabled: boolean | null;
  borderWidth: number | null;
  borderColor: Color | null;
  gridEnabled: boolean | null;
  gridSize: number | null;
  gridColor: Color | null;
  grayscale: boolean;
};

export type ImageBitmapLayerProps = _ImageBitmapLayerProps & LayerProps;

const defaultProps: DefaultProps<ImageBitmapLayerProps> = {
  imageTexture: {type: 'object', value: null},
  imageTexture2: {type: 'object', value: null},
  imageSmoothing: {type: 'number', value: 0},
  imageInterpolation: {type: 'object', value: ImageInterpolation.CUBIC},
  imageWeight: {type: 'number', value: 0},
  imageType: {type: 'object', value: ImageType.SCALAR},
  imageUnscale: {type: 'array', value: null},
  imageMinValue: {type: 'object', value: null},
  imageMaxValue: {type: 'object', value: null},
  bounds: {type: 'array', value: [-180, -90, 180, 90], compare: true},
  minZoom: {type: 'object', value: null},
  maxZoom: {type: 'object', value: null},

  palette: {type: 'object', value: null},
  legend: {type: 'object', value: undefined as unknown as Legend},
  paletteData: {type: 'object', value: null},
  paletteTexture: {type: 'object', value: null},
  paletteBounds: {type: 'array', value: [0, 0]},
  borderEnabled: {type: 'boolean', value: false},
  borderWidth: {type: 'number', value: DEFAULT_LINE_WIDTH},
  borderColor: {type: 'color', value: DEFAULT_LINE_COLOR},
  gridEnabled: {type: 'boolean', value: false},
  gridSize: {type: 'number', value: DEFAULT_LINE_WIDTH},
  gridColor: {type: 'color', value: DEFAULT_LINE_COLOR},
  grayscale: {type: 'boolean', value: true},
};

export class ImageBitmapLayer<ExtraPropsT extends {} = {}> extends BitmapLayer<ExtraPropsT & Required<_ImageBitmapLayerProps>> {
  static layerName = 'RasterBitmapLayer';
  static defaultProps = defaultProps;

  declare state: BitmapLayer['state'] & {
    paletteTexture?: Texture;
    paletteImage?: Texture;
    paletteBounds?: [number, number];
  };

  getShaders(): any {
    const parentShaders = super.getShaders();

    return {
      ...parentShaders,
      fs,
      modules: [
        ...parentShaders.modules, 
        bitmapModule, 
        rasterModule, 
        paletteModule
      ],
    };
  }

  updateState(params: UpdateParameters<this>): void {
    const {palette} = params.props;

    super.updateState(params);

    // if (palette !== params.oldProps.palette) {
    //   this._updatePalette();
    // }
  }

  draw(opts: any): void {
    const {device, viewport} = this.context;
    const {model} = this.state;
    const {imageTexture, imageTexture2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, bounds, _imageCoordinateSystem, transparentColor, minZoom, maxZoom, borderEnabled, borderWidth, borderColor, gridEnabled, gridSize, gridColor, paletteTexture, paletteBounds} = ensureDefaultProps(this.props, defaultProps);
    // const {paletteTexture, paletteBounds} = this.state;

    if (!imageTexture) {
      return;
    }

    // viewport
    const viewportGlobe = isViewportGlobe(viewport);

    const boundImageTexture = imageTexture ?? createEmptyTextureCached(device);
    const boundImageTexture2 = imageTexture2 ?? createEmptyTextureCached(device);
    const boundPaletteTexture = paletteTexture ?? createEmptyTextureCached(device);

    if (model && isViewportInZoomBounds(viewport, minZoom, maxZoom)) {
      model.shaderInputs.setProps({
        [bitmapModule.name]: {
          viewportGlobe, 
          bounds, 
          _imageCoordinateSystem, 
          transparentColor,
        } satisfies BitmapModuleProps,

        [rasterModule.name]: {
          imageTexture: boundImageTexture,
          imageTexture2: boundImageTexture2,
          imageSmoothing, 
          imageInterpolation, 
          imageWeight, 
          imageType, 
          imageUnscale, 
          imageMinValue, 
          imageMaxValue,
          borderEnabled, 
          borderWidth, 
          borderColor,
          gridEnabled, 
          gridSize, 
          gridColor,
        } satisfies RasterModuleProps,

        [paletteModule.name]: {
          paletteTexture: boundPaletteTexture,
          paletteBounds,
          hasPaletteTexture: !!paletteTexture,
        } satisfies PaletteModuleProps,
      });
      
      model.setBindings({
        imageTexture: boundImageTexture,
        imageTexture2: boundImageTexture2,
        paletteTexture: boundPaletteTexture,
      });

      model.setParameters({
        ...model.parameters,
        cullMode: 'back', // enable culling to avoid rendering on both sides of the globe
        depthCompare: 'always', // disable depth test to avoid conflict with Maplibre globe depth buffer, see https://github.com/visgl/deck.gl/issues/9357
        ...this.props.parameters,
      });

      this.props.image = imageTexture;
      super.draw(opts);
      this.props.image = null;
    }
  }

  // private _updatePalette(): void {
  //   const {device} = this.context;
  //   const {palette} = ensureDefaultProps(this.props, defaultProps);
  //   if (!palette) {
  //     this.setState({paletteTexture: undefined, paletteBounds: undefined});
  //     return;
  //   }

  //   const paletteScale = parsePalette(palette);
  //   const {paletteBounds, paletteTexture} = createPaletteTexture(device, paletteScale);

  //   this.setState({paletteTexture, paletteBounds});
  // }

  // Non Logorithmic palette value
  private _getRasterLinearColorValue(color: Uint8Array, paletteBounds: [number, number]): number {
    return paletteBounds[0] + color[0] / 255 * (paletteBounds[1] - paletteBounds[0]);
  }

  private _getRasterMagnitudeValue(color: Uint8Array): number {
    const {imageType, imageUnscale, legend, paletteData, paletteBounds, isAlphaImage, grayscale} = ensureDefaultProps(this.props, defaultProps);

    return getPixelMagnitudeValue(
      Array.from(color),
      imageType,
      imageUnscale,
      legend,
      paletteData ?? undefined,
      paletteBounds,
      isAlphaImage,
      grayscale
    );
  }

  private _getRasterDirectionValue(color: Uint8Array): number {
    const {imageType} = ensureDefaultProps(this.props, defaultProps);
    if (imageType === ImageType.VECTOR) {
      return color[1] / 255 * 360;
    } else {
      return NaN;
    }
  }

  getPickingInfo(params: GetPickingInfoParams): BitmapLayerPickingInfo {
    const info: BitmapLayerPickingInfo & {raster?: RasterPointProperties} = super.getPickingInfo(params);

    const { imageType, isAlphaImage, paletteBounds } = ensureDefaultProps(this.props, defaultProps);

    if (!info.color) {
      return info;
    }

    let rasterPointProperties: RasterPointProperties;
    
    const value = this._getRasterMagnitudeValue(info.color);
    
    if (imageType === ImageType.VECTOR) {
      const direction = this._getRasterDirectionValue(info.color);
      info.raster = {value, direction};
      return info;
    } 

    info.raster = {value};
    return info;
  }
}