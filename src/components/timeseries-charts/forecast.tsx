import { twMerge } from '@/src/utilities/external/twMerge'
import { TimeseriesModelsProvider } from '../timeseries/models'
import TimeseriesChartsBuilder from './builder'
import TimeseriesChartsChart from './chart'
import {
  TimeseriesChartsProvider,
  useTimeseriesChartsContext,
} from './context'
import TimeseriesChartsFooter from './footer'
import TimeseriesChartsToolbar from './toolbar'
import type { TimeseriesChartsForecastProps } from './types'

function TimeseriesChartsForecastBody({
  showToolbar,
  showFooter,
  className,
  children,
}: Pick<
  TimeseriesChartsForecastProps,
  'showToolbar' | 'showFooter' | 'className' | 'children'
>) {
  const ctx = useTimeseriesChartsContext()
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
      {showToolbar ? <TimeseriesChartsToolbar /> : null}

      <div className="ip:min-h-0 ip:flex-1 ip:overflow-auto">
        <TimeseriesChartsBuilder>
          <TimeseriesChartsChart />
        </TimeseriesChartsBuilder>
        {children}
      </div>

      {showFooter ? <TimeseriesChartsFooter /> : null}
    </div>
  )
}

export default function TimeseriesChartsForecast({
  lat,
  lon,
  basePath,
  domain,
  showToolbar = true,
  showFooter = false,
  className,
  children,
  ...providerProps
}: TimeseriesChartsForecastProps) {
  return (
    <TimeseriesModelsProvider
      lat={lat}
      lon={lon}
      basePath={basePath}
      domain={domain}
    >
      <TimeseriesChartsProvider {...providerProps}>
        <TimeseriesChartsForecastBody
          showToolbar={showToolbar}
          showFooter={showFooter}
          className={className}
        >
          {children}
        </TimeseriesChartsForecastBody>
      </TimeseriesChartsProvider>
    </TimeseriesModelsProvider>
  )
}
