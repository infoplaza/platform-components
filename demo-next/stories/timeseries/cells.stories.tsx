import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  TimeseriesTable,
  type TimeseriesCell,
  type TimeseriesCellView,
  type TimeseriesRow,
} from '@infoplaza/platform/timeseries'
import { getIconSrc } from './helpers'

const HOURS = 12
const START = Math.floor(Date.now() / 3_600_000) * 3_600

function cells(
  values: number[],
  background: string,
  text = '#ffffff',
): TimeseriesCell[] {
  return values.map((value, index) => ({
    timestamp: START + index * 3600,
    value,
    color: { background, text },
  }))
}

function series(base: number, amplitude: number): number[] {
  return Array.from({ length: HOURS }, (_, index) =>
    Math.round((base + Math.sin(index / 2) * amplitude) * 10) / 10,
  )
}

function row(
  title: string,
  view: TimeseriesCellView,
  values: number[],
  background: string,
  extra?: Partial<TimeseriesRow>,
): TimeseriesRow {
  return {
    title,
    view,
    data: cells(values, background, view === 'ICON' ? '#111111' : '#ffffff'),
    ...extra,
  }
}

const rows: TimeseriesRow[] = [
  row('VALUE', 'VALUE', series(12, 6), 'rgb(80, 140, 200)', {
    subtitle: '°C',
    unit: '°C',
    config: { element: 'temperature', decimals: 1 },
  }),
  row('VALUE_ROUND', 'VALUE_ROUND', series(6, 4), 'rgb(60, 120, 180)', {
    subtitle: 'm/s',
    unit: 'm/s',
    config: { element: 'windspeed' },
  }),
  row('DIRECTION', 'DIRECTION', series(220, 40), 'rgb(40, 90, 160)', {
    subtitle: '°',
    unit: '°',
    config: { element: 'winddirection' },
  }),
  row(
    'PRECIPITATION_TYPE',
    'PRECIPITATION_TYPE',
    series(2, 2).map((value) => Math.min(10, Math.max(0, Math.round(value)))),
    'rgb(30, 90, 180)',
    { config: { element: 'precipitationtype' } },
  ),
  row(
    'ICON',
    'ICON',
    series(2, 2).map((value) => Math.min(8, Math.max(1, Math.round(value)))),
    'transparent',
    { config: { element: 'weathericon' } },
  ),
]

const meta = {
  title: 'Timeseries/Cells',
  component: TimeseriesTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    rows,
    title: 'Cell views',
    subtitle: 'Fixture',
    locale: 'en',
    timezone: null,
    headerFormat: ['EEEEEE d MMM', 'HH'],
    showPalette: true,
    getIconSrc,
  },
} satisfies Meta<typeof TimeseriesTable>

export default meta
type Story = StoryObj<typeof meta>

export const AllViews: Story = {}

export const PaletteOff: Story = {
  args: {
    showPalette: false,
  },
}
