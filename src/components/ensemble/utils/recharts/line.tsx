import CustomActiveDot from '../../graph/active-dot'
import CustomLegend from '../../graph/legends/legend'
import CustomTooltip from '../../graph/tooltips/tooltip'
import { formatRun } from '@/src/utilities/date'
import type { EnsemblePlumeSeriesOption } from '../../types'
import { toSupportedLocale } from '../locale'
import { graphArea, graphDefault, graphLine } from './graph'
import { getTemperatureConfig } from './parameters/temperature'
import { getWindSpeedConfig } from './parameters/wind-speed'
import { getWindWarningConfig } from './parameters/wind-gust-warnings'
import { getTemperatureMaxConfig } from './parameters/temperature-max'
import { getDecimalTooltipConfig } from './parameters/tooltip-decimal-places'

function getExtraSeries(props: {
  unit?: string
  config?: { options?: { y?: EnsemblePlumeSeriesOption[] } }
}) {
  if (!props?.config?.options?.y) return []
  return props.config.options.y.map((y) => {
    if (y.type === 'area') {
      return graphArea({
        dataKeys: y.dataKeys ?? [],
        name: y.name,
        unit: props.unit,
        color: y.color,
        textColor: y.textColor,
      })
    }
    return graphLine({
      dataKey: y.dataKey ?? '',
      name: y.name,
      unit: props.unit,
      color: y.color,
      width: y.width,
    })
  })
}

function getExtraLegendPayload(props: {
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
  return props?.config?.options?.legend?.payload ?? []
}

export default function getLine(props: Record<string, unknown>) {
  const { slug, unit, run, model, title, titleExtra, members, language, config } =
    props as {
      slug?: string
      unit?: string
      run?: number
      model?: string
      title?: string
      titleExtra?: string
      members?: string[]
      language?: string
      config?: {
        type?: string
        line?: { yAxis?: { domain?: [number | 'auto', number | 'auto'] } }
        options?: { y?: EnsemblePlumeSeriesOption[] }
      }
    }
  const defaultGraphConfig = graphDefault({
    language,
    timezone: (props.timezone as string | null | undefined) ?? null,
  })
  const extraSeries = getExtraSeries({ unit, config })
  const { yAxis: temperatureYAxis, reference: temperatureReference } =
    getTemperatureConfig(props as { slug?: string; unit?: string; view?: string })
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
  const memberList = Array.isArray(members) ? members : []

  return {
    ...defaultGraphConfig,
    y: [
      ...memberList
        .filter((m) => m !== 'median' && m !== 'control')
        .filter((m) => m.startsWith('member'))
        .map((m) =>
          graphLine({
            dataKey: m,
            name: m,
            unit,
            type: config?.type,
            color: '#00BF78',
            width: 0.6,
            strokeDasharray: '0',
            activeDot: <CustomActiveDot />,
            legend: 'members',
          }),
        ),
      graphLine({
        dataKey: 'median',
        name: 'Median',
        unit,
        type: config?.type,
        color: '#656565',
        width: 2,
        strokeDasharray: '5 5',
        activeDot: <CustomActiveDot />,
        legend: 'median',
      }),
      graphLine({
        dataKey: 'control',
        name: 'Oper',
        unit,
        type: config?.type,
        color: '#E63A48',
        width: 2,
        strokeDasharray: '0',
        activeDot: <CustomActiveDot />,
        legend: 'control',
      }),
      ...extraSeries,
    ],
    legend: {
      ...defaultGraphConfig.legend,
      verticalAlign: 'bottom' as const,
      content: CustomLegend,
      payload: [
        { value: 'Members', type: 'line', id: 'members', color: '#00BF78' },
        { value: 'Median', type: 'line', id: 'median', color: '#030303' },
        { value: 'Oper', type: 'line', id: 'control', color: '#E63A48' },
        ...getExtraLegendPayload({
          config: config as {
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
          },
        }),
      ],
    },
    yAxis: {
      ...defaultGraphConfig.yAxis,
      domain: config?.line?.yAxis?.domain ?? ['auto', 'auto'],
      ...temperatureYAxis,
    },
    tooltip: {
      ...defaultGraphConfig.tooltip,
      content: <CustomTooltip extraSeries={extraSeries} />,
      wrapperStyle: CustomTooltip.wrapperStyle,
      ...decimalTooltip,
    },
    reference: {
      ...defaultGraphConfig.reference,
      ...temperatureReference,
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
