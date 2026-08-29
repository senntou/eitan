import { useState } from 'react'
import { phasesForWords } from '../data/phases'
import type { Word } from '../data/words'
import { usePhaseProgress } from '../storage/PhaseProgressContext'
import type { OrderMode } from '../storage/settings'
import { shuffle } from '../utils/shuffle'
import { SegmentedControl } from './ui/SegmentedControl'

const LIMITED_COUNT = 5

type CountMode = 'limited' | 'all'

type Props = {
  levelId: number
  levelWords: Word[]
  order: OrderMode
  onStart: (phaseIndex: number, label: string, words: Word[], countMode: CountMode) => void
}

export function PhaseList({ levelId, levelWords, order, onStart }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [countMode, setCountMode] = useState<CountMode>('all')
  const { getPhaseStat } = usePhaseProgress()

  const phases = phasesForWords(levelWords)

  const handleToggle = (phaseIndex: number) => {
    setOpenIndex((prev) => (prev === phaseIndex ? null : phaseIndex))
    setCountMode('all')
  }

  const handleStart = (phaseIndex: number, label: string, phaseWords: Word[]) => {
    const source = order === 'random' ? shuffle(phaseWords) : phaseWords
    const count = countMode === 'all' ? phaseWords.length : Math.min(LIMITED_COUNT, phaseWords.length)
    onStart(phaseIndex, label, source.slice(0, count), countMode)
  }

  return (
    <ul className="phase-list">
      {phases.map((phase) => {
        const stat = getPhaseStat(levelId, phase.index)
        const isOpen = openIndex === phase.index
        return (
          <li key={phase.index} className="phase-row">
            <button
              type="button"
              className="phase-row-main"
              aria-expanded={isOpen}
              onClick={() => handleToggle(phase.index)}
            >
              <span className="phase-row-label">{phase.label}</span>
              <span className="phase-row-stats">
                {stat ? `${stat.laps}周 ・ 前回 ${stat.lastAccuracy}%` : '未挑戦'}
              </span>
            </button>

            {isOpen && (
              <div className="phase-row-detail">
                <SegmentedControl
                  label="問題数"
                  value={countMode}
                  onChange={setCountMode}
                  options={[
                    { value: 'limited', label: `${Math.min(LIMITED_COUNT, phase.words.length)}問` },
                    { value: 'all', label: `全部(${phase.words.length}問)` },
                  ]}
                />
                <button
                  type="button"
                  className="btn btn-primary phase-row-start"
                  onClick={() => handleStart(phase.index, phase.label, phase.words)}
                >
                  {phase.label} をはじめる
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
