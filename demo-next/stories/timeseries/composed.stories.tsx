import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  TimeseriesBuilder,
  TimeseriesChart,
  TimeseriesFooter,
  TimeseriesToolbar,
  useTimeseries,
} from '@infoplaza/platform/timeseries'
import { ELEMENT_GROUP_KEYS, FixtureProviders, LOCALES } from './helpers'

function ComposedBody() {
  const { error } = useTimeseries()

  return (
    <div className="flex min-h-[28rem] w-full flex-col bg-white">
      {error ? (
        <div className="px-3 py-2 text-xs text-red-600">{error.message}</div>
      ) : null}
      <TimeseriesToolbar />
      <div className="min-h-0 flex-1 overflow-auto">
        <TimeseriesBuilder>
          <TimeseriesChart />
        </TimeseriesBuilder>
      </div>
      <TimeseriesFooter />
    </div>
  )
}

const meta = {
  title: 'Timeseries/Composed',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    locale: 'en' as const,
    showPalette: true,
    defaultElementGroup: 'overview',
  },
  argTypes: {
    locale: { control: 'select', options: [...LOCALES] },
    showPalette: { control: 'boolean' },
    defaultElementGroup: {
      control: 'select',
      options: [...ELEMENT_GROUP_KEYS],
    },
  },
  render: (args) => (
    <FixtureProviders
      locale={args.locale}
      showPalette={args.showPalette}
      defaultElementGroup={args.defaultElementGroup}
    >
      <ComposedBody />
    </FixtureProviders>
  ),
} satisfies Meta<{
  locale: string
  showPalette: boolean
  defaultElementGroup: string
}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
