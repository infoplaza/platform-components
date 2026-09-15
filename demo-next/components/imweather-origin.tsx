import { IMWEATHER_URL } from '../lib/infoplaza-platform'

type ImWeatherOriginProps = {
  className?: string
}

export function ImWeatherOrigin({ className = 'mt-6' }: ImWeatherOriginProps) {
  return (
    <p
      className={`mb-0 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-dark/80 ${className}`}
    >
      Based on{' '}
      <a
        href={IMWEATHER_URL}
        className="font-semibold text-dark underline decoration-gold underline-offset-2 hover:text-primary"
        rel="noreferrer"
        target="_blank"
      >
        ImWeather
      </a>
      {' '}
      — Infoplaza&apos;s operational weather visualization, packaged as React
      components for the Infoplaza Platform.
    </p>
  )
}
