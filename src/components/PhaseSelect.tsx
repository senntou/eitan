import { PHASES } from '../data/phases'
import type { Word } from '../data/words'

type Props = {
  words: Word[]
  phase: number
  onChange: (phase: number) => void
}

export function PhaseSelect({ words, phase, onChange }: Props) {
  return (
    <select
      className="phase-select"
      value={phase}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {PHASES.map((p) => {
        const count = words.filter((w) => w.phase === p.id).length
        return (
          <option key={p.id} value={p.id}>
            {p.title} ({count}語)
          </option>
        )
      })}
    </select>
  )
}
