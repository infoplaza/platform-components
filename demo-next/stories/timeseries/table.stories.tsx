import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TimeseriesTable } from '@infoplaza/platform/timeseries'
import {
  DEMO_MODELS,
  getTimeseriesBlocks,
} from '../../components/timeseries/fixtures'
import { LOCALES, getIconSrc } from './helpers'

function blocksFor(
  elementGroup: string,
  run: number | 'all' = DEMO_MODELS[0].runtimes[0],
) {
  return getTimeseriesBlocks({
    model: 'harmonie',
    run,
    elementGroup,
    models: DEMO_MODELS,
  })
}

const overview = blocksFor('overview')[0]
const wind = blocksFor('wind')[0]

const meta = {
  title: 'Timeseries/Table',
  component: TimeseriesTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    rows: overview.rows,
    hiddenRows: overview.hiddenRows,
    title: overview.title,
    subtitle: overview.subtitle,
    titleExtra: overview.titleExtra,
    locale: 'en',
    timezone: null,
    headerFormat: ['EEEEEE d MMM', 'HH'],
    scrollToCurrentTime: true,
    showPalette: true,
    getIconSrc,
  },
  argTypes: {
    locale: { control: 'select', options: [...LOCALES] },
    showPalette: { control: 'boolean' },
    getIconSrc: { table: { disable: true } },
    rows: { table: { disable: true } },
    hiddenRows: { table: { disable: true } },
    headerFormat: { table: { disable: true } },
  },
} satisfies Meta<typeof TimeseriesTable>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}

export const Wind: Story = {
  args: {
    rows: wind.rows,
    hiddenRows: wind.hiddenRows,
    title: wind.title,
    subtitle: wind.subtitle,
    titleExtra: wind.titleExtra,
  },
}

export const HiddenRows: Story = {
  args: {
    hiddenRows: [
      { title: 'Visibility', reason: 'Not available for this model' },
      { title: 'CAPE', reason: 'Not available for this model', beta: true },
    ],
  },
}

export const AllRuns: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      {blocksFor('overview', 'all').map((block, index) => (
        <TimeseriesTable
          key={`${block.title ?? 'block'}-${index}`}
          {...args}
          rows={block.rows}
          hiddenRows={block.hiddenRows}
          title={block.title}
          subtitle={block.subtitle}
          titleExtra={block.titleExtra}
        />
      ))}
    </div>
  ),
}
