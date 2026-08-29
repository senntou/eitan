import { useState } from 'react'
import type { Word } from '../data/words'
import type { Direction } from './StudySettings'

type Props = {
  word: Word
  direction: Direction
  isStarred: boolean
  onToggleStar: (id: number) => void
  onNext: () => void
  index: number
  total: number
}

export function StudyCard({ word, direction, isStarred, onToggleStar, onNext, index, total }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const front = direction === 'word-to-meaning' ? word.word : word.meaning
  const back = direction === 'word-to-meaning' ? word.meaning : word.word
  const hasDetail = Boolean(word.example || word.note)

  const handleNext = () => {
    setRevealed(false)
    setShowDetail(false)
    onNext()
  }

  return (
    <div className="study-card">
      <p className="study-progress">
        {index + 1} / {total}
      </p>
      <div className="card">
        <p className="card-front">{front}</p>
        {revealed && <p className="card-back">{back}</p>}
        {revealed && showDetail && (
          <div className="card-detail">
            {word.example && <p className="card-example">{word.example}</p>}
            {word.note && <p className="card-note">{word.note}</p>}
          </div>
        )}
      </div>
      <div className="study-actions">
        {!revealed ? (
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
            答えを見る
          </button>
        ) : (
          <>
            {hasDetail && (
              <button type="button" className="btn" onClick={() => setShowDetail((s) => !s)}>
                {showDetail ? '例文・解説を隠す' : '例文・解説を見る'}
              </button>
            )}
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
