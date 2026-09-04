import { twMerge } from '@/src/utilities/external/twMerge'
import EnsembleBuilder from './builder'
import EnsembleChart from './chart'
import { EnsembleProvider, useEnsembleContext } from './context'
import EnsembleFooter from './footer'
import { EnsembleModelsProvider } from './models'
import EnsembleToolbar from './toolbar'
import type { EnsembleForecastProps } from './types'

function EnsembleForecastBody({
  showToolbar,
  showFooter,
  className,
  children,
}: Pick<
  EnsembleForecastProps,
  'showToolbar' | 'showFooter' | 'className' | 'children'
>) {
  const ctx = useEnsembleContext()
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
      {showToolbar ? <EnsembleToolbar /> : null}

      <div className="ip:min-h-0 ip:flex-1 ip:overflow-auto">
        <EnsembleBuilder>
          <EnsembleChart />
        </EnsembleBuilder>
        {children}
      </div>

      {showFooter ? <EnsembleFooter /> : null}
    </div>
  )
}

export default function EnsembleForecast({
  lat,
  lon,
  basePath,
  showToolbar = true,
  showFooter = true,
  className,
  children,
  ...providerProps
}: EnsembleForecastProps) {
  return (
    <EnsembleModelsProvider lat={lat} lon={lon} basePath={basePath}>
      <EnsembleProvider {...providerProps}>
        <EnsembleForecastBody
          showToolbar={showToolbar}
          showFooter={showFooter}
          className={className}
        >
          {children}
        </EnsembleForecastBody>
      </EnsembleProvider>
    </EnsembleModelsProvider>
  )
}
