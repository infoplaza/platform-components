import type {
  TimeseriesDomain,
  TimeseriesModel,
  TimeseriesRun,
} from '../timeseries/types'
import {
  fetchTimeseriesPointForecast,
  findTimeseriesSeries,
  formatTimeseriesRuntime,
  partitionTimeseriesGroupItems,
  type TimeseriesPointForecast,
} from '../timeseries/point-forecast'
import {
  alignLineRows,
  dayTicks,
  mutateDirectionOverlay,
  mutateLineSeries,
  mutatePrecipitationTypeOverlay,
  mutateValueOverlay,
} from './series'
import type {
  TimeseriesChartBlock,
  TimeseriesChartDirectionOverlay,
  TimeseriesChartElementGroup,
  TimeseriesChartElementItem,
  TimeseriesChartGraphConfig,
  TimeseriesChartLineSeries,
  TimeseriesChartPrecipitationTypeOverlay,
  TimeseriesChartValueOverlay,
} from './types'

function uniqueRequestParams(
  available: Array<{ element: string; level: string; unit?: string }>,
) {
  const seen = new Set<string>()
  const elements: string[] = []
  const levels: string[] = []
  const units: string[] = []

  for (const entry of available) {
    const key = `${entry.element}::${entry.level}::${entry.unit ?? ''}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    elements.push(entry.element)
    levels.push(entry.level)
    units.push(entry.unit ?? '')
  }

  return { elements, levels, units }
}

export function assembleChart(options: {
  group: TimeseriesChartElementGroup
  forecast: TimeseriesPointForecast
  model: TimeseriesModel
  titleExtra?: string
}): TimeseriesChartBlock {
  const { available } = partitionTimeseriesGroupItems(
    options.model,
    options.group.items,
  )

  const linePoints: Array<{
    slug: string
    points: Array<{ ts: number; value: number | null }>
  }> = []
  const lines: TimeseriesChartLineSeries[] = []
  const directions: TimeseriesChartDirectionOverlay[] = []
  const values: TimeseriesChartValueOverlay[] = []
  const precipitationTypes: TimeseriesChartPrecipitationTypeOverlay[] = []

  for (const requested of available) {
    const item = requested.item as TimeseriesChartElementItem
    const series = findTimeseriesSeries(
      options.forecast.elements,
      requested.element,
      requested.level,
    )
    if (!series?.data.length) {
      continue
    }

    const unit = series.unit || item.unit
    const resolved: TimeseriesChartElementItem = { ...item, unit }

    if (item.view === 'LINE') {
      const mutated = mutateLineSeries(resolved, series.data, lines.length)
      lines.push(mutated.series)
      linePoints.push({ slug: item.slug, points: mutated.points })
      continue
    }

    if (item.view === 'DIRECTION') {
      directions.push(mutateDirectionOverlay(resolved, series.data))
      continue
    }

    if (item.view === 'VALUE') {
      values.push(mutateValueOverlay(resolved, series.data))
      continue
    }

    if (item.view === 'PRECIPITATION_TYPE') {
      precipitationTypes.push(
        mutatePrecipitationTypeOverlay(resolved, series.data),
      )
    }
  }

  const data = alignLineRows(linePoints)
  const timestamps = data.map((row) => Number(row.ts)).filter(Number.isFinite)
  const start = timestamps[0]
  const end = timestamps[timestamps.length - 1]
  const config: TimeseriesChartGraphConfig = {
    data,
    lines,
    directions,
    values,
    precipitationTypes,
    unit: lines[0]?.unit,
    domain:
      start != null && end != null && Number.isFinite(start) && Number.isFinite(end)
        ? [start, end]
        : undefined,
    ticks:
      start != null && end != null ? dayTicks(start, end) : undefined,
  }

  return {
    key: `${options.group.key}-${options.forecast.runtime ?? 'latest'}`,
    title: options.group.title,
    subtitle: formatTimeseriesRuntime(options.forecast.runtime),
    titleExtra: options.titleExtra,
    groupKey: options.group.key,
    config,
  }
}

function emptyChart(
  group: TimeseriesChartElementGroup,
  subtitle?: string,
  titleExtra?: string,
): TimeseriesChartBlock {
  return {
    key: `${group.key}-empty`,
    title: group.title,
    subtitle,
    titleExtra,
    groupKey: group.key,
    config: {
      data: [],
      lines: [],
      directions: [],
      values: [],
      precipitationTypes: [],
    },
  }
}

/**
 * Loads point-forecast series once per runtime for every chart group, then
 * assembles one composed chart per group. `run === 'all'` stacks groups for
 * each catalog runtime.
 */
export async function fetchTimeseriesCharts(options: {
  basePath: string
  lat: number
  lon: number
  model: TimeseriesModel
  run: TimeseriesRun
  groups: TimeseriesChartElementGroup[]
  domain?: TimeseriesDomain
  signal?: AbortSignal
}): Promise<TimeseriesChartBlock[]> {
  const available = options.groups.flatMap(
    (group) => partitionTimeseriesGroupItems(options.model, group.items).available,
  )
  const runtimes =
    options.run === 'all'
      ? [...options.model.runtimes]
      : typeof options.run === 'number'
        ? [options.run]
        : []

  if (available.length === 0) {
    return options.groups.map((group) => emptyChart(group))
  }

  const params = uniqueRequestParams(available)
  const levelsParam = params.levels.every((level) => !level)
    ? params.levels.map(() => '-')
    : params.levels

  const forecasts = await Promise.all(
    (runtimes.length > 0 ? runtimes : [undefined]).map((runtime) =>
      fetchTimeseriesPointForecast({
        basePath: options.basePath,
        lat: options.lat,
        lon: options.lon,
        model: options.model.slug,
        runtime,
        elements: params.elements,
        levels: levelsParam,
        units: params.units,
        domain: options.domain,
        signal: options.signal,
      }),
    ),
  )

  return forecasts.flatMap((forecast, index) =>
    options.groups.map((group) =>
      assembleChart({
        group,
        forecast,
        model: options.model,
        titleExtra:
          options.run === 'all' && index === 0 ? 'latest' : undefined,
      }),
    ),
  )
}
