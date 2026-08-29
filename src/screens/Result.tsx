import type { Word } from '../data/words'
import type { SessionResult } from './Study'

type Props = {
  levelLabel: string
  words: Word[]
  results: SessionResult
  onRepeatWrong: (words: Word[]) => void
  onBackToLevel: () => void
}

export function Result({ levelLabel, words: sessionWords, results, onRepeatWrong, onBackToLevel }: Props) {
  const total = sessionWords.length
  const wrongWords = sessionWords.filter((w) => results[w.id] === 'unknown')
  const knownCount = total - wrongWords.length
  const percent = total === 0 ? 0 : Math.round((knownCount / total) * 100)

  return (
    <div className="result-screen">
      <h1>
        {levelLabel} {total}問 おつかれさま
      </h1>

      <p className="result-score">
        わかった {knownCount} / {total} <span className="result-percent">{percent}%</span>
      </p>
      <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      {wrongWords.length > 0 && (
        <div className="result-wrong-list">
          <p className="result-wrong-heading">わからなかった単語 ({wrongWords.length})</p>
          <ul>
            {wrongWords.map((w) => (
              <li key={w.id}>
                <span className="result-wrong-word">{w.word}</span>
                <span className="result-wrong-meaning">{w.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="result-actions">
        {wrongWords.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={() => onRepeatWrong(wrongWords)}>
            間違えた{wrongWords.length}語をもう一周
          </button>
        )}
        <button type="button" className="btn" onClick={onBackToLevel}>
          レベルに戻る
        </button>
      </div>
    </div>
  )
}
