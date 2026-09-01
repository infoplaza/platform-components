import { twMerge } from '@/src/utilities/external/twMerge'
import TimeseriesBuilder from './builder'
import TimeseriesChart from './chart'
import { TimeseriesProvider, useTimeseriesContext } from './context'
import TimeseriesFooter from './footer'
import { TimeseriesModelsProvider } from './models'
import TimeseriesToolbar from './toolbar'
import type { TimeseriesForecastProps } from './types'

function TimeseriesForecastBody({
  showToolbar,
  showFooter,
  className,
  children,
}: Pick<
  TimeseriesForecastProps,
  'showToolbar' | 'showFooter' | 'className' | 'children'
>) {
  const ctx = useTimeseriesContext()
  const error = ctx?.error ?? null

  return (
    <div
      className={twMerge(
        'ip-platform ip:flex ip:w-full ip:flex-col ip:bg-white ip:dark:bg-dark/90',
        className,
      )}
    >
      {error ? (
        <div className="ip:px-3 ip:py-2 ip:text-xs ip:text-red-600 ip:dark:text-red-400">
          {error.message}
        </div>
      ) : null}
      {showToolbar ? <TimeseriesToolbar /> : null}

      <div className="ip:min-h-0 ip:flex-1 ip:overflow-auto">
        <TimeseriesBuilder>
          <TimeseriesChart />
        </TimeseriesBuilder>
        {children}
      </div>

      {showFooter ? <TimeseriesFooter /> : null}
    </div>
  )
}

export default function TimeseriesForecast({
  lat,
  lon,
  basePath,
  showToolbar = true,
  showFooter = true,
  className,
  children,
  ...providerProps
}: TimeseriesForecastProps) {
  return (
    <TimeseriesModelsProvider lat={lat} lon={lon} basePath={basePath}>
      <TimeseriesProvider {...providerProps}>
        <TimeseriesForecastBody
          showToolbar={showToolbar}
          showFooter={showFooter}
          className={className}
        >
          {children}
        </TimeseriesForecastBody>
      </TimeseriesProvider>
    </TimeseriesModelsProvider>
  )
}
