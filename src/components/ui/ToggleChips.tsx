type Option<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  label: string
  options: Option<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
}

export function ToggleChips<T extends string>({ label, options, selected, onChange }: Props<T>) {
  const toggle = (value: T) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div className="toggle-chips" role="group" aria-label={label}>
      {options.map((option) => {
        const isOn = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            className={`chip ${isOn ? 'is-selected' : ''}`}
            aria-pressed={isOn}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
