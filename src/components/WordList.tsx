import { useMemo, useState } from 'react'
import { LEVELS } from '../data/levels'
import { tagShortLabel } from '../data/tags'
import { words } from '../data/words'
import { useProgress } from '../storage/ProgressContext'

type Props = {
  levelId: number
  onChangeLevel: (levelId: number) => void
}

const POS_LABEL: Record<string, string> = { v: '動', n: '名', adj: '形', adv: '副', prep: '前', phrase: '句' }
const MASTERY_LABEL: Record<string, string> = { unseen: '未学習', learning: 'あやふや', mastered: '習得' }

export function WordList({ levelId, onChangeLevel }: Props) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { getMastery, isStarred, toggleStar } = useProgress()

  const levelWords = useMemo(() => words.filter((w) => w.level === levelId), [levelId])
  const visibleWords = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return levelWords
    return levelWords.filter((w) => w.word.toLowerCase().includes(query) || w.meaning.includes(query))
  }, [levelWords, search])

  return (
    <div className="word-list">
      <div className="list-level-tabs">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`list-level-tab ${level.id === levelId ? 'active' : ''}`}
            onClick={() => onChangeLevel(level.id)}
          >
            {level.title}
          </button>
        ))}
      </div>

      <input
        type="search"
        className="word-search"
        placeholder="単語・意味で検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="単語を検索"
      />

      <ul>
        {visibleWords.map((w) => {
          const mastery = getMastery(w.id)
          const expanded = expandedId === w.id
          return (
            <li key={w.id} className="word-row">
              <button
                type="button"
                className="word-row-main"
                onClick={() => setExpandedId(expanded ? null : w.id)}
                aria-expanded={expanded}
              >
                <span className={`mastery-dot mastery-${mastery}`} aria-label={MASTERY_LABEL[mastery]} />
                <span className="word-row-word">{w.word}</span>
                <span className="word-row-pos">{POS_LABEL[w.pos]}</span>
                <span className="word-row-meaning">{w.meaning}</span>
                <span className="word-row-tags">{w.tags.map(tagShortLabel).join(' / ')}</span>
              </button>
              <button
                type="button"
                className={`btn-star-inline ${isStarred(w.id) ? 'is-starred' : ''}`}
                onClick={() => toggleStar(w.id)}
                aria-pressed={isStarred(w.id)}
                aria-label={isStarred(w.id) ? '復習リストから外す' : '復習リストに追加'}
              >
                {isStarred(w.id) ? '★' : '☆'}
              </button>
              {expanded && (
                <div className="word-row-detail">
                  <p className="word-row-example">{w.example}</p>
                  <p className="word-row-example-ja">{w.exampleJa}</p>
                  {w.note && <p className="word-row-note">💡 {w.note}</p>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {visibleWords.length === 0 && <p className="empty-message">該当する単語がありません。</p>}
    </div>
  )
}
