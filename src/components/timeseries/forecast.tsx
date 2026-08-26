import { twMerge } from '@/src/utilities/external/twMerge'
import TimeseriesBuilder from './builder'
import TimeseriesChart from './chart'
import { TimeseriesProvider } from './context'
import TimeseriesFooter from './footer'
import TimeseriesToolbar from './toolbar'
import type { TimeseriesForecastProps } from './types'

export default function TimeseriesForecast({
  showToolbar = true,
  showFooter = true,
  className,
  children,
  ...providerProps
}: TimeseriesForecastProps) {
  return (
    <TimeseriesProvider {...providerProps}>
      <div
        className={twMerge(
          'ip-platform ip:flex ip:w-full ip:flex-col ip:bg-white ip:dark:bg-dark/90',
          className,
        )}
      >
        {showToolbar ? <TimeseriesToolbar /> : null}

        <div className="ip:min-h-0 ip:flex-1 ip:overflow-auto">
          <TimeseriesBuilder>
            <TimeseriesChart />
          </TimeseriesBuilder>
          {children}
        </div>

        {showFooter ? <TimeseriesFooter /> : null}
      </div>
    </TimeseriesProvider>
  )
}
