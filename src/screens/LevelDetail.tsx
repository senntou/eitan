import { useMemo, useState } from 'react'
import { PhaseList } from '../components/PhaseList'
import { StudySettingsPanel } from '../components/StudySettingsPanel'
import { levelById } from '../data/levels'
import { words, type Word } from '../data/words'
import { useProgress } from '../storage/ProgressContext'
import type { StudySettings } from '../storage/settings'

type Props = {
  levelId: number
  settings: StudySettings
  onChangeSettings: (settings: StudySettings) => void
  onStart: (words: Word[]) => void
  onStartPhase: (phaseIndex: number, label: string, words: Word[], countMode: 'limited' | 'all') => void
  onBack: () => void
}

export function LevelDetail({ levelId, settings, onChangeSettings, onStart, onStartPhase, onBack }: Props) {
  const level = levelById(levelId)
  const { getMastery } = useProgress()
  const [wholeLevelOpen, setWholeLevelOpen] = useState(false)

  const levelWords = useMemo(() => words.filter((w) => w.level === levelId), [levelId])
  const counts = useMemo(() => {
    let mastered = 0
    let learning = 0
    let unseen = 0
    for (const w of levelWords) {
      const m = getMastery(w.id)
      if (m === 'mastered') mastered++
      else if (m === 'learning') learning++
      else unseen++
    }
    return { mastered, learning, unseen }
  }, [levelWords, getMastery])

  if (!level) return null

  return (
    <div className="level-detail">
      <button type="button" className="btn-text btn-back" onClick={onBack}>
        ← ホームに戻る
      </button>
      <h1>
        {level.title} {level.subtitle}
      </h1>
      <p className="level-detail-counts">
        習得 {counts.mastered} / {levelWords.length} &nbsp; あやふや {counts.learning} &nbsp; 未学習 {counts.unseen}
      </p>

      <PhaseList levelId={levelId} levelWords={levelWords} order={settings.order} onStart={onStartPhase} />

      <button type="button" className="btn-text btn-advanced-toggle" onClick={() => setWholeLevelOpen((v) => !v)}>
        {wholeLevelOpen ? '▾ レベル全体からまとめて出題を閉じる' : '▸ レベル全体からまとめて出題'}
      </button>

      {wholeLevelOpen && (
        <StudySettingsPanel levelWords={levelWords} settings={settings} onChange={onChangeSettings} onStart={onStart} />
      )}
    </div>
  )
}
