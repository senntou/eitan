import { useMemo, useState } from 'react'
import { CATEGORIES, type CategoryId } from '../data/categories'
import type { Word } from '../data/words'
import { shuffle } from '../utils/shuffle'

export type Direction = 'word-to-meaning' | 'meaning-to-word'
type SourceFilter = 'all' | 'starred'
type OrderMode = 'sequential' | 'random'

type Props = {
  phaseWords: Word[]
  starredIds: Set<number>
  onStart: (words: Word[], direction: Direction) => void
}

export function StudySettings({ phaseWords, starredIds, onStart }: Props) {
  const [category, setCategory] = useState<'all' | CategoryId>('all')
  const [source, setSource] = useState<SourceFilter>('all')
  const [order, setOrder] = useState<OrderMode>('sequential')
  const [direction, setDirection] = useState<Direction>('word-to-meaning')

  const filtered = useMemo(
    () =>
      phaseWords
        .filter((w) => category === 'all' || w.category === category)
        .filter((w) => source === 'all' || starredIds.has(w.id)),
    [phaseWords, category, source, starredIds],
  )

  const handleStart = () => {
    if (filtered.length === 0) return
    onStart(order === 'random' ? shuffle(filtered) : filtered, direction)
  }

  return (
    <div className="study-settings">
      <div className="setting-group">
        <span className="setting-label">カテゴリ</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as 'all' | CategoryId)}>
          <option value="all">すべて</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <span className="setting-label">出題範囲</span>
        <div className="radio-row">
          <label>
            <input
              type="radio"
              checked={source === 'all'}
              onChange={() => setSource('all')}
            />
            すべて
          </label>
          <label>
            <input
              type="radio"
              checked={source === 'starred'}
              onChange={() => setSource('starred')}
            />
            復習リストのみ
          </label>
        </div>
      </div>

      <div className="setting-group">
        <span className="setting-label">出題順</span>
        <div className="radio-row">
          <label>
            <input
              type="radio"
              checked={order === 'sequential'}
              onChange={() => setOrder('sequential')}
            />
            順番通り
          </label>
          <label>
            <input
              type="radio"
              checked={order === 'random'}
              onChange={() => setOrder('random')}
            />
            ランダム
          </label>
        </div>
      </div>

      <div className="setting-group">
        <span className="setting-label">出題モード</span>
        <div className="radio-row">
          <label>
            <input
              type="radio"
              checked={direction === 'word-to-meaning'}
              onChange={() => setDirection('word-to-meaning')}
            />
            英単語 → 意味
          </label>
          <label>
            <input
              type="radio"
              checked={direction === 'meaning-to-word'}
              onChange={() => setDirection('meaning-to-word')}
            />
            意味 → 英単語
          </label>
        </div>
      </div>

      <p className="setting-count">対象: {filtered.length} 語</p>

      <button type="button" className="btn btn-primary" disabled={filtered.length === 0} onClick={handleStart}>
        学習開始
      </button>
    </div>
  )
}
