import CustomLegend from '../../graph/legends/legend'
import CustomTooltip from '../../graph/tooltips/tooltip'
import { formatRun } from '@/src/utilities/date'
import type { EnsemblePlumeSeriesOption, EnsembleYConfig } from '../../types'
import { toSupportedLocale } from '../locale'
import { graphArea, graphDefault, graphLine } from './graph'
import { getBftConfig } from './parameters/bft-scale'
import { getTemperatureConfig } from './parameters/temperature'
import { getWindSpeedConfig } from './parameters/wind-speed'
import { getWindWarningConfig } from './parameters/wind-gust-warnings'
import { getTemperatureMaxConfig } from './parameters/temperature-max'
import { getDecimalTooltipConfig } from './parameters/tooltip-decimal-places'

function defaultPlumeConfig(unit?: string): EnsembleYConfig[] {
  return [
    graphArea({
      dataKeys: ['min', 'max'],
      name: '100% Chance',
      unit,
      color: '#BFBFBF',
      textColor: '#BFBFBF',
    }),
    graphArea({
      dataKeys: ['percentile10', 'percentile90'],
      name: '80% Chance',
      unit,
      color: '#A2A2A2',
      textColor: '#A2A2A2',
    }),
    graphArea({
      dataKeys: ['percentile25', 'percentile75'],
      name: '50% Chance',
      unit,
      color: '#858585',
      textColor: '#858585',
    }),
    graphLine({
      dataKey: 'median',
      name: 'Median',
      unit,
      color: '#2E2E2E',
      width: 1.5,
      legend: 'median',
      activeDot: false,
    }),
  ]
}

function getGraph(props: {
  unit?: string
  config?: { options?: { y?: EnsemblePlumeSeriesOption[] } }
}): EnsembleYConfig[] {
  if (!props?.config?.options?.y) {
    return defaultPlumeConfig(props.unit)
  }
  const graph = { area: graphArea, line: graphLine }
  return props.config.options.y.map((y) => {
    if (y.type === 'area') {
      return graph.area({
        dataKeys: y.dataKeys ?? [],
        name: y.name,
        unit: props.unit,
        color: y.color,
        textColor: y.textColor,
        opacity: 1,
      })
    }
    return graph.line({
      dataKey: y.dataKey ?? '',
      name: y.name,
      unit: props.unit,
      color: y.color,
      width: y.width,
    })
  })
}

function getLegendPayload(props: {
  config?: {
    options?: {
      legend?: {
        payload?: Array<{
          value: string
          type: 'area' | 'line' | 'bar'
          id: string
          color: string
        }>
      }
    }
  }
}) {
  if (!props?.config?.options?.legend?.payload) {
    return [
      { value: '100% Chance', type: 'line', id: 'min_max', color: '#DBDBDB' },
      {
        value: '80% Chance',
        type: 'line',
        id: 'percentile10_percentile90',
        color: '#A2A2A2',
      },
      {
        value: '50% Chance',
        type: 'line',
        id: 'percentile25_percentile75',
        color: '#858585',
      },
      { value: 'Median', type: 'line', id: 'median', color: '#2E2E2E' },
    ]
  }
  return props.config.options.legend.payload
}

export default function getPlume(props: Record<string, unknown>) {
  const {
    slug,
    unit,
    chartsData,
    model,
    title,
    titleExtra,
    run,
    language,
  } = props as {
    slug?: string
    unit?: string
    chartsData?: unknown
    model?: string
    title?: string
    titleExtra?: string
    run?: number
    language?: string
  }
  const defaultGraphConfig = graphDefault({
    language: language as string | undefined,
    timezone: (props.timezone as string | null | undefined) ?? null,
  })
  const { yAxis: temperatureYAxis, reference: temperatureReference } =
    getTemperatureConfig(props as { slug?: string; rows?: never; unit?: string; view?: string })
  const { yAxis: bftYAxis, reference: bftReference } = getBftConfig(
    props as { slug?: string; rows?: never; unit?: string },
  )
  const { tooltip: decimalTooltip } = getDecimalTooltipConfig({ slug })
  const { reference: windspeedReference } = getWindSpeedConfig({ slug, unit })
  const { reference: windWarningReference } = getWindWarningConfig({
    slug,
    unit,
  })
  const { reference: temperatureMaxReference } = getTemperatureMaxConfig({
    slug,
    unit,
  })
  const locale = toSupportedLocale(language)
  const runLabel = typeof run === 'number' ? formatRun(run, locale) : ''

  return {
    ...defaultGraphConfig,
    y: [...getGraph(props as { unit?: string; config?: { options?: { y?: EnsemblePlumeSeriesOption[] } } })],
    yAxis: {
      ...defaultGraphConfig.yAxis,
      ...temperatureYAxis,
      ...bftYAxis,
    },
    legend: {
      ...defaultGraphConfig.legend,
      verticalAlign: 'bottom' as const,
      content: CustomLegend,
      payload: getLegendPayload(
        props as {
          config?: {
            options?: {
              legend?: {
                payload?: Array<{
                  value: string
                  type: 'area' | 'line' | 'bar'
                  id: string
                  color: string
                }>
              }
            }
          }
        },
      ),
    },
    tooltip: {
      ...defaultGraphConfig.tooltip,
      content: <CustomTooltip />,
      wrapperStyle: CustomTooltip.wrapperStyle,
      ...decimalTooltip,
    },
    reference: {
      ...defaultGraphConfig.reference,
      query: chartsData,
      ...temperatureReference,
      ...bftReference,
      ...windspeedReference,
      ...windWarningReference,
      ...temperatureMaxReference,
      unit,
      slug,
      runWatermark: `${model ?? ''} - ${runLabel ?? ''}`,
      filename: `${model ?? ''} (${runLabel ?? ''}) ${title ?? ''} ${titleExtra ?? unit ?? ''} graph`,
    },
  }
}
