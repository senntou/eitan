import { useState } from 'react'
import type { Word } from '../data/words'

type Props = {
  word: Word
  isStarred: boolean
  onToggleStar: (id: number) => void
  onNext: () => void
  index: number
  total: number
}

export function StudyCard({ word, isStarred, onToggleStar, onNext, index, total }: Props) {
  const [revealed, setRevealed] = useState(false)

  const handleNext = () => {
    setRevealed(false)
    onNext()
  }

  return (
    <div className="study-card">
      <p className="study-progress">
        {index + 1} / {total}
      </p>
      <div className="card">
        <p className="card-word">{word.word}</p>
        {revealed && <p className="card-meaning">{word.meaning}</p>}
      </div>
      <div className="study-actions">
        {!revealed ? (
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
            意味を見る
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`btn btn-star ${isStarred ? 'is-starred' : ''}`}
              onClick={() => onToggleStar(word.id)}
            >
              {isStarred ? '★ 復習リストに登録済み' : '☆ 復習リストに追加'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              次へ
            </button>
          </>
        )}
      </div>
    </div>
  )
}
