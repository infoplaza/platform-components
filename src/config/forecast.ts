import { imageRendering } from '@/src/config/constants'
import type { LayerConfig } from '@/@types/layer.types'

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
            palettes: '/v0/gridmapdata/palette/{modelname}/{runtime}/{element}', //https://api-test.imweather.com/docs/redoc#tag/Grid-map-data-or-Layer-endpoints/operation/get_image_layer
        },
        test: {
            server: 'https://api-test.imweather.com',
            layers: '/v0/gridmapdata/layers',
            models: '/v0/gridmapdata/models',
            palettes: '/v0/gridmapdata/palette/{modelname}/{runtime}/{element}',
        },
    },
    layers: [
        /**
         * @property {string} name - Display name for the group.
         * @property {Item[]} items - Array of items in the temperature group.
         */
        {
            /* Temperatuur */
            name: 'Temperature',
            items: [
                /**
                 * @property {string} slug - Unique identifier for the item.
                 * @property {string} name - Display name for the item.
                 * @property {string} icon - Icon class for the item.
                 * @property {Layer[]} layers - Array of layers for the item.
                 * @property {string[]} levels - Array of levels for the item.
                 */
                {
                    slug: 'temperature',
                    name: 'Temperature',
                    icon: 'IpTemperatureHalf',
                    layers: [
                        { element: 'temperature', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: '°C', level: '2m', selectableLevel: true, grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: 'PARTICLES', unit: 'km/h', name: 'Wind animation surface level', level: '300hPa', optional: true },
                    ],
                    levels: ['2m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa', 'seasurface'],
                },
                {
                    slug: 'temperaturemin',
                    name: 'Temperature min',
                    icon: 'IpMinTemperatureIcon',
                    timestampFilter: { hours: 6, start: 1 },
                    layers: [
                        { element: 'temperaturemin', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                    ],
                    levels: ['2m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'],
                },
                {
                    slug: 'temperaturemax',
                    name: 'Temperature max',
                    icon: 'IpTemperaturePlus',
                    timestampFilter: { hours: 6, start: 1 },
                    layers: [
                        { element: 'temperaturemax', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                    ],
                    levels: ['2m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'],
                },
                {
                    slug: 'freezinglevel',
                    name: 'Freezing level',
                    icon: 'IpFreezingLevelIcon',
                    layers: [
                        { element: 'freezinglevel', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { density: -1 } } },
                    ],
                },
            ],
        },
        {
            /* Vochtigheid - Humidity*/
            name: 'Moisture / Clouds',
            items: [
                {
                    slug: 'dewpoint',
                    name: 'Dewpoint',
                    icon: 'IpDewpointIcon',
                    layers: [
                        { element: 'dewpoint', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'temperature', grayscale: true },
                    ],
                    levels: ['2m'],
                },
                {
                    slug: 'relativehumidity',
                    name: 'Relative humidity',
                    icon: 'IpRelativeHumidityIcon',
                    layers: [
                        { element: 'relativehumidity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], settings: { value: { textColor: '#000000' } }, grayscale: true },
                    ],
                    levels: ['2m'],
                },
                {
                    slug: 'visibility',
                    name: 'Visibility',
                    icon: 'IpEye',
                    layers: [
                        { element: 'visibility', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'visibility', grayscale: true },
                    ],
                },
                {
                    slug: 'cloudcoverlow',
                    name: 'Low level cloud cov',
                    icon: 'IpLowLevelCloudCoverIcon',
                    layers: [
                        { element: 'cloudcoverlow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true },
                    ],
                },
                {
                    slug: 'cloudcovermiddle',
                    name: 'Mid level cloud cov',
                    icon: 'IpMediumLevelCloudCoverIcon',
                    layers: [
                        { element: 'cloudcovermiddle', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'cloudcoverhigh',
                    name: 'High level cloud cov',
                    icon: 'IpHighLevelCloudCoverIcon',
                    layers: [
                        { element: 'cloudcoverhigh', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                    ],
                },

                {
                    slug: 'cloudcovertotal',
                    name: 'Total cloud cov',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudcovertotal', name: 'Total cloud cov', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'cloudcovershading',
                    name: 'Cloud cover shading',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudcovershading', name: 'Cloud cover shading', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, isAlphaImage: true, settings: { value: { textColor: '#000000' } } },
                    ],
                },

                {
                    slug: 'cloudcovercombi',
                    name: 'Combi cloud cov',
                    description: 'Combi cloud cover: low > middle > high',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudcoverlow', name: 'Low level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcovermiddle', name: 'Mid level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcoverhigh', name: 'High level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                    ],
                },

                {
                    slug: 'cloudcovercombi_reverse',
                    name: 'Combi cloud cov (reverse)',
                    description: 'Combi cloud cover: high > middle > low',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudcoverhigh', name: 'High level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcovermiddle', name: 'Mid level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                        { element: 'cloudcoverlow', name: 'Low level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true, isAlphaImage: true },
                    ],
                },
                {
                    slug: 'cloudbaseheight',
                    name: 'Cloud base height',
                    description: 'Above Ground Level',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudbaseheight', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'cloudbaseheightconvective',
                    name: 'Cloud base height convective',
                    description: 'Above Ground Level',
                    icon: 'IpCloudBaseHeightConvectiveIcon',
                    layers: [
                        { element: 'cloudbaseheightconvective', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'cloudbaseheightstratiform',
                    name: 'Cloud base height stratiform',
                    description: 'Above Ground Level',
                    icon: 'IpCloudBaseHeightStratiformIcon',
                    layers: [
                        { element: 'cloudbaseheightstratiform', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, unitKey: 'altitude', settings: { value: { textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'thetaw',
                    name: 'Theta-w',
                    icon: 'IpMountainsSun',
                    description: 'Wet bulb potential temperature',
                    layers: [
                        { element: 'thetaw', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: ['2m', '250hPa', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa'],
                },
                {
                    slug: 'thetae',
                    name: 'Theta-e',
                    icon: 'IpMountains',
                    description: 'Equivalent potential temperature',
                    layers: [
                        { element: 'thetae', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: ['2m', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa'],
                },
                {
                    slug: 'wetbulbtemperature',
                    name: 'Wet bulb temperature',
                    icon: 'IpThermometer',
                    layers: [
                        { element: 'wetbulbtemperature', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: ['2m', '300hPa', '500hPa', '700hPa', '850hPa', '925hPa'],
                },
            ],
        },
        {
            /* Wind */
            name: 'Wind',
            items: [
                // wind_particles = windspeed
                {
                    slug: 'wind_particles',
                    name: 'Wind Speed',
                    icon: 'IpWindAltIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wind', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: 'PARTICLES', unitKey: 'wind', optional: true },
                    ],
                    levels: ['10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'],
                },
                {
                    slug: 'wind_barbs',
                    name: 'Wind Barbs',
                    icon: 'IpWindBarbIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'wind', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'BARBS'], unitKey: 'wind' },
                    ],
                    levels: ['2m', '10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa', 'seasurface'],
                },
                {
                    slug: 'windgust',
                    name: 'Wind gusts',
                    icon: 'IpWindgustIcon',
                    layers: [
                        { element: 'windgust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'windgust', grayscale: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'BARBS'], unitKey: 'wind' },
                    ],
                    levels: ['10m', '100m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'],
                },
                {
                    slug: 'wind_direction',
                    name: 'Wind direction',
                    icon: 'IpWinddirectionIcon',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'wind', grayscale: true, level: '10m' },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'DIRECTIONS'], unitKey: 'wind', level: '10m', grayscale: false },
                        // { element: 'winddirection', connection: 'ImageConnection', rendering: ['DIRECTIONS'] },
                    ],
                    levels: ['10m', '50m', '100m', '200m', '300m', '925hPa', '850hPa', '700hPa', '500hPa', '300hPa', '250hPa'],
                },
                {
                    slug: 'jetstream',
                    name: 'Jetstream',
                    icon: 'IpArrowGrowth',
                    layers: [
                        { element: 'windspeed', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wind', palette: 'windspeedjetstream', grayscale: false },
                        // { element: 'winddirection', connection: 'ImageConnection', rendering: 'DIRECTIONS', optional: true },
                        { element: 'windvector', connection: 'ImageConnection', rendering: ['PARTICLES', 'DIRECTIONS'], unitKey: 'wind', grayscale: false },
                    ],
                    levels: ['300hPa', '250hPa'],
                },
                {
                    slug: 'probability_storm',
                    name: 'Probability Storm',
                    badge: '%',
                    icon: 'IpWind',
                    layers: [
                        { element: 'probability_storm', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                },
            ],
        },
        {
            /* Neerslag */
            name: 'Precipitation',
            items: [
                {
                    slug: 'reflectivity',
                    name: 'Radar reflectivity',
                    icon: 'IpCloudSunHail',
                    layers: [
                        { element: 'reflectivity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                },

                {
                    slug: 'precipitation',
                    name: 'Precipitation',
                    icon: 'IpPrecipitationIcon',
                    layers: [
                        { element: 'precipitation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'precipitation', grayscale: true, settings: { value: { textDecimals: 1, textColor: '#000000' } } },
                    ],
                },
                {
                    slug: 'precipitationrate',
                    name: 'Precipitation rate',
                    icon: 'IpPrecipitationIcon',
                    layers: [
                        { element: 'precipitationrate', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'precipitation', grayscale: false, settings: { value: { density: -1 } } },
                    ],
                },
                {
                    slug: 'precipitationtype',
                    name: 'Precipitation type',
                    icon: 'IpPrecipitationTypeIcon',
                    layers: [
                        { element: 'precipitationtype', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: false },
                    ],
                    options: {
                        legend: {
                            type: 'list',
                        },
                    },
                },
                {
                    slug: 'precipitationaccumulation',
                    name: 'Precipitation accumulation',
                    icon: 'IpPrecipitationAccumulationIcon',
                    layers: [
                        { element: 'precipitationaccumulation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1, textColor: '#000000' } } },
                    ],
                },

                // { slug: 'snowrate',
                //     name: 'Snow fall rate',
                //     icon: 'IpCloudSunMeatball',
                //     layers: [
                //         { element: 'precipitationrate_snow', rendering: imageRendering, unitKey: 'precipitation' },
                //         { element: 'precipitationrate_snow', rendering: 'VALUES', unitKey: 'precipitation', optional: true },
                //     ] },

                {
                    slug: 'snowdepth',
                    name: 'Snow depth',
                    icon: 'IpSnowHeightIcon',
                    layers: [
                        { element: 'snowdepth', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'snow', grayscale: true },
                        // { element: 'snowdepth', rendering: 'VALUES', unitKey: 'snow', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'accumulationsnow',
                    name: 'Accumulated snowfall',
                    icon: 'IpSnowAccumulationIcon',
                    layers: [
                        { element: 'precipitationaccumulation_snow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'snow', grayscale: true },
                        // { element: 'precipitationaccumulation_snow', rendering: 'VALUES', unitKey: 'snow', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_frost',
                    name: 'Probability Frost',
                    badge: '%',
                    icon: 'IpSnowflake',
                    layers: [
                        { element: 'probability_frost', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_frost', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_severefrost',
                    name: 'Probability Severe Frost',
                    badge: '%',
                    icon: 'IpSnowflake',
                    layers: [
                        { element: 'probability_severefrost', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_severefrost', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_precipitation',
                    name: 'Probability Precipitation',
                    badge: '%',
                    icon: 'IpPrecipitationIcon',
                    layers: [
                        { element: 'probability_precipitation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_precipitation', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_snow',
                    name: 'Probability Snowfall',
                    badge: '%',
                    icon: 'IpSnowflakeAlt',
                    layers: [
                        { element: 'probability_snow', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_snow', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_freezingrain',
                    name: 'Probability freezing rain',
                    badge: '%',
                    icon: 'IpCloudRain',
                    layers: [
                        { element: 'probability_freezingrain', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_freezingrain', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },

                {
                    slug: 'probability_snowcover',
                    name: 'Probability Snowcover',
                    badge: '%',
                    icon: 'IpSnowflakeAlt',
                    layers: [
                        { element: 'probability_snowcover', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'] },
                        // { element: 'probability_snowcover', rendering: 'VALUES', optional: true, hideConfiguredValue: true }
                    ],
                },
            ],
        },
        {
            /* Stability */
            name: 'Stability',
            items: [
                {
                    slug: 'cape',
                    name: 'CAPE',
                    icon: 'IpThunderstorm',
                    layers: [
                        { element: 'cape', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: ['mixedlayer', 'mostunstable', 'surface'],
                },
                {
                    slug: 'liftedindex',
                    name: 'Lifted index',
                    icon: 'IpArrowUpRight',
                    layers: [
                        { element: 'liftedindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                    levels: ['mixedlayer', 'mostunstable', 'surface'],
                },
            ],
        },
        {
            /* Wave */
            name: 'Maritime',
            items: [
                {
                    slug: 'seaheight',
                    name: 'Wind waves',
                    icon: 'IpSeaHeightIcon',
                    layers: [
                        { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_wind', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'waveheight_wind', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'swell',
                    name: 'Swell',
                    icon: 'IpSwellIcon',
                    layers: [
                        { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'waveheight_swell', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'waveperiod_swell',
                    name: 'Swell period',
                    icon: 'IpSwellIcon',
                    layers: [
                        { element: 'waveperiod_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },

                        // { element: 'waveperiod_swell', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'significantwaveheight_wind',
                    name: 'Significant wind wave height',
                    icon: 'IpSignificantWaveHeightIcon',
                    layers: [
                        { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_swell', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveheight_significant', rendering: 'VALUES', optional: true }
                    ],
                },
                // {
                //     slug: 'significantwaveheight_mean',
                //     name: 'Mean significant wave height',
                //     icon: 'IpSignificantWaveHeightIcon',
                //     layers: [
                //         { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering ], grayscale: true },
                //         { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //         // { element: 'waveheight_significant', rendering: 'VALUES', optional: true }
                //     ]
                // },
                {
                    slug: 'waveperiod_mean',
                    name: 'Mean wave period',
                    icon: 'IpWater',
                    layers: [
                        { element: 'waveperiod_mean', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_significant', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },

                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveperiod_mean', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'waveperiod_wind',
                    name: 'Wind wave period',
                    icon: 'IpWater',
                    layers: [
                        { element: 'waveperiod_wind', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_wind', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        // { element: 'waveperiod_wind', rendering: 'VALUES', optional: true }
                    ],
                },
                // {
                //     slug: 'waveheight_wind',
                //     name: 'Wind waves',
                //     icon: 'IpSeaHeightIcon',
                //     layers: [
                //         { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wave', grayscale: true },
                //         { element: 'wavevector_wind', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 10, opacity: 0.2 } } },
                //         // { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //     ]
                // },
                // {
                //     slug: 'wavedirection_wind',
                //     name: 'Wind waves direction',
                //     icon: 'IpWinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_wind', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_wind', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveheight_significant',
                    name: 'Significant wave height',
                    icon: 'IpSignificantWaveHeightIcon',
                    layers: [
                        { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textDecimals: 1 } } },
                        { element: 'wavevector_significant', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                        // { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                    ],
                },
                // {
                //     slug: 'wavedirection_mean',
                //     name: 'Mean wave direction',
                //     icon: 'IpWinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_significant', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_mean', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                // {
                //     slug: 'waveheight_swell',
                //     name: 'Swell height',
                //     icon: 'IpSwellIcon',
                //     layers: [
                //         { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'wave', grayscale: true },
                //         { element: 'wavevector_swell', connection: 'ImageConnection', rendering: [ 'DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 10, opacity: 0.2 } } },
                //         // { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                //     ]
                // },
                // {
                //     slug: 'wavedirection_swell',
                //     name: 'Swell wave direction',
                //     icon: 'IpWinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_swell', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true },
                //         { element: 'wavedirection_swell', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveheight_swell_secondary',
                    name: 'Secondary swell height',
                    icon: 'IpSwellIcon',
                    layers: [
                        { element: 'waveheight_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textColor: '#000000', textDecimals: 1 } } },
                        { element: 'wavevector_swell_secondary', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.2 }, direction: { directionEnabled: false } } },
                        // { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                    ],
                },
                // {
                //     slug: 'wavedirection_swell_secondary',
                //     name: 'Secondary swell direction',
                //     icon: 'IpWinddirectionIcon',
                //     layers: [
                //         { element: 'waveheight_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true  },
                //         { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' }
                //     ]
                // },
                {
                    slug: 'waveperiod_peak',
                    name: 'Peak wave period',
                    icon: 'IpWater',
                    layers: [
                        { element: 'waveperiod_peak', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ],
                },
                {
                    slug: 'waveperiod_swell_secondary',
                    name: 'Secondary swell period',
                    icon: 'IpSwellIcon',
                    layers: [
                        { element: 'waveperiod_swell_secondary', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'wavedirection_swell_secondary', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'wavevector_swell_secondary', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                    ],
                },
                {
                    slug: 'current_seasurface',
                    name: 'Current',
                    icon: 'IpSwellIcon',
                    layers: [
                        { element: 'currentspeed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'windgust', grayscale: true, settings: { value: { textDecimals: 1 } } },
                        // { element: 'currentdirection', connection: 'ImageConnection', rendering: 'DIRECTIONS' },
                        { element: 'currentvector', connection: 'ImageConnection', rendering: ['DIRECTIONS', 'PARTICLES'], settings: { particle: { speedFactor: 10, maxAge: 50, width: 4, opacity: 0.1 }, direction: { directionEnabled: false } } },
                    ],
                    levels: ['seasurface'],
                },
                {
                    slug: 'seasurfaceheight',
                    name: 'Water level',
                    icon: 'IpSeaHeightIcon',
                    layers: [
                        { element: 'seasurfaceheight', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unitKey: 'wave', grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ],
                    levels: [],
                },

                {
                    slug: 'salinity',
                    name: 'Salinity',
                    icon: 'IpWater',
                    layers: [
                        { element: 'salinity', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true, settings: { value: { textDecimals: 1 } } },
                    ],
                    levels: ['seasurface'],
                },
            ],
        },
        {
            name: 'Air quality',
            items: [
                {
                    slug: 'airqualityindex',
                    name: 'Air quality index',
                    icon: 'IpHeadSideMask',
                    badge: '⁂',
                    layers: [
                        { element: 'airqualityindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], level: 'surface', grayscale: false, settings: { value: { density: -1 } } },
                        // { element: 'airqualityindex', rendering: 'VALUES', level: 'surface', optional: true }
                    ],
                    options: {
                        legend: {
                            type: 'list',
                        },
                    },
                },
                {
                    slug: 'biomassburning',
                    name: 'Wildfire aerosol',
                    icon: 'IpFire',
                    layers: [
                        { element: 'biomassburning', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'biomassburning', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'carbonmonoxide',
                    name: 'Carbon monoxide (CO)',
                    icon: 'IpSmokeIcon',
                    badge: 'CO',
                    layers: [
                        { element: 'carbonmonoxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'carbonmonoxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'dust',
                    name: 'Desert dust aerosol',
                    icon: 'IpDustIcon',
                    layers: [
                        { element: 'dust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'dust', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },

                {
                    slug: 'nitrogendioxide',
                    name: 'Nitrogen dioxide (NO2)',
                    icon: 'IpSmokeIcon',
                    badge: 'NO2',
                    layers: [
                        { element: 'nitrogendioxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'nitrogendioxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'nitrogenmonoxide',
                    name: 'Nitrogen monoxide (NO)',
                    icon: 'IpSmokeIcon',
                    badge: 'NO',
                    layers: [
                        { element: 'nitrogenmonoxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'nitrogenmonoxide', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'opticalthickness_aerosol',
                    name: 'Aerosol optical thickness',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_aerosol', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_aerosol', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'opticalthickness_biomassburning',
                    name: 'Wildfire aerosol',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_biomassburning', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_biomassburning', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'opticalthickness_dust',
                    name: 'Desert dust aerosol',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_dust', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_dust', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'opticalthickness_seasalt',
                    name: 'Sea salt aerosol',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'opticalthickness_seasalt', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'opticalthickness_seasalt', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'ozone',
                    name: 'Ozone (O3)',
                    icon: 'IpEarthLeafIcon',
                    badge: 'O3',
                    layers: [
                        { element: 'ozone', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'ozone', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'pm1',
                    name: 'Particulate matter <1 µm (PM1)',
                    icon: 'IpDustIcon',
                    layers: [
                        { element: 'pm1', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm1', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'pm2p5',
                    name: 'Particulate matter <2.5 µm (PM2.5)',
                    icon: 'IpDustIcon',
                    badge: '<2.5',
                    layers: [
                        { element: 'pm2p5', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm2p5', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'pm10',
                    name: 'Particulate matter <10 µm (PM10)',
                    icon: 'IpDustIcon',
                    badge: '<10',
                    layers: [
                        { element: 'pm10', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'µg/m³', grayscale: true },
                        // { element: 'pm10', rendering: 'VALUES', unit: 'µg/m³', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'sulphurdioxide',
                    name: 'Sulphur dioxide (SO2)',
                    icon: 'IpSmokeIcon',
                    badge: 'SO2',
                    layers: [
                        { element: 'sulphurdioxide', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'μg/m3', grayscale: true },
                        // { element: 'sulphurdioxide', rendering: 'VALUES', unit: 'μg/m3', optional: true }
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'pollen_alder',
                    name: 'Alder pollen',
                    icon: 'IpTreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_alder', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_alder', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'pollen_birch',
                    name: 'Birch pollen',
                    icon: 'IpTreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_birch', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_birch', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'pollen_grass',
                    name: 'Grass pollen',
                    icon: 'IpFlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_grass', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_grass', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'pollen_mugwort',
                    name: 'Mugwort pollen',
                    icon: 'IpFlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_mugwort', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_mugwort', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'pollen_olive',
                    name: 'Olive pollen',
                    icon: 'IpTreePollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_olive', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_olive', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'pollen_ragweed',
                    name: 'Ragweed pollen',
                    icon: 'IpFlowerPollenIcon',
                    badge: '⁂',
                    layers: [
                        { element: 'pollen_ragweed', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'pollen_ragweed', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'uvindex',
                    name: 'UV index',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'uvindex', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'uvindex', rendering: 'VALUES', optional: true }
                    ],
                },
                {
                    slug: 'uvindexclearsky',
                    name: 'Clear sky UV index',
                    icon: 'IpHeadSideMask',
                    layers: [
                        { element: 'uvindexclearsky', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                        // { element: 'uvindexclearsky', rendering: 'VALUES', optional: true }
                    ],
                },
            ],
        },
        {
            /* Other */
            name: 'Other',
            items: [
                {
                    slug: 'overview',
                    name: 'Overview',
                    description: 'Total cloud cover, Precipitation and Pressure.',
                    icon: 'IpGlobe',
                    layers: [
                        { element: 'cloudcovertotal', name: 'Total cloud cov', connection: 'ImageConnection', rendering: [imageRendering], grayscale: true, isAlphaImage: true },
                        { element: 'precipitation', name: 'Precipitation', connection: 'ImageConnection', rendering: [imageRendering], unitKey: 'precipitation', grayscale: false },
                        // { element: 'pressure_meansealevel', name: 'Mean sea level pressure', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ],
                },
                {
                    slug: 'air_mass',
                    name: 'Air mass',
                    description: 'Surface pressure, Thetaw 850hPa and Precipitation.',
                    icon: 'IpWind',
                    layers: [
                        { element: 'thetaw', connection: 'ImageConnection', rendering: imageRendering, level: '850hPa', grayscale: true, settings: { image: { imageOpacity: 0.5 } } },
                        { element: 'precipitation', name: 'Precipitation', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'precipitation', grayscale: false, settings: { image: { pickable: false } } },
                        // { element: 'pressure_meansealevel', name: 'Mean sea level pressure', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                        // { element: 'thetaw', name: 'Theta-w', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], level: '850hPa' },
                        // { element: 'thetaw', connection: 'ImageConnection', rendering: 'CONTOURS', level: '850hPa' },
                    ],
                },
                {
                    slug: 'mid_level',
                    name: 'Mid level',
                    description: 'Surface pressure lines and Mid level clouds image.',
                    icon: 'IpClouds',
                    layers: [
                        { element: 'cloudcovermiddle', name: 'Mid level cloud cov', connection: 'ImageConnection', rendering: imageRendering, grayscale: true },
                        // { element: 'pressure_meansealevel', name: 'Mean sea level pressure', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                        // { element: 'thetaw', name: 'Theta-w', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], level: '850hPa' },
                    ],
                },
                {
                    slug: 'convective_precipitation',
                    name: 'Convective precipitation',
                    description: 'Precipitation and Lifted index lines.',
                    icon: 'IpCloudShowers',
                    layers: [
                        { element: 'liftedindex', connection: 'ImageConnection', rendering: imageRendering, unit: '°C', level: 'mostunstable', grayscale: true },
                        { element: 'precipitation', name: 'Precipitation', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'precipitation', grayscale: false },
                    ],
                },
                {
                    slug: 'pressure_meansealevel',
                    name: 'Mean sea level pressure',
                    icon: 'IpTachometerFastAlt',
                    layers: [
                        { element: 'pressure_meansealevel', connection: 'ImageConnection', rendering: [imageRendering], unit: 'hPa', grayscale: true, settings: { image: { imageOpacity: 0.5, pickable: false } } },
                        // { element: 'pressure_meansealevel', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ],
                },
                {
                    slug: 'pressure',
                    name: 'Pressure',
                    icon: 'IpTachometerFastAlt',
                    layers: [
                        // { element: 'pressure', connection: 'ImageConnection', rendering: [imageRendering, 'CONTOURS'], unit: 'hPa', grayscale: true },
                        { element: 'pressure', connection: 'ImageConnection', rendering: [imageRendering], unit: 'hPa', grayscale: true, settings: { image: { imageOpacity: 0.5, pickable: false } } },
                        // { element: 'pressure', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unit: 'hPa' },
                    ],
                    levels: ['surface'],
                },
                {
                    slug: 'geopotential',
                    name: 'Geopotential',
                    description: 'Temperature and geopotential contours.',
                    icon: 'IpPolygon',
                    layers: [
                        { element: 'temperature', connection: 'ImageConnection', rendering: imageRendering, unitKey: 'temperature', grayscale: true },
                        // { element: 'geopotential', connection: 'ImageConnection', rendering: 'CONTOURS', unitKey: 'visibility', unit: 'km', interval: null },
                        // { element: 'geopotential', connection: 'ContourConnection', rendering: ['CONTOURGEOJSON'], unitKey: 'visibility', unit: 'km', },
                    ],
                    levels: ['300hPa', '250hPa', '500hPa', '700hPa', '850hPa', '925hPa'],
                },
                {
                    slug: 'probability_fog',
                    name: 'Probability Fog',
                    badge: '%',
                    icon: 'IpWindy',
                    layers: [
                        { element: 'probability_fog', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], grayscale: true },
                    ],
                },
                {
                    slug: 'others.shortwaveradiation',
                    name: 'Shortwave radiation',
                    badge: '%',
                    icon: 'IpSun',
                    layers: [
                        { element: 'shortwaveradiation', connection: 'ImageConnection', rendering: [imageRendering, 'VALUES'], unit: 'W/m²', level: 'surface', grayscale: true },
                    ],
                    levels: ['surface'],
                },
            ],
        },
    ],
}

export default FORECAST
