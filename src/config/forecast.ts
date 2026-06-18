import { imageRendering } from '@/src/config/constants'
import type { LayerConfig } from '@/@types/layer.types';

/* Forecast */
/**
 * @constant {ForecastConfig} FORECAST - Configuration object for forecast data.
 * @property {Endpoints} endpoint - API endpoints for different environments.
 * @property {Endpoint} endpoint.prod - Production environment endpoints.
 * @property {string} endpoint.prod.server - Production server URL.
 * @property {string} endpoint.prod.layers - Path for layers endpoint.
 * @property {string} endpoint.prod.models - Path for models endpoint.
 * @property {Endpoint} endpoint.acc - Acceptance environment endpoints.
 * @property {string} endpoint.acc.server - Acceptance server URL.
 * @property {string} endpoint.acc.layers - Path for layers endpoint.
 * @property {string} endpoint.acc.models - Path for models endpoint.
 * @property {LayerGroup[]} layers - Array of layer groups.
 */
const FORECAST: LayerConfig = {
    endpoint: {
        prod: {
            server: 'https://api.imweather.com',
            layers: '/v0/gridmapdata/layers', 
            models: '/v0/gridmapdata/models',
            palettes: '/v0/gridmapdata/palette/{modelname}/{runtime}/{element}' //https://api-test.imweather.com/docs/redoc#tag/Grid-map-data-or-Layer-endpoints/operation/get_image_layer
        },
        test: {
            server: 'https://api-test.imweather.com',
            layers: '/v0/gridmapdata/layers',
            models: '/v0/gridmapdata/models',
            palettes: '/v0/gridmapdata/palette/{modelname}/{runtime}/{element}'
        }
    },
    layers: [

        /**
         * @property {string} i18n - Internationalization key for the group.
         * @property {Item[]} items - Array of items in the temperature group.
         */
        {

            /* Temperatuur */
            i18n: 'group.temperature',
            items: [

                /**
                 * @property {string} slug - Unique identifier for the item.
                 * @property {string} i18n - Internationalization key for the item.
                 * @property {string} icon - Icon class for the item.
                 * @property {Layer[]} layers - Array of layers for the item.
                 * @property {string[]} levels - Array of levels for the item.
                 */
                {
                    slug: 'temperature',
                    i18n: 'element.temperature',
                    icon: 'UilTemperatureHalf',
                    layers: [
                        { element: 'temperature', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: 'PARTICLES', unit: 'km/h', i18n: 'element.windanimationsurfacelevel', level: '300hPa' }
                    ],
                    levels: [ '2m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa', 'seasurface' ]
                },
                // {
                //     slug: 'windvector',
                //     i18n: 'element.windvector',
                //     icon: 'UilTemperatureHalf',
                //     layers: [
                //         { element: 'windvector', connection: 'ImageConnection', rendering: [imageRendering, 'PARTICLES'], unit: 'km/h', i18n: 'element.windanimationsurfacelevel', level: '300hPa' }
                //     ],
                //     levels: [ '2m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa', 'seasurface' ]
                // },

                { slug: 'temperaturemin',
                    i18n: 'element.temperaturemin',
                    iconUrl: '/img/elements/imw-min-temperature.svg',
                    timestampFilter: { hours: 6, start: 1 },
                    layers: [
                        { element: 'temperaturemin', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                    ],
                    levels: [ '2m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa' ] },

                { slug: 'temperaturemax',
                    i18n: 'element.temperaturemax',
                    icon: 'UilTemperaturePlus',
                    timestampFilter: { hours: 6, start: 1 },
                    layers: [
                        { element: 'temperaturemax', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                    ],
                    levels: [ '2m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa' ] 
                },
                { slug: 'freezinglevel',
                    i18n: 'element.freezinglevel',
                    icon: 'FreezingLevelIcon',
                    layers: [
                        { element: 'freezinglevel', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { density: -1 } } },
                    ] 
                },
            ]
        },
        {

            /* Vochtigheid - Humidity*/
            i18n: 'group.moisture',
            items: [
                { slug: 'dewpoint',
                    i18n: 'element.dewpoint',
                    icon: 'DewpointIcon',
                    layers: [
                        { element: 'dewpoint', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                        // { element: 'dewpoint', rendering: 'VALUES', unitKey: 'temperature', optional: true }
                    ],
                    levels: [ '2m' ] },

                { slug: 'relativehumidity',
                    i18n: 'element.relativehumidity',
                    icon: 'RelativeHumidityIcon',
                    layers: [
                        { element: 'relativehumidity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], settings: { value: { textColor: '#000000' } }, grayscale: true },
                        // { element: 'relativehumidity', rendering: 'VALUES', optional: true }
                    ],
                    levels: [ '2m' ] },

                { slug: 'visibility',
                    i18n: 'element.visibility',
                    icon: 'UilEye',
                    layers: [
                        { element: 'visibility', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'visibility', grayscale: true },
                        // { element: 'visibility', rendering: 'VALUES', unitKey: 'visibility', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'cloudcoverlow',
                    i18n: 'element.cloudcoverlow',
                    iconUrl: '/img/elements/imw-low-level-cloud-cov.svg',
                    layers: [
                        { element: 'cloudcoverlow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true },
                        // { element: 'cloudcoverlow', rendering: 'VALUES', optional: true }
                    ] },

                { slug: 'cloudcovermiddle',
                    i18n: 'element.cloudcovermiddle',
                    iconUrl: '/img/elements/imw-medium-level-cloud-cov.svg',
                    layers: [
                        { element: 'cloudcovermiddle', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                        // { element: 'cloudcovermiddle', rendering: 'VALUES', optional: true }
                    ] },

                { slug: 'cloudcoverhigh',
                    i18n: 'element.cloudcoverhigh',
                    iconUrl: '/img/elements/imw-high-level-cloud-cov.svg',
                    layers: [
                        { element: 'cloudcoverhigh', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                        // { element: 'cloudcoverhigh', rendering: 'VALUES', optional: true }
                    ] },

                { slug: 'cloudcovertotal',
                    i18n: 'element.cloudcovertotal',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudcovertotal', i18n: 'element.cloudcovertotal', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true,  isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                        // { element: 'cloudcovertotal', rendering: 'VALUES', optional: true }
                    ] },

                { slug: 'cloudcovershading',
                    i18n: 'element.cloudcovershading',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudcovershading', i18n: 'element.cloudcovershading', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                    ] },

                { slug: 'cloudcovercombi',
                    i18n: 'element.cloudcovercombi',
                    description: 'Combi cloud cover: low > middle > high',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudcoverlow', i18n: 'element.cloudcoverlow', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcovermiddle', i18n: 'element.cloudcovermiddle', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcoverhigh', i18n: 'element.cloudcoverhigh', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                    ] },

                { slug: 'cloudcovercombi_reverse',
                    i18n: 'element.cloudcovercombi_reverse',
                    description: 'Combi cloud cover: high > middle > low',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudcoverhigh', i18n: 'element.cloudcoverhigh', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcovermiddle', i18n: 'element.cloudcovermiddle', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcoverlow', i18n: 'element.cloudcoverlow', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                    ] 
                },
                { 
                    slug: 'cloudbaseheight',
                    i18n: 'element.cloudbaseheight',
                    description: 'Above Ground Level',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudbaseheight', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ] 
                },
                { slug: 'cloudbaseheightconvective',
                    i18n: 'element.cloudbaseheightconvective',
                    description: 'Above Ground Level',
                    iconUrl: '/img/elements/imw-cloud-base-height-convective.svg',
                    layers: [
                        { element: 'cloudbaseheightconvective', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ] 
                },
                { slug: 'cloudbaseheightstratiform',
                    i18n: 'element.cloudbaseheightstratiform',
                    description: 'Above Ground Level',
                    iconUrl: '/img/elements/imw-cloud-base-height-stratiform.svg',
                    layers: [
                        { element: 'cloudbaseheightstratiform', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ] 
                },
                { slug: 'thetaw',
                    i18n: 'element.thetaw',
                    icon: 'UilMountainsSun',
                    description: "Wet bulb potential temperature",
                    layers: [
                        { element: 'thetaw', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: [ '2m', '250hPa', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa' ] 
                },
                { slug: 'thetae',
                    i18n: 'element.thetae',
                    icon: 'UilMountains',
                    description: "Equivalent potential temperature",
                    layers: [
                        { element: 'thetae', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: [ '2m', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa' ] 
                },
                { slug: 'wetbulbtemperature',
                    i18n: 'element.wetbulbtemperature',
                    icon: 'UilThermometer',
                    layers: [
                        { element: 'wetbulbtemperature', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: [ '2m', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa' ] 
                }
            ]
        },
        {

            /* Wind */
            i18n: 'group.wind',
            items: [

                // wind_particles = windspeed
                { slug: 'wind_particles',
                    i18n: 'element.windspeed',
                    icon: 'WindAltIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wind', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: 'PARTICLES', unitKey: 'wind', optional: true   },
                    ],
                    levels: [ '10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'] 
                },
                { slug: 'wind_barbs',
                    i18n: 'element.windbarbs',
                    icon: 'WindBarbIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'wind', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'BARBS'], unitKey: 'wind' },
                    ],
                    levels: [ '2m', '10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa', 'seasurface' ]
                },
                { slug: 'windgust',
                    i18n: 'element.windgust',
                    icon: 'WindgustIcon',
                    layers: [
                        { element: 'windgust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'windgust', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'BARBS'], unitKey: 'wind' },
                    ],
                    levels: [ '10m', '100m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa' ] 
                },
                { slug: 'wind_direction',
                    i18n: 'element.winddirection',
                    icon: 'WinddirectionIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'wind', grayscale: true, level: '10m', },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'DIRECTIONS'], unitKey: 'wind', level: '10m', grayscale: false },
                        // { element: 'winddirection', connection: 'ImageConnection', rendering: ['DIRECTIONS'] },
                    ],
                    levels: [ '10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa' ] 
                },
                { slug: 'jetstream',
                    i18n: 'element.jetstream',
                    icon: 'UilArrowGrowth',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wind', palette: 'windspeedjetstream', grayscale: false },
                        // { element: 'winddirection', connection: 'ImageConnection', rendering: 'DIRECTIONS', optional: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'DIRECTIONS'], unitKey: 'wind', grayscale: false },                    
                    ],
                    levels: [ '300hPa', '250hPa' ] 
                },
                { slug: 'probability_storm',
                    i18n: 'element.probability_storm',
                    badge: '%',
                    icon: 'UilWind',
                    layers: [
                        { element: 'probability_storm', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ] 
                },
            ]
        },
        {

            /* Neerslag */
            i18n: 'group.precipitation',
            items: [
                { slug: 'reflectivity',
                    i18n: 'element.reflectivity',
                    icon: 'UilCloudSunHail',
                    layers: [
                        { element: 'reflectivity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ] },

                { slug: 'precipitation',
                    i18n: 'element.precipitation',
                    iconUrl: '/img/elements/imw-precipitation.svg',
                    layers: [
                        { element: 'precipitation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'precipitation', grayscale: true, settings: { value: { textDecimals: 1, textColor: '#000000' } }},
                    ] 
                },
                { slug: 'precipitationrate',
                    i18n: 'element.precipitationrate',
                    iconUrl: '/img/elements/imw-precipitation.svg',
                    layers: [
                        { element: 'precipitationrate', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'precipitation', grayscale: false, settings: { value: { density: -1 } } },
                    ] 
                },
                { 
                    slug: 'precipitationtype',
                    i18n: 'element.precipitationtype',
                    // iconUrl: '/img/elements/imw-precipitation.svg',
                    icon: 'PrecipitationTypeIcon',
                    layers: [
                        { element: 'precipitationtype', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: false },
                    ], 
                    options: {
                        legend: {
                            type: 'list'
                        }
                    }
                },
                { slug: 'precipitationaccumulation',
                    i18n: 'element.precipitationaccumulation',
                    icon: 'PrecipitationAccumulationIcon',
                    layers: [
                        { element: 'precipitationaccumulation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1, textColor: '#000000' } } },
                    ] 
                },

                // { slug: 'snowrate',
                //     i18n: 'element.snowrate',
                //     icon: 'UilCloudSunMeatball',
                //     layers: [
                //         { element: 'precipitationrate_snow', rendering: imageRendering, unitKey: 'precipitation' },
                //         { element: 'precipitationrate_snow', rendering: 'VALUES', unitKey: 'precipitation', optional: true },
                //     ] },

                { slug: 'snowdepth',
                    i18n: 'element.snowdepth',
                    icon: 'SnowHeightIcon',
                    layers: [
                        { element: 'snowdepth', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'snow', grayscale: true },
                        // { element: 'snowdepth', rendering: 'VALUES', unitKey: 'snow', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'accumulationsnow',
                    i18n: 'element.accumulationsnow',
                    icon: 'SnowAccumulationIcon',
                    layers: [
                        { element: 'precipitationaccumulation_snow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'snow', grayscale: true  },
                        // { element: 'precipitationaccumulation_snow', rendering: 'VALUES', unitKey: 'snow', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_frost',
                    i18n: 'element.probability_frost',
                    badge: '%',
                    icon: 'UilSnowflake',
                    layers: [
                        { element: 'probability_frost', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_frost', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_severefrost',
                    i18n: 'element.probability_severefrost',
                    badge: '%',
                    icon: 'UilSnowflake',
                    layers: [
                        { element: 'probability_severefrost', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_severefrost', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_precipitation',
                    i18n: 'element.probability_precipitation',
                    badge: '%',
                    iconUrl: '/img/elements/imw-precipitation.svg',
                    layers: [
                        { element: 'probability_precipitation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_precipitation', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_snow',
                    i18n: 'element.probability_snow',
                    badge: '%',
                    icon: 'UilSnowflakeAlt',
                    layers: [
                        { element: 'probability_snow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_snow', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_freezingrain',
                    i18n: 'element.probability_freezingrain',
                    badge: '%',
                    icon: 'UilCloudRain',
                    layers: [
                        { element: 'probability_freezingrain', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_freezingrain', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },

                { slug: 'probability_snowcover',
                    i18n: 'element.probability_snowcover',
                    badge: '%',
                    icon: 'UilSnowflakeAlt',
                    layers: [
                        { element: 'probability_snowcover', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_snowcover', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ] },
            ]
        },
        {

            /* Stability */
            i18n: 'group.stability',
            items: [
                {
                    slug: 'cape',
                    i18n: 'element.cape',
                    icon: 'UilThunderstorm',
                    layers: [
                        { element: 'cape', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: [ 'mixedlayer', 'mostunstable', 'surface' ]
                },
                { slug: 'liftedindex',
                    i18n: 'element.liftedindex',
                    icon: 'UilArrowUpRight',
                    layers: [
                        { element: 'liftedindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: [ 'mixedlayer', 'mostunstable', 'surface' ] 
                },
            ]
        },
        {

            /* Wave */
            i18n: 'group.wave',
            items: [
                {   
                    slug: 'seaheight',
                    i18n: 'element.seaheight',
                    iconUrl: '/img/elements/imw-sea-height.svg',
                    layers: [
                        { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [ imageRendering, 'VALUES' ], grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_wind', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'waveheight_wind', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'swell',
                    i18n: 'element.swell',
                    iconUrl: '/img/elements/imw-swell.svg',
                    layers: [
                        { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                        // { element: 'waveheight_swell', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'waveperiod_swell',
                    i18n: 'element.waveperiod_swell',
                    iconUrl: '/img/elements/imw-swell.svg',
                    layers: [
                        { element: 'waveperiod_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },

                        // { element: 'waveperiod_swell', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'significantwaveheight_wind',
                    i18n: 'element.waveheight_significant_wind',
                    iconUrl: '/img/elements/imw-significant-wave-height.svg',
                    layers: [
                        { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                        // { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveheight_significant', rendering: 'VALUES', optional: true }
                    ] 
                },
                // {   
                //     slug: 'significantwaveheight_mean',
                //     i18n: 'element.waveheight_significant_mean',
                //     iconUrl: '/img/elements/imw-significant-wave-height.svg',
                //     layers: [
                //         { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering ], grayscale: true },
                //         { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //         // { element: 'waveheight_significant', rendering: 'VALUES', optional: true }
                //     ] 
                // },
                { 
                    slug: 'waveperiod_mean',
                    i18n: 'element.waveperiod_mean',
                    icon: 'UilWater',
                    layers: [
                        { element: 'waveperiod_mean', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_significant', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },

                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveperiod_mean', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'waveperiod_wind',
                    i18n: 'element.waveperiod_wind',
                    icon: 'UilWater',
                    layers: [
                        { element: 'waveperiod_wind', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_wind', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveperiod_wind', rendering: 'VALUES', optional: true }
                    ] 
                },
                // {
                //     slug: 'waveheight_wind',
                //     i18n: 'element.waveheight_wind',
                //     iconUrl: '/img/elements/imw-sea-height.svg',
                //     layers: [
                //         { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wave', grayscale: true },
                //         { element: 'wavevector_wind', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 10, opacity: 0.2 } } },
                //         // { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //     ]
                // },
                // {
                //     slug: 'wavedirection_wind',
                //     i18n: 'element.wavedirection_wind',
                //     icon: 'WinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveheight_significant',
                    i18n: 'element.waveheight_significant',
                    iconUrl: '/img/elements/imw-significant-wave-height.svg',
                    layers: [
                        { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_significant', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                    ]
                },
                // {
                //     slug: 'wavedirection_mean',
                //     i18n: 'element.wavedirection_mean',
                //     icon: 'WinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                // {
                //     slug: 'waveheight_swell',
                //     i18n: 'element.waveheight_swell',
                //     iconUrl: '/img/elements/imw-swell.svg',
                //     layers: [
                //         { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wave', grayscale: true },
                //         { element: 'wavevector_swell', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 10, opacity: 0.2 } } },
                //         // { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //     ]
                // },
                // {
                //     slug: 'wavedirection_swell',
                //     i18n: 'element.wavedirection_swell',
                //     icon: 'WinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveheight_swell_secondary',
                    i18n: 'element.waveheight_swell_secondary',
                    iconUrl: '/img/elements/imw-swell.svg',
                    layers: [
                        { element: 'waveheight_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_swell_secondary', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.2 }, direction: { directionEnabled: false }  } },
                        // { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                    ]
                },
                // {
                //     slug: 'wavedirection_swell_secondary',
                //     i18n: 'element.wavedirection_swell_secondary',
                //     icon: 'WinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true  },
                //         { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveperiod_peak',
                    i18n: 'element.waveperiod_peak',
                    icon: 'UilWater',
                    layers: [
                        { element: 'waveperiod_peak', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ]
                },
                {
                    slug: 'waveperiod_swell_secondary',
                    i18n: 'element.waveperiod_swell_secondary',
                    iconUrl: '/img/elements/imw-swell.svg',
                    layers: [
                        { element: 'waveperiod_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'wavevector_swell_secondary', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                    ]
                },
                {   
                    slug: 'current_seasurface',
                    i18n: 'element.current',
                    iconUrl: '/img/elements/imw-swell.svg',
                    layers: [
                        { element: 'currentspeed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'windgust', grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'currentdirection', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'currentvector', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false }  } },
                    ],
                    levels: [ 'seasurface' ] 
                },
                { slug: 'seasurfaceheight',
                    i18n: 'element.seasurfaceheight',
                    iconUrl: '/img/elements/imw-sea-height.svg',
                    layers: [
                        { element: 'seasurfaceheight', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ],
                    levels: [] },

                { 
                    slug: 'salinity',
                    i18n: 'element.salinity',
                    icon: 'UilWater',
                    layers: [
                        { element: 'salinity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ],
                    levels: [ 'seasurface' ] 
                },
            ]
        },
        {
            i18n: 'group.airquality',
            items: [
                { 
                    slug: 'airqualityindex',
                    i18n: 'element.airqualityindex',
                    icon: 'UilHeadSideMask',
                    badge: '⁂',
                    layers: [
                        { element: 'airqualityindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], level: 'surface', grayscale: false, settings: { value: { density: -1 } } },
                        // { element: 'airqualityindex', rendering: 'VALUES', level: 'surface', optional: true }
                    ],
                    options: {
                        legend: {
                            type: 'list'
                        }
                    }
                },
                { 
                    slug: 'biomassburning',
                    i18n: 'element.biomassburning',
                    icon: 'UilFire',
                    layers: [
                        { element: 'biomassburning', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'biomassburning', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'carbonmonoxide',
                    i18n: 'element.carbonmonoxide',
                    icon: 'SmokeIcon',
                    badge: 'CO',
                    layers: [
                        { element: 'carbonmonoxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'carbonmonoxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'dust',
                    i18n: 'element.dust',
                    icon: 'DustIcon',
                    layers: [
                        { element: 'dust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'dust', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] },

                { 
                    slug: 'nitrogendioxide',
                    i18n: 'element.nitrogendioxide',
                    icon: 'SmokeIcon',
                    badge: 'NO2',
                    layers: [
                        { element: 'nitrogendioxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'nitrogendioxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'nitrogenmonoxide',
                    i18n: 'element.nitrogenmonoxide',
                    icon: 'SmokeIcon',
                    badge: 'NO',
                    layers: [
                        { element: 'nitrogenmonoxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'nitrogenmonoxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'opticalthickness_aerosol',
                    i18n: 'element.opticalthickness_aerosol',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_aerosol', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_aerosol', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'opticalthickness_biomassburning',
                    i18n: 'element.opticalthickness_biomassburning',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_biomassburning', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_biomassburning', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'opticalthickness_dust',
                    i18n: 'element.opticalthickness_dust',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_dust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_dust', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'opticalthickness_seasalt',
                    i18n: 'element.opticalthickness_seasalt',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_seasalt', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_seasalt', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'ozone',
                    i18n: 'element.ozone',
                    icon: 'EarthLeafIcon',
                    badge: 'O3',
                    layers: [
                        { element: 'ozone', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'ozone', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'pm1',
                    i18n: 'element.pm1',
                    icon: 'DustIcon',
                    layers: [
                        { element: 'pm1', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm1', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'pm2p5',
                    i18n: 'element.pm2p5',
                    icon: 'DustIcon',
                    badge: '<2.5',
                    layers: [
                        { element: 'pm2p5', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm2p5', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'pm10',
                    i18n: 'element.pm10',
                    icon: 'DustIcon',
                    badge: '<10',
                    layers: [
                        { element: 'pm10', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm10', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'sulphurdioxide',
                    i18n: 'element.sulphurdioxide',
                    icon: 'SmokeIcon',
                    badge: 'SO2',
                    layers: [
                        { element: 'sulphurdioxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'μg/m3', grayscale: true },
                        // { element: 'sulphurdioxide', rendering: 'VALUES', unit: 'μg/m3', optional: true }
                    ],
                    levels: [ 'surface' ] 
                },
                { 
                    slug: 'pollen_alder',
                    i18n: 'element.pollen_alder',
                    icon: 'TreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_alder', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_alder', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'pollen_birch',
                    i18n: 'element.pollen_birch',
                    icon: 'TreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_birch', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_birch', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'pollen_grass',
                    i18n: 'element.pollen_grass',
                    icon: 'FlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_grass', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_grass', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'pollen_mugwort',
                    i18n: 'element.pollen_mugwort',
                    icon: 'FlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_mugwort', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_mugwort', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'pollen_olive',
                    i18n: 'element.pollen_olive',
                    icon: 'TreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_olive', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_olive', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'pollen_ragweed',
                    i18n: 'element.pollen_ragweed',
                    icon: 'FlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_ragweed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_ragweed', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'uvindex',
                    i18n: 'element.uvindex',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'uvindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'uvindex', rendering: 'VALUES', optional: true }
                    ] 
                },
                { 
                    slug: 'uvindexclearsky',
                    i18n: 'element.uvindexclearsky',
                    icon: 'UilHeadSideMask',
                    layers: [
                        { element: 'uvindexclearsky', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'uvindexclearsky', rendering: 'VALUES', optional: true }
                    ] 
                }
            ]
        },
        {

            /* Other */
            i18n: 'group.other',
            items: [
                {
                    slug: 'overview',
                    i18n: 'element.overview',
                    description: 'Total cloud cover, Precipitation and Pressure.',
                    icon: 'UilGlobe',
                    layers: [
                        { element: 'cloudcovertotal', i18n: 'element.cloudcovertotal', connection: 'ImageConnection', rendering: [imageRendering], grayscale: true,  isAlphaImage: true },
                        { element: 'precipitation', i18n: 'element.precipitation', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'precipitation', grayscale: false },
                        // { element: 'pressure_meansealevel', i18n: 'element.pressure_meansealevel', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ]
                },
                {
                    slug: 'air_mass',
                    i18n: 'element.air_mass',
                    description: 'Surface pressure, Thetaw 850hPa and Precipitation.',
                    icon: 'UilWind',
                    layers: [
                        { element: 'thetaw', connection: 'ImageConnection', rendering: imageRendering, level: '850hPa', grayscale: true, settings: { image: { imageOpacity: 0.5 } } },
                        { element: 'precipitation', i18n: 'element.precipitation', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'precipitation', grayscale: false, settings: { image: { pickable: false } } },
                        // { element: 'pressure_meansealevel', i18n: 'element.pressure_meansealevel', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                        // { element: 'thetaw', i18n: 'element.thetaw', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], level: '850hPa' },
                        // { element: 'thetaw', connection: 'ImageConnection', rendering: 'CONTOURS', level: '850hPa' },
                    ],
                },
                {
                    slug: 'mid_level',
                    i18n: 'element.mid_level',
                    description: 'Surface pressure lines and Mid level clouds image.',
                    icon: 'UilClouds',
                    layers: [
                        { element: 'cloudcovermiddle', i18n: 'element.cloudcovermiddle', connection: 'ImageConnection', rendering: imageRendering, grayscale: true },
                        // { element: 'pressure_meansealevel', i18n: 'element.pressure_meansealevel', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                        // { element: 'thetaw', i18n: 'element.thetaw', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], level: '850hPa' },
                    ],
                },
                {
                    slug: 'convective_precipitation',
                    i18n: 'element.convective_precipitation',
                    description: 'Precipitation and Lifted index lines.',
                    icon: 'UilCloudShowers',
                    layers: [
                        { element: 'liftedindex', connection: 'ImageConnection', rendering: imageRendering, unit: '°C', level: 'mostunstable', grayscale: true },
                        { element: 'precipitation', i18n: 'element.precipitation', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'precipitation', grayscale: false },
                    ],
                },
                { slug: 'pressure_meansealevel',
                    i18n: 'element.pressure_meansealevel',
                    icon: 'UilTachometerFastAlt',
                    layers: [
                        { element: 'pressure_meansealevel', connection: 'ImageConnection', rendering: [imageRendering], unit: 'hPa', grayscale: true, settings: { image: { imageOpacity: 0.5, pickable: false } } },
                        // { element: 'pressure_meansealevel', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ]
                },
                { slug: 'pressure',
                    i18n: 'element.pressure',
                    icon: 'UilTachometerFastAlt',
                        layers: [
                            // { element: 'pressure', connection: 'ImageConnection', rendering: [imageRendering, 'CONTOURS'], unit: 'hPa', grayscale: true },
                            { element: 'pressure', connection: 'ImageConnection', rendering: [imageRendering], unit: 'hPa', grayscale: true, settings: { image: { imageOpacity: 0.5, pickable: false } } },
                            // { element: 'pressure', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ],
                    levels: [ 'surface']
                },
                {
                    slug: 'geopotential',
                    i18n: 'element.geopotential',
                    description: 'Temperature and geopotential contours.',
                    icon: 'UilPolygon',
                    layers: [
                        { element: 'temperature', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'temperature', grayscale: true },
                        // { element: 'geopotential', connection: 'ImageConnection', rendering: 'CONTOURS', unitKey: 'visibility', unit: 'km', interval: null },
                        // { element: 'geopotential', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unitKey: 'visibility', unit: 'km', },

                    ],
                    levels: [ '300hPa', '250hPa', '500hPa', '700hPa', '850hPa', '925hPa' ]
                },
                { slug: 'probability_fog',
                    i18n: 'element.probability_fog',
                    badge: '%',
                    icon: 'UilWindy',
                    layers: [
                        { element: 'probability_fog', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true  },
                    ]
                },
                { slug: 'others.shortwaveradiation',
                    i18n: 'element.shortwaveradiation',
                    badge: '%',
                    icon: 'UilSun',
                    layers: [
                        { element: 'shortwaveradiation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'W/m²', level: 'surface', grayscale: true },
                    ],
                    levels: [ 'surface' ]
                },
            ]
        }
    ]
}

export default FORECAST
