import { useState } from 'react'
import { CATEGORIES, categoryLabel, type CategoryId } from '../data/categories'
import type { Word } from '../data/words'

type Props = {
  words: Word[]
  starredIds: Set<number>
  onToggleStar: (id: number) => void
}

export function WordList({ words, starredIds, onToggleStar }: Props) {
  const [onlyStarred, setOnlyStarred] = useState(false)
  const [category, setCategory] = useState<'all' | CategoryId>('all')

  const visibleWords = words
    .filter((w) => category === 'all' || w.category === category)
    .filter((w) => !onlyStarred || starredIds.has(w.id))

  return (
    <div className="word-list">
      <div className="list-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value as 'all' | CategoryId)}>
          <option value="all">すべてのカテゴリ</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={onlyStarred}
            onChange={(e) => setOnlyStarred(e.target.checked)}
          />
          復習リストのみ表示
        </label>
      </div>
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
            <span className="word-row-category">{categoryLabel(w.category)}</span>
          </li>
        ))}
      </ul>
      {visibleWords.length === 0 && <p className="empty-message">該当する単語がありません。</p>}
    </div>
  )
}
