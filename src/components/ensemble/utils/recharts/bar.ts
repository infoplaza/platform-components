import { formatRun } from '@/src/utilities/date'
import type { EnsembleBarSeries, EnsembleRow } from '../../types'
import { toSupportedLocale } from '../locale'
import { graphBar, graphDefault } from './graph'
import CustomLegend from '../../graph/legends/legend'
import { getSequenceOffsetConfig } from './parameters/sequence-offset'
import { getPrecipitationProbabilityConfig } from './parameters/precipitation-probability'
import { getDateSimplifiedTooltipConfig } from './parameters/tooltip-date-simplified'
import { getBarWidthOffset } from './parameters/bar-width'
import { getWindDirectionConfig } from './parameters/wind-direction'
import { getPrecipitationBarWidthOffset } from './parameters/precipitation-bar-width'

export default function getBar(props: Record<string, unknown>) {
  const { config, slug, unit, run, model, title, titleExtra, language, rows } =
    props as {
      config?: {
        bar?: {
          y?: EnsembleBarSeries[]
          yAxis?: { domain?: [number | 'auto', number | 'auto'] }
          reference?: Record<string, unknown>
        }
        tooltip?: Record<string, unknown>
      }
      slug?: string
      unit?: string
      run?: number
      model?: string
      title?: string
      titleExtra?: string
      language?: string
      rows?: EnsembleRow[]
    }
  const defaultGraphConfig = graphDefault({
    language,
    timezone: (props.timezone as string | null | undefined) ?? null,
  })
  const { reference: referenceSequence } = getSequenceOffsetConfig({
    slug,
    rows,
  })
  const { tooltip: tooltipPrecipitationProbability } =
    getPrecipitationProbabilityConfig({ slug })
  const { tooltip: tooltipDateSimplified, bar: barDateSimplified } =
    getDateSimplifiedTooltipConfig({ slug, language })
  const { tooltip: tooltipWindDirection } = getWindDirectionConfig({ slug })
  const barWidthOffset = getBarWidthOffset(slug)
  const precipitationBarWidthOffset = getPrecipitationBarWidthOffset(slug)
  const locale = toSupportedLocale(language)
  const runLabel = typeof run === 'number' ? formatRun(run, locale) : ''
  const barSeries = config?.bar?.y ?? []

  return {
    ...defaultGraphConfig,
    y: barSeries.map((series) =>
      graphBar({
        ...series,
        ...barDateSimplified,
        ...barWidthOffset,
        ...precipitationBarWidthOffset,
      }),
    ),
    legend: {
      ...defaultGraphConfig.legend,
      verticalAlign: 'bottom' as const,
      content: CustomLegend,
      payload: barSeries.map(({ dataKey, name, fill, translatable }) => ({
        value: name,
        type: 'bar',
        id: dataKey,
        color: fill,
        translatable,
      })),
    },
    yAxis: {
      ...defaultGraphConfig.yAxis,
      domain: config?.bar?.yAxis?.domain ?? [0, 100],
    },
    tooltip: {
      ...(config?.tooltip ?? {}),
      ...defaultGraphConfig.tooltip,
      ...tooltipPrecipitationProbability,
      ...tooltipDateSimplified,
      ...tooltipWindDirection,
    },
    reference: {
      ...(config?.bar?.reference ?? {}),
      ...defaultGraphConfig.reference,
      alternateArea: false,
      unit,
      slug,
      runWatermark: `${model ?? ''} - ${runLabel ?? ''}`,
      filename: `${model ?? ''} (${runLabel ?? ''}) ${title ?? ''} ${titleExtra ?? unit ?? ''} graph`,
      ...referenceSequence,
    },
  }
}
