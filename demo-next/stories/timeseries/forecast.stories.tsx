import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TimeseriesForecast } from '@infoplaza/platform/timeseries'
import {
  AMSTERDAM,
  getTimeseriesBlocks,
} from '../../components/timeseries/fixtures'
import { ELEMENT_GROUP_KEYS, LOCALES, getIconSrc } from './helpers'

const meta = {
  title: 'Timeseries/Forecast',
  component: TimeseriesForecast,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    lat: AMSTERDAM.lat,
    lon: AMSTERDAM.lon,
    locale: 'en',
    timezone: null,
    headerFormat: ['EEEEEE d MMM', 'HH'],
    scrollToCurrentTime: true,
    showToolbar: true,
    showFooter: true,
    showPalette: true,
    getBlocks: getTimeseriesBlocks,
    getIconSrc,
  },
  argTypes: {
    locale: { control: 'select', options: [...LOCALES] },
    showToolbar: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    showPalette: { control: 'boolean' },
    defaultElementGroup: {
      control: 'select',
      options: [...ELEMENT_GROUP_KEYS],
    },
    getBlocks: { table: { disable: true } },
    getIconSrc: { table: { disable: true } },
    headerFormat: { table: { disable: true } },
  },
} satisfies Meta<typeof TimeseriesForecast>

export default meta
type Story = StoryObj<typeof meta>

export const Packaged: Story = {}

export const ChartOnly: Story = {
  args: {
    showToolbar: false,
    showFooter: false,
  },
}

export const PaletteOff: Story = {
  args: {
    showPalette: false,
  },
}
