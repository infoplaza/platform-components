const ALLOWED = ['overview_windspeed', 'wind_windspeed']

function getWindUnitReferenceLines(unit?: string) {
  if (unit === 'm/s') {
    return [
      { line: 17.2, stroke: '#ff9300' },
      { line: 20.8, stroke: '#E63A48' },
    ]
  }
  if (unit === 'km/h') {
    return [
      { line: 62, stroke: '#ff9300' },
      { line: 75, stroke: '#E63A48' },
    ]
  }
  if (unit === 'mph') {
    return [
      { line: 39, stroke: '#ff9300' },
      { line: 47, stroke: '#E63A48' },
    ]
  }
  if (unit === 'kt') {
    return [
      { line: 34, stroke: '#ff9300' },
      { line: 41, stroke: '#E63A48' },
    ]
  }
  return []
}

export function getWindSpeedConfig(props: { slug?: string; unit?: string }) {
  const { slug, unit } = props
  if (!slug || !ALLOWED.includes(slug)) {
    return { reference: {} }
  }
  return {
    reference: {
      yLines: getWindUnitReferenceLines(unit),
    },
  }
}
