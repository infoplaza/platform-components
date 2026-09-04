import type { ComponentType } from 'react'
import {
  IpCloudSunHail,
  IpComparison,
  IpShip,
  IpSun,
  IpTear,
  IpTemperatureHalf,
  IpWind,
} from '@/src/components/icons'
import {
  PrecipitationProbabilityMembers,
  PrecipitationTypeMembers,
  TotalCloudCoverageGrade,
  WindDirectionChanceGrade,
} from './grades'
import type {
  EnsembleBarSeries,
  EnsembleElementGroup,
  EnsembleElementItem,
  EnsemblePlumeSeriesOption,
  EnsembleScenarioViewConfig,
  EnsembleView,
} from './types'
import { precipitationProbabilityAccumulationAdapter } from './utils/adapters/precipitation-probability-accumulation'
import { precipitationTypeAdapter } from './utils/adapters/precipitation-type'
import { totalCloudCoverageAdapter } from './utils/adapters/total-cloud-coverage'
import { windDirectionChanceAdapter } from './utils/adapters/wind-direction-chance'

type GroupIcon = NonNullable<EnsembleElementGroup['icon']>

function groupIcon(Icon: ComponentType<{ className: string }>): GroupIcon {
  return Icon as GroupIcon
}

/** Catalog slug for ECMWF ensemble global — used when no model is selected. */
export const DEFAULT_ENSEMBLE_MODEL = 'ecmwfensembleglobal'

const UNIT_BY_KEY: Record<string, string> = {
  precipitation: 'mm',
  snow: 'cm',
  temperature: '°C',
  wave: 'm',
  wind: 'm/s',
  windgust: 'm/s',
}

function item(partial: EnsembleElementItem): EnsembleElementItem {
  return {
    ...partial,
    unit:
      partial.unit ??
      (partial.unitKey ? UNIT_BY_KEY[partial.unitKey] : undefined),
  }
}

function scenario(
  available: EnsembleView[],
  views: {
    basic?: EnsembleScenarioViewConfig
    expert?: EnsembleScenarioViewConfig
  } = {},
): EnsembleElementItem['scenario'] {
  return {
    available,
    ...(available.includes('basic')
      ? { basic: views.basic ?? { chart: 'plume' } }
      : {}),
    ...(available.includes('expert')
      ? { expert: views.expert ?? { chart: 'line' } }
      : {}),
  }
}

function probabilityBars(
  members: Array<{ slug: string; label?: string; title?: string; color: string }>,
  stackId: string,
): EnsembleBarSeries[] {
  return members.map((member) => ({
    dataKey: member.slug,
    stackId,
    name: member.label ?? member.title ?? member.slug,
    fill: member.color,
    unit: '%',
  }))
}

function precipPlumeOptions(): NonNullable<
  EnsembleScenarioViewConfig['options']
> {
  return {
    y: [
      {
        type: 'area',
        dataKeys: ['min', 'max'],
        name: '100% Confidence',
        color: '#80CEF5',
        textColor: '#80CEF5',
      },
      {
        type: 'area',
        dataKeys: ['percentile10', 'percentile90'],
        name: '80% Confidence',
        color: '#1197DA',
        textColor: '#1197DA',
      },
      {
        type: 'area',
        dataKeys: ['percentile25', 'percentile75'],
        name: '50% Confidence',
        color: '#0A5880',
        textColor: '#0A5880',
      },
      {
        type: 'line',
        dataKey: 'median',
        name: 'Median',
        color: '#063349',
        width: 1.5,
      },
    ],
    legend: {
      payload: [
        {
          value: '100% Confidence',
          type: 'area',
          id: 'min_max',
          color: '#80CEF5',
        },
        {
          value: '80% Confidence',
          type: 'area',
          id: 'percentile10_percentile90',
          color: '#1197DA',
        },
        {
          value: '50% Confidence',
          type: 'area',
          id: 'percentile25_percentile75',
          color: '#0A5880',
        },
        { value: 'Median', type: 'line', id: 'median', color: '#063349' },
      ],
    },
  }
}

function marineExpertLine(): EnsembleScenarioViewConfig {
  const extra: EnsemblePlumeSeriesOption[] = [
    {
      type: 'line',
      dataKey: 'percentile10',
      name: 'Percentile 10',
      color: '#636363',
      width: 2,
    },
    {
      type: 'line',
      dataKey: 'percentile90',
      name: 'Percentile 90',
      color: '#636363',
      width: 2,
    },
    {
      type: 'line',
      dataKey: 'percentile50',
      name: 'Percentile 50',
      color: '#636363',
      width: 2,
    },
  ]
  return {
    chart: 'line',
    members: ['all', 'median', 'control', 'percentile10', 'percentile90'],
    options: {
      y: extra,
      legend: {
        payload: extra.map((series) => ({
          value: series.name,
          type: 'line',
          id: series.dataKey ?? series.name,
          color: series.color,
        })),
      },
    },
  }
}

function marineItem(
  slug: string,
  title: string,
  element: string,
  extra?: Partial<EnsembleElementItem>,
): EnsembleElementItem {
  return item({
    slug,
    title,
    element,
    scenario: scenario(['basic', 'expert'], {
      expert: marineExpertLine(),
    }),
    ...extra,
  })
}

/**
 * Default element groups, carried over from ImWeather `ENSEMBLE_TIMESERIES.groups`.
 * Endpoints and commented-out winter are omitted. Titles are resolved English strings.
 */
export const ENSEMBLE_TIMESERIES = {
  groups: [
    {
      key: 'overview',
      title: 'Overview',
      icon: groupIcon(IpComparison),
      items: [
        item({
          slug: 'overview_temperature',
          title: 'Temperature',
          element: 'temperature',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'overview_dewpoint',
          title: 'Dewpoint',
          element: 'dewpoint',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['expert']),
        }),
        item({
          slug: 'overview_precipitation',
          title: 'Precipitation',
          element: 'precipitation',
          unitKey: 'precipitation',
          decimals: 1,
          scenario: scenario(['basic'], {
            basic: { chart: 'plume', options: precipPlumeOptions() },
          }),
        }),
        item({
          slug: 'overview_precipitationprobability',
          title: 'Precipitation probability',
          element: 'precipitationaccumulation',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'overview_precipitationprobability_stacked',
                ),
              },
            },
            expert: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'overview_precipitationprobability_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'overview_precipitationaccumulation',
          title: 'Precipitation accumulation',
          element: 'precipitationaccumulation',
          decimals: 1,
          scenario: scenario(['expert']),
        }),
        item({
          slug: 'overview_cloudcovertotal',
          title: 'Cloud cover',
          element: 'cloudcovertotal',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: totalCloudCoverageAdapter,
              bar: {
                reverse: true,
                y: probabilityBars(
                  [...TotalCloudCoverageGrade].reverse(),
                  'overview_totalcloudcoverage_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'overview_windspeed',
          title: 'Wind',
          element: 'windspeed',
          level: '10m',
          unitKey: 'wind',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'overview_windgust',
          title: 'Wind gust',
          element: 'windgust',
          level: '10m',
          unitKey: 'windgust',
          decimals: 0,
          scenario: scenario(['expert']),
        }),
        item({
          slug: 'overview_winddirectionchance',
          title: 'Wind direction chance',
          element: 'winddirection',
          level: '10m',
          unit: '°',
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: windDirectionChanceAdapter,
              bar: {
                y: probabilityBars(
                  WindDirectionChanceGrade.map((grade) => ({
                    slug: grade.slug,
                    label: grade.point,
                    color: grade.color,
                  })),
                  'overview_winddirection_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'overview_meansealevel',
          title: 'Mean sea-level pressure',
          element: 'pressure_meansealevel',
          unit: 'hPa',
          decimals: 0,
          scenario: scenario(['expert'], {
            expert: {
              chart: 'line',
              type: 'linear',
              line: { yAxis: { domain: ['auto', 'auto'] } },
            },
          }),
        }),
      ],
    },
    {
      key: 'temperature',
      title: 'Temperature',
      icon: groupIcon(IpTemperatureHalf),
      items: [
        item({
          slug: 'temperature_temperature_2m',
          title: 'Temperature',
          element: 'temperature',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'temperature_temperaturemax_2m',
          title: 'Maximum temperature',
          element: 'temperaturemax',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'temperature_temperaturemin_2m',
          title: 'Minimum temperature',
          element: 'temperaturemin',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'temperature_dewpoint',
          title: 'Dewpoint',
          element: 'dewpoint',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
      ],
    },
    {
      key: 'moisture',
      title: 'Moisture',
      icon: groupIcon(IpTear),
      items: [
        item({
          slug: 'moisture_relativehumidity',
          title: 'Relative humidity',
          element: 'relativehumidity',
          level: '2m',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'moisture_cloudcovershading',
          title: 'Shading clouds',
          element: 'cloudcovershading',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: totalCloudCoverageAdapter,
              bar: {
                y: probabilityBars(
                  TotalCloudCoverageGrade,
                  'overview_totalcloudcoverage_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'moisture_cloudcovertotal',
          title: 'Total cloud cover',
          element: 'cloudcovertotal',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: totalCloudCoverageAdapter,
              bar: {
                y: probabilityBars(
                  TotalCloudCoverageGrade,
                  'overview_totalcloudcoverage_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'moisture_cloudcoverlow',
          title: 'Low cloud cover',
          element: 'cloudcoverlow',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
      ],
    },
    {
      key: 'wind',
      title: 'Wind',
      icon: groupIcon(IpWind),
      items: [
        item({
          slug: 'wind_windspeed',
          title: 'Wind',
          element: 'windspeed',
          level: '10m',
          unitKey: 'wind',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'wind_windgust',
          title: 'Wind gust',
          element: 'windgust',
          level: '10m',
          unitKey: 'windgust',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'wind_winddirection',
          title: 'Wind direction',
          element: 'winddirection',
          level: '10m',
          unit: '°',
          scenario: scenario(['expert']),
        }),
        item({
          slug: 'wind_winddirectionchance_expert',
          title: 'Wind direction chance',
          element: 'winddirection',
          level: '10m',
          unit: '°',
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: windDirectionChanceAdapter,
              bar: {
                y: probabilityBars(
                  WindDirectionChanceGrade.map((grade) => ({
                    slug: grade.slug,
                    label: grade.point,
                    color: grade.color,
                  })),
                  'wind_winddirection_stacked',
                ),
              },
            },
            expert: {
              chart: 'bar',
              members: ['all'],
              adapter: windDirectionChanceAdapter,
              bar: {
                y: probabilityBars(
                  WindDirectionChanceGrade.map((grade) => ({
                    slug: grade.slug,
                    label: grade.point,
                    color: grade.color,
                  })),
                  'wind_winddirection_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'wind_probability_storm',
          title: 'Storm probability',
          element: 'probability_storm',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
      ],
    },
    {
      key: 'precipitation',
      title: 'Precipitation',
      icon: groupIcon(IpCloudSunHail),
      items: [
        item({
          slug: 'precipitation_precipitation',
          title: 'Precipitation rate',
          element: 'precipitationrate',
          unitKey: 'precipitation',
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'precipitation_precip',
          title: 'Precipitation',
          element: 'precipitation',
          unitKey: 'precipitation',
          decimals: 1,
          scenario: scenario(['basic', 'expert'], {
            basic: { chart: 'plume', options: precipPlumeOptions() },
          }),
        }),
        item({
          slug: 'precipitation_precipitationaccumulation',
          title: 'Precipitation accumulation',
          element: 'precipitationaccumulation',
          unit: 'mm',
          decimals: 1,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'plume',
              options: {
                y: [
                  {
                    type: 'area',
                    dataKeys: ['min', 'max'],
                    name: '100% Chance',
                    color: '#bfd9e6',
                    textColor: '#bfd9e6',
                  },
                  {
                    type: 'area',
                    dataKeys: ['percentile10', 'percentile90'],
                    name: '80% Chance',
                    color: '#92b8cc',
                    textColor: '#92b8cc',
                  },
                  {
                    type: 'area',
                    dataKeys: ['percentile25', 'percentile75'],
                    name: '50% Chance',
                    color: '#3487b1',
                    textColor: '#3487b1',
                  },
                  {
                    type: 'line',
                    dataKey: 'median',
                    name: 'Median',
                    color: '#2E2E2E',
                    width: 1.5,
                  },
                ],
              },
            },
          }),
        }),
        item({
          slug: 'precipitation_precipitationprobability',
          title: 'Precipitation probability',
          element: 'precipitationaccumulation',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'precipitation_precipitationprobability_stacked',
                ),
              },
            },
            expert: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'precipitation_precipitationprobability_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'precipitation_accumulation',
          title: 'Precipitation accumulation',
          element: 'precipitationrate',
          decimals: 1,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'precipitation_snowdepth',
          title: 'Snow depth',
          element: 'snowdepth',
          unitKey: 'snow',
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'precipitation_precipitationtype',
          title: 'Precipitation type',
          element: 'precipitationtype',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationTypeAdapter,
              bar: {
                y: probabilityBars(
                  [...PrecipitationTypeMembers].reverse(),
                  'precipitation_precipitationtype_stacked',
                ),
              },
            },
            expert: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationTypeAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationTypeMembers,
                  'precipitation_precipitationtype_stacked',
                ),
              },
            },
          }),
        }),
      ],
    },
    {
      key: 'summer',
      title: 'Summer',
      icon: groupIcon(IpSun),
      items: [
        item({
          slug: 'summer_temperature',
          title: 'Temperature',
          element: 'temperature',
          level: '2m',
          unitKey: 'temperature',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'summer_cloudcovershading',
          title: 'Shading clouds',
          element: 'cloudcovershading',
          unit: '%',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: totalCloudCoverageAdapter,
              bar: {
                reverse: true,
                y: probabilityBars(
                  [...TotalCloudCoverageGrade].reverse(),
                  'summer_totalcloudcoverage_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'summer_precipitationprobability',
          title: 'Precipitation probability',
          element: 'precipitationaccumulation',
          decimals: 0,
          scenario: scenario(['basic', 'expert'], {
            basic: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'summer_precipitationprobability_stacked',
                ),
              },
            },
            expert: {
              chart: 'bar',
              members: ['all'],
              adapter: precipitationProbabilityAccumulationAdapter,
              bar: {
                y: probabilityBars(
                  PrecipitationProbabilityMembers,
                  'summer_precipitationprobability_stacked',
                ),
              },
            },
          }),
        }),
        item({
          slug: 'summer_cape',
          title: 'CAPE',
          element: 'cape',
          level: 'mixedlayer',
          unit: 'J/kg',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
        item({
          slug: 'summer_cape_unstable',
          title: 'CAPE',
          element: 'cape',
          level: 'mostunstable',
          unit: 'J/kg',
          decimals: 0,
          scenario: scenario(['basic', 'expert']),
        }),
      ],
    },
    {
      key: 'marine',
      title: 'Marine',
      icon: groupIcon(IpShip),
      items: [
        marineItem(
          'marine_waveheight_significant',
          'Significant wave height',
          'waveheight_significant',
          { unitKey: 'wave' },
        ),
        marineItem(
          'marine_waveperiod_mean',
          'Mean wave period',
          'waveperiod_mean',
        ),
        marineItem(
          'marine_wavedirection_mean',
          'Mean wave direction',
          'wavedirection_mean',
          { unit: '°' },
        ),
        marineItem(
          'marine_wavedirection_swell',
          'Swell direction',
          'wavedirection_swell',
          { unit: '°' },
        ),
        marineItem(
          'marine_wavedirection_swell_secondary',
          'Secondary swell direction',
          'wavedirection_swell_secondary',
          { unit: '°' },
        ),
        marineItem(
          'marine_wavedirection_wind',
          'Wind wave direction',
          'wavedirection_wind',
          { unit: '°' },
        ),
        marineItem(
          'marine_waveheight_swell',
          'Swell height',
          'waveheight_swell',
          { unitKey: 'wave' },
        ),
        marineItem(
          'marine_waveheight_swell_secondary',
          'Secondary swell height',
          'waveheight_swell_secondary',
          { unitKey: 'wave' },
        ),
        marineItem(
          'marine_waveheight_wind',
          'Wind wave height',
          'waveheight_wind',
          { unitKey: 'wave' },
        ),
        marineItem(
          'marine_waveperiod_peak',
          'Peak wave period',
          'waveperiod_peak',
        ),
        marineItem(
          'marine_waveperiod_swell',
          'Swell period',
          'waveperiod_swell',
        ),
        marineItem(
          'marine_waveperiod_swell_secondary',
          'Secondary swell period',
          'waveperiod_swell_secondary',
        ),
      ],
    },
  ] satisfies EnsembleElementGroup[],
}

export const DEFAULT_ENSEMBLE_ELEMENT_GROUPS: EnsembleElementGroup[] =
  ENSEMBLE_TIMESERIES.groups
