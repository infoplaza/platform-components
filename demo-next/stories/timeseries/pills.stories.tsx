import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TimeseriesPills } from '@infoplaza/platform/timeseries'

const MODEL_VALUES = ['harmonie', 'ecmwf', 'gfs', 'icon', 'arome'] as const

const meta = {
  title: 'Timeseries/Pills',
  component: TimeseriesPills,
  tags: ['autodocs'],
  args: {
    items: [],
    onChange: () => {},
  },
} satisfies Meta<typeof TimeseriesPills>

export default meta
type Story = StoryObj<typeof meta>

export const Models: Story = {
  render: function PillsStory() {
    const [value, setValue] = useState('harmonie')
    const items = useMemo(
      () =>
        MODEL_VALUES.map((slug) => ({
          title: slug.toUpperCase(),
          value: slug,
          active: slug === value,
          beta: slug === 'gfs',
        })),
      [value],
    )
    return <TimeseriesPills items={items} onChange={setValue} maxItems={3} />
  },
}

export const Overflow: Story = {
  render: function OverflowPillsStory() {
    const [value, setValue] = useState('overview')
    const items = useMemo(
      () =>
        [
          'overview',
          'temperature',
          'moisture',
          'wind',
          'precipitation',
          'stability',
          'airquality',
          'wave',
        ].map((key) => ({
          title: key[0].toUpperCase() + key.slice(1),
          value: key,
          active: key === value,
        })),
      [value],
    )
    return (
      <TimeseriesPills
        items={items}
        onChange={setValue}
        maxItems={4}
        minItems={0}
        resize={false}
      />
    )
  },
}
