import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TimeseriesToolbar } from '@infoplaza/platform/timeseries'
import { FixtureProviders } from './helpers'

const meta = {
  title: 'Timeseries/Toolbar',
  component: TimeseriesToolbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <FixtureProviders>
        <Story />
      </FixtureProviders>
    ),
  ],
} satisfies Meta<typeof TimeseriesToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
