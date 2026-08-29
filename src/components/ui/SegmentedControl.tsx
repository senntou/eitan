import { useRef } from 'react'

type Option<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const delta = e.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + delta + options.length) % options.length
    onChange(options[nextIndex].value)
    buttonRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="segmented-control" role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className={`segmented-option ${option.value === value ? 'is-selected' : ''}`}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
