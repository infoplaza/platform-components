function getTempUnitReferenceLines(unit?: string) {
  if (unit === 'K') {
    return [
      { line: 273.15, stroke: '#2680b3' },
      { line: 263.15, stroke: '#2680b3' },
    ]
  }
  if (unit === '°F') {
    return [
      { line: 32, stroke: '#2680b3' },
      { line: 14, stroke: '#2680b3' },
    ]
  }
  return [
    { line: 0, stroke: '#2680b3' },
    { line: -10, stroke: '#2680b3' },
  ]
}

export function getTemperatureMaxConfig(props: {
  slug?: string
  unit?: string
}) {
  const allowedSlugs: string[] = []
  if (!props.slug || !allowedSlugs.includes(props.slug)) {
    return { reference: {} }
  }
  return {
    reference: {
      yLines: getTempUnitReferenceLines(props.unit),
    },
  }
}
