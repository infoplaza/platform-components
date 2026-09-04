const ALLOWED = ['overview_windgust', 'wind_windgust']

function getWindGustWarningsReferenceLines(unit?: string) {
  if (unit === 'm/s') {
    return [
      { line: 21, stroke: '#ff9300' },
      { line: 28, stroke: '#E63A48' },
      { line: 35, stroke: '#6a2b4d' },
    ]
  }
  if (unit === 'km/h') {
    return [
      { line: 75, stroke: '#ff9300' },
      { line: 100, stroke: '#E63A48' },
      { line: 125, stroke: '#6a2b4d' },
    ]
  }
  if (unit === 'mph') {
    return [
      { line: 41, stroke: '#ff9300' },
      { line: 54, stroke: '#E63A48' },
      { line: 67, stroke: '#6a2b4d' },
    ]
  }
  if (unit === 'kt') {
    return [
      { line: 47, stroke: '#ff9300' },
      { line: 62, stroke: '#E63A48' },
      { line: 78, stroke: '#6a2b4d' },
    ]
  }
  return []
}

export function getWindWarningConfig(props: { slug?: string; unit?: string }) {
  const { slug, unit } = props
  if (!slug || !ALLOWED.includes(slug)) {
    return { reference: {} }
  }
  return {
    reference: {
      yLines: getWindGustWarningsReferenceLines(unit),
    },
  }
}
