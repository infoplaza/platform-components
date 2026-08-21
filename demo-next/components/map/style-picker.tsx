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
    <label className="style-picker">
      <span className="style-picker__label">Basemap</span>
      <select
        className="style-picker__select"
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
