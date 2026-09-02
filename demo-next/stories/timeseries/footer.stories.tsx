import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  DEFAULT_TIMESERIES_ELEMENT_GROUPS,
  TimeseriesFooter,
} from '@infoplaza/platform/timeseries'

const meta = {
  title: 'Timeseries/Footer',
  component: TimeseriesFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof TimeseriesFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function FooterStory() {
    const [elementGroup, setElementGroup] = useState('overview')
    return (
      <TimeseriesFooter
        elementGroups={DEFAULT_TIMESERIES_ELEMENT_GROUPS}
        elementGroup={elementGroup}
        onElementGroupChange={setElementGroup}
      />
    )
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}
