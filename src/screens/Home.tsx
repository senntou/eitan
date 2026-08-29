import { useMemo } from 'react'
import { LEVELS } from '../data/levels'
import { words } from '../data/words'
import { useProgress } from '../storage/ProgressContext'

type Props = {
  lastLevelId: number
  onOpenLevel: (levelId: number) => void
}

export function Home({ lastLevelId, onOpenLevel }: Props) {
  const { getMastery } = useProgress()

  const levelStats = useMemo(() => {
    return LEVELS.map((level) => {
      const levelWords = words.filter((w) => w.level === level.id)
      const mastered = levelWords.filter((w) => getMastery(w.id) === 'mastered').length
      return { level, total: levelWords.length, mastered }
    })
  }, [getMastery])

  const totalMastered = levelStats.reduce((sum, s) => sum + s.mastered, 0)
  const totalWords = words.length
  const percent = totalWords === 0 ? 0 : Math.round((totalMastered / totalWords) * 100)
  const lastLevel = levelStats.find((s) => s.level.id === lastLevelId) ?? levelStats[0]

  return (
    <div className="home">
      <div className="home-summary">
        <h1>英単語帳</h1>
        <p className="home-summary-count">
          習得 {totalMastered} / {totalWords} 語
        </p>
        <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {lastLevel && (
        <button type="button" className="btn btn-primary btn-continue" onClick={() => onOpenLevel(lastLevel.level.id)}>
          ▶ 続きから {lastLevel.level.title}
        </button>
      )}

      <ul className="level-list">
        {levelStats.map(({ level, total, mastered }) => {
          const levelPercent = total === 0 ? 0 : Math.round((mastered / total) * 100)
          const complete = mastered === total
          return (
            <li key={level.id}>
              <button type="button" className="level-card" onClick={() => onOpenLevel(level.id)}>
                <div className="level-card-header">
                  <span className="level-card-title">
                    {level.title} {complete && <span aria-label="達成済み">✓</span>}
                  </span>
                  <span className="level-card-subtitle">{level.subtitle}</span>
                </div>
                <p className="level-card-description">{level.description}</p>
                <div
                  className="progress-bar"
                  role="progressbar"
                  aria-valuenow={levelPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="progress-bar-fill" style={{ width: `${levelPercent}%` }} />
                </div>
                <p className="level-card-count">
                  {mastered} / {total}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
