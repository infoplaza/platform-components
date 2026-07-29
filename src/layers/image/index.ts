import {CompositeLayer, COORDINATE_SYSTEM} from '@deck.gl/core';

import {createTextureCached, createEmptyTextureCached} from '../../_utils/texture';
import {isRepeatBounds} from '../../_utils/bounds';
import {ImageBitmapLayer} from './bitmap';

// ** Types import **
import type {ImageBitmapLayerProps} from './bitmap';
import type {Texture} from '@luma.gl/core';
import type {TextureData} from '../../_utils/texture-data';
import type {RasterPointProperties} from '../../_utils/raster-data';
import type {LayerProps, DefaultProps, UpdateParameters, LayersList, GetPickingInfoParams, PickingInfo} from '@deck.gl/core';

type ImageSourceData = TextureData | ImageData;

type _ImageLayerProps = Omit<ImageBitmapLayerProps, 'image' | 'paletteImage'> & {
  image: ImageSourceData | null;
  image2: ImageSourceData | null;
  paletteImage: ImageSourceData | null;
};

export type ImageLayerProps = _ImageLayerProps & LayerProps;

const defaultProps: DefaultProps<ImageLayerProps> = {
  ...ImageBitmapLayer.defaultProps,

  imageTexture: undefined,
  imageTexture2: undefined,
  image: {type: 'object', value: null}, // object instead of image to allow reading raw data
  image2: {type: 'object', value: null}, // object instead of image to allow reading raw data
  paletteImage: {type: 'object', value: null}, // object instead of image to allow reading raw data
  // beforeId: {type: 'string', value: ''},
  bounds: {type: 'array', value: [-180, -90, 180, 90], compare: true},
};

export class ImageLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<ExtraPropsT & Required<_ImageLayerProps>> {
  static layerName = 'RasterLayer';
  static defaultProps = defaultProps;

  declare state: CompositeLayer['state'] & {
    props?: ImageLayerProps;
    imageTexture?: Texture;
    imageTexture2?: Texture;
    paletteTexture?: Texture;
    positions?: GeoJSON.Position[];
  };

  renderLayers(): LayersList {
    const {device} = this.context;
    const {props, imageTexture, imageTexture2, paletteTexture} = this.state;
    if (!props || !imageTexture) {
      return [];
    }

    const {image: _image, image2: _image2, paletteImage: _paletteImage, ...forwardProps} = this.props;

    return [
      new ImageBitmapLayer(this.props, this.getSubLayerProps({
        ...{
          id: 'bitmap',
          imageTexture,
          imageTexture2,
          paletteTexture,
          _imageCoordinateSystem: COORDINATE_SYSTEM.DEFAULT,
        } satisfies Partial<ImageLayerProps>,

        image: createEmptyTextureCached(device),
        image2: createEmptyTextureCached(device),
        paletteImage: createEmptyTextureCached(device),
      })),
    ];
  }

  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    const rasterInfo = info as PickingInfo & {raster?: RasterPointProperties};
    const {paletteImage, paletteBounds, isAlphaImage} = this.props;

    // if (isAlphaImage) {
    //   return info;
    // }

    if (!rasterInfo.raster || isNaN(rasterInfo.raster.value)) {
      return info;
    }


    // Works only for grayscale images
    // if (paletteImage && paletteBounds && paletteBounds[1] > paletteBounds[0]) {
    //   const normalized = (rasterInfo.raster.value - paletteBounds[0]) / (paletteBounds[1] - paletteBounds[0]);
    //   const clamped = Math.max(0, Math.min(1, normalized));
    //   const {width, height, data} = paletteImage;
    //   const bytesPerPixel = data.length / (width * (height || 1));

    //   if (bytesPerPixel >= 3) {
    //     const idx = Math.min(Math.round(clamped * Math.max(width - 1, 0)), width - 1);
    //     const off = idx * bytesPerPixel;
    //     rasterInfo.raster.visualColor = [
    //       data[off],
    //       data[off + 1],
    //       data[off + 2],
    //       bytesPerPixel >= 4 ? data[off + 3] : 255,
    //     ];
    //   }
    // }

    const visualColor = [rasterInfo.color?.[1], rasterInfo.color?.[2], rasterInfo.color?.[3], 1];
    rasterInfo.raster.visualColor = visualColor as unknown as [number, number, number, number];

    return info;
  }

  updateState(params: UpdateParameters<this>): void {
    const {image, image2, imageUnscale, bounds} = params.props;

    super.updateState(params);

    if (image && imageUnscale && !(image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray)) {
      throw new Error('imageUnscale can be applied to Uint8 data only');
    }

    if (image !== params.oldProps.image || image2 !== params.oldProps.image2 || params.props.paletteImage !== params.oldProps.paletteImage) {
      const {device} = this.context;
      const {image, image2, paletteImage} = this.props;
  
      const imageTexture = image ? createTextureCached(device, image, isRepeatBounds(bounds as GeoJSON.BBox)) : null;
      const imageTexture2 = image2 ? createTextureCached(device, image2, isRepeatBounds(bounds as GeoJSON.BBox)) : null;
      const paletteTexture = paletteImage ? createTextureCached(device, paletteImage, isRepeatBounds(bounds as GeoJSON.BBox)) : null;
  
      this.setState({imageTexture, imageTexture2, paletteTexture});
    }

    this.setState({props: params.props});
  }
}