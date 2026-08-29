import { useEffect, useState } from 'react'
import type { Word } from '../data/words'
import type { Direction } from '../storage/settings'
import { splitHighlight } from '../utils/highlight'

type AnswerResult = 'known' | 'unknown'

type Props = {
  word: Word
  direction: Direction
  isStarred: boolean
  onToggleStar: (id: number) => void
  onAnswer: (result: AnswerResult) => void
}

export function StudyCard({ word, direction, isStarred, onToggleStar, onAnswer }: Props) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) {
          setRevealed(true)
        } else {
          onAnswer('known')
        }
        return
      }
      if (!revealed) return
      if (e.key === 'ArrowLeft' || e.key === '1') {
        onAnswer('unknown')
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        onAnswer('known')
      } else if (e.key.toLowerCase() === 's') {
        onToggleStar(word.id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [revealed, onAnswer, onToggleStar, word.id])

  const front = direction === 'word-to-meaning' ? word.word : word.meaning
  const back = direction === 'word-to-meaning' ? word.meaning : word.word
  const posLabel = { v: '動', n: '名', adj: '形', adv: '副', prep: '前', phrase: '句' }[word.pos]

  return (
    <div className="card-wrap">
      <div
        className={`card ${revealed ? 'is-revealed' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => !revealed && setRevealed(true)}
      >
        <button
          type="button"
          className={`btn-star-card ${isStarred ? 'is-starred' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar(word.id)
          }}
          aria-pressed={isStarred}
          aria-label={isStarred ? '復習リストから外す' : '復習リストに追加'}
        >
          {isStarred ? '★' : '☆'}
        </button>

        {!revealed ? (
          <>
            <p className="card-front">{front}</p>
            {direction === 'word-to-meaning' && <p className="card-pos">〔{posLabel}〕</p>}
            <p className="card-hint">タップして答えを見る</p>
          </>
        ) : (
          <div className="card-revealed" aria-live="polite">
            <p className="card-front card-front-small">{front}</p>
            <p className="card-back">{back}</p>
            <div className="card-detail">
              <p className="card-example">
                {splitHighlight(word.example, word.word).map((part, i) =>
                  part.match ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
                )}
              </p>
              <p className="card-example-ja">{word.exampleJa}</p>
              {word.note && <p className="card-note">💡 {word.note}</p>}
            </div>
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
            <button type="button" className="btn btn-unknown" onClick={() => onAnswer('unknown')}>
              わからない
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onAnswer('known')}>
              わかった
            </button>
          </>
        )}
      </div>
    </div>
  )
}
