import { useState } from 'react'
import type { Word } from '../data/words'

type Props = {
  words: Word[]
  starredIds: Set<number>
  onToggleStar: (id: number) => void
}

export function WordList({ words, starredIds, onToggleStar }: Props) {
  const [onlyStarred, setOnlyStarred] = useState(false)

  const visibleWords = onlyStarred ? words.filter((w) => starredIds.has(w.id)) : words

  return (
    <div className="word-list">
      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={onlyStarred}
          onChange={(e) => setOnlyStarred(e.target.checked)}
        />
        復習リストのみ表示
      </label>
      <ul>
        {visibleWords.map((w) => (
          <li key={w.id} className="word-row">
            <button
              type="button"
              className={`btn-star-inline ${starredIds.has(w.id) ? 'is-starred' : ''}`}
              onClick={() => onToggleStar(w.id)}
              aria-label="復習リストに登録"
            >
              {starredIds.has(w.id) ? '★' : '☆'}
            </button>
            <span className="word-row-word">{w.word}</span>
            <span className="word-row-meaning">{w.meaning}</span>
          </li>
        ))}
      </ul>
      {visibleWords.length === 0 && <p className="empty-message">該当する単語がありません。</p>}
    </div>
  )
}
