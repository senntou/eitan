import { useState } from 'react'
import { StudyCard } from '../components/StudyCard'
import type { Word } from '../data/words'
import { useProgress } from '../storage/ProgressContext'
import type { Direction } from '../storage/settings'

export type SessionResult = Record<number, 'known' | 'unknown'>

type Props = {
  levelLabel: string
  words: Word[]
  direction: Direction
  onFinish: (results: SessionResult) => void
  onExit: () => void
}

export function Study({ levelLabel, words: sessionWords, direction, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<SessionResult>({})
  const { markKnown, markUnknown, isStarred, toggleStar } = useProgress()

  const current = sessionWords[index]
  const percent = Math.round((index / sessionWords.length) * 100)

  const handleAnswer = (result: 'known' | 'unknown') => {
    if (result === 'known') markKnown(current.id)
    else markUnknown(current.id)

    const nextResults = { ...results, [current.id]: result }
    setResults(nextResults)

    if (index + 1 >= sessionWords.length) {
      onFinish(nextResults)
    } else {
      setIndex(index + 1)
    }
  }

  if (!current) return null

  return (
    <div className="study-screen">
      <div className="study-header">
        <span className="study-header-label">
          {levelLabel} {index + 1} / {sessionWords.length}
        </span>
        <button type="button" className="btn-exit" onClick={onExit} aria-label="学習を中断">
          ×
        </button>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <StudyCard
        key={current.id}
        word={current}
        direction={direction}
        isStarred={isStarred(current.id)}
        onToggleStar={toggleStar}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
