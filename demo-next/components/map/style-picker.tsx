type StyleOption = {
  key: string
  title: string
}

type StylePickerProps = {
  value: string
  options: StyleOption[]
  onChange: (key: string) => void
}

export function StylePicker({ value, options, onChange }: StylePickerProps) {
  return (
    <label className="inline-flex shrink-0 items-center gap-2">
      <span className="text-sm font-medium text-dark">Basemap</span>
      <select
        className="rounded-md border border-cloud-200 bg-white text-sm text-dark focus:border-primary focus:ring-2 focus:ring-primary/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.title}
          </option>
        ))}
      </select>
    </label>
  )
}
