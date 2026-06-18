export const DEFAULT_WEATHER_CONFIG = {
  element: 'temperature',
  model: 'gfs',
  run: 'latest',
  member: null,
  level: null,
  hideLayers: [],
} as const

export const TIMESTAMP_STATUS = {
  LOADED: 100,
  NOT_LOADED: 0
} as const