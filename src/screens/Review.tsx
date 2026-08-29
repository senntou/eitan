import { useMemo } from 'react'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { words, type Word } from '../data/words'
import { useProgress } from '../storage/ProgressContext'
import type { StudySettings } from '../storage/settings'
import { shuffle } from '../utils/shuffle'

type Props = {
  settings: StudySettings
  onChangeSettings: (settings: StudySettings) => void
  onStart: (words: Word[]) => void
}

const ORDER_OPTIONS = [
  { value: 'sequential' as const, label: '順番通り' },
  { value: 'random' as const, label: 'ランダム' },
]

const DIRECTION_OPTIONS = [
  { value: 'word-to-meaning' as const, label: '英→日' },
  { value: 'meaning-to-word' as const, label: '日→英' },
]

export function Review({ settings, onChangeSettings, onStart }: Props) {
  const { getMastery, isStarred } = useProgress()

  const reviewWords = useMemo(
    () => words.filter((w) => isStarred(w.id) || getMastery(w.id) === 'learning'),
    [getMastery, isStarred],
  )

  const handleStart = () => {
    if (reviewWords.length === 0) return
    const source = settings.order === 'random' ? shuffle(reviewWords) : reviewWords
    onStart(source)
  }

  return (
    <div className="review-screen">
      <h1>復習リスト</h1>
      <p className="review-count">☆と「あやふや」の単語 {reviewWords.length} 語</p>

      {reviewWords.length === 0 ? (
        <p className="empty-message">復習リストは空です。学習中に ☆ を付けるとここに表示されます。</p>
      ) : (
        <>
          <button type="button" className="btn btn-primary btn-large" onClick={handleStart}>
            復習リストを学習する
          </button>

          <div className="setting-group">
            <span className="setting-label">出題順</span>
            <SegmentedControl
              label="出題順"
              value={settings.order}
              onChange={(v) => onChangeSettings({ ...settings, order: v })}
              options={ORDER_OPTIONS}
            />
          </div>
          <div className="setting-group">
            <span className="setting-label">出題モード</span>
            <SegmentedControl
              label="出題モード"
              value={settings.direction}
              onChange={(v) => onChangeSettings({ ...settings, direction: v })}
              options={DIRECTION_OPTIONS}
            />
          </div>

          <ul className="review-list">
            {reviewWords.map((w) => (
              <li key={w.id}>
                <span className="word-row-word">{w.word}</span>
                <span className="word-row-meaning">{w.meaning}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
