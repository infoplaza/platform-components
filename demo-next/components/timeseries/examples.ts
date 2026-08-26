export const PACKAGED_FILENAME = 'packaged.tsx'

export const PACKAGED_SOURCE = `'use client'

import { useMemo, useState } from 'react'
import {
  TimeseriesForecast,
  type TimeseriesRun,
} from '@infoplaza/platform/timeseries'

export default function PackagedTimeseries({
  models,
  elementGroups,
  getBlocks,
}) {
  const [model, setModel] = useState(models[0]?.slug ?? '')
  const [run, setRun] = useState<TimeseriesRun>(
    models[0]?.runtimes[0] ?? 'all',
  )
  const [elementGroup, setElementGroup] = useState(
    elementGroups[0]?.key ?? '',
  )

  const blocks = useMemo(
    () => getBlocks({ model, run, elementGroup, models }),
    [elementGroup, getBlocks, model, models, run],
  )

  return (
    <TimeseriesForecast
      models={models}
      model={model}
      onModelChange={(slug) => {
        setModel(slug)
        const next = models.find((item) => item.slug === slug)
        if (next?.runtimes[0]) setRun(next.runtimes[0])
      }}
      run={run}
      onRunChange={setRun}
      elementGroups={elementGroups}
      elementGroup={elementGroup}
      onElementGroupChange={setElementGroup}
      blocks={blocks}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    />
  )
}
`

export const CHART_ONLY_FILENAME = 'chart-only.tsx'

export const CHART_ONLY_SOURCE = `'use client'

import { useMemo, useState } from 'react'
import {
  TimeseriesForecast,
  type TimeseriesRun,
} from '@infoplaza/platform/timeseries'

export default function ChartOnlyTimeseries({
  models,
  elementGroups,
  getBlocks,
}) {
  const [model, setModel] = useState(models[0]?.slug ?? '')
  const [run, setRun] = useState<TimeseriesRun>(
    models[0]?.runtimes[0] ?? 'all',
  )
  const [elementGroup, setElementGroup] = useState(
    elementGroups[0]?.key ?? '',
  )

  const blocks = useMemo(
    () => getBlocks({ model, run, elementGroup, models }),
    [elementGroup, getBlocks, model, models, run],
  )

  return (
    <TimeseriesForecast
      models={models}
      model={model}
      onModelChange={setModel}
      run={run}
      onRunChange={setRun}
      elementGroups={elementGroups}
      elementGroup={elementGroup}
      onElementGroupChange={setElementGroup}
      blocks={blocks}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
      showToolbar={false}
      showFooter={false}
    />
  )
}
`

export const COMPOSED_FILENAME = 'composed.tsx'

export const COMPOSED_SOURCE = `'use client'

import {
  TimeseriesBuilder,
  TimeseriesChart,
  TimeseriesFooter,
  TimeseriesProvider,
  TimeseriesToolbar,
} from '@infoplaza/platform/timeseries'

export default function ComposedTimeseries({
  models,
  elementGroups,
  getBlocks,
}) {
  return (
    <TimeseriesProvider
      models={models}
      elementGroups={elementGroups}
      getBlocks={getBlocks}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    >
      <TimeseriesToolbar />
      <TimeseriesBuilder>
        <TimeseriesChart />
      </TimeseriesBuilder>
      <TimeseriesFooter />
    </TimeseriesProvider>
  )
}
`
