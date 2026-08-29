import { useMemo, useState } from 'react'
import { TAGS } from '../data/tags'
import type { Word } from '../data/words'
import { useProgress } from '../storage/ProgressContext'
import type { QuestionCount, ScopeFilter, StudySettings } from '../storage/settings'
import { shuffle } from '../utils/shuffle'
import { SegmentedControl } from './ui/SegmentedControl'
import { ToggleChips } from './ui/ToggleChips'

type Props = {
  levelWords: Word[]
  settings: StudySettings
  onChange: (settings: StudySettings) => void
  onStart: (words: Word[]) => void
}

const COUNT_OPTIONS: { value: string; label: string }[] = [
  { value: '10', label: '10問' },
  { value: '20', label: '20問' },
  { value: '50', label: '50問' },
  { value: 'all', label: '全部' },
]

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'unseen', label: '未習得のみ' },
  { value: 'learning', label: 'あやふやのみ' },
  { value: 'starred', label: '☆のみ' },
]

const ORDER_OPTIONS = [
  { value: 'sequential' as const, label: '順番通り' },
  { value: 'random' as const, label: 'ランダム' },
]

const DIRECTION_OPTIONS = [
  { value: 'word-to-meaning' as const, label: '英→日' },
  { value: 'meaning-to-word' as const, label: '日→英' },
]

export function StudySettingsPanel({ levelWords, settings, onChange, onStart }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const { getMastery, isStarred } = useProgress()

  const scoped = useMemo(() => {
    return levelWords
      .filter((w) => settings.tags.length === 0 || w.tags.some((t) => settings.tags.includes(t)))
      .filter((w) => {
        if (settings.scope === 'all') return true
        if (settings.scope === 'starred') return isStarred(w.id)
        const mastery = getMastery(w.id)
        if (settings.scope === 'unseen') return mastery === 'unseen'
        return mastery === 'learning'
      })
  }, [levelWords, settings.tags, settings.scope, getMastery, isStarred])

  const targetCount = settings.count === 'all' ? scoped.length : Math.min(settings.count, scoped.length)

  const handleStart = () => {
    if (scoped.length === 0) return
    const source = settings.order === 'random' ? shuffle(scoped) : scoped
    onStart(source.slice(0, targetCount))
  }

  return (
    <div className="study-settings-panel">
      <button type="button" className="btn btn-primary btn-large" disabled={scoped.length === 0} onClick={handleStart}>
        学習をはじめる
      </button>
      <p className="settings-summary">
        {settings.count === 'all' ? '全部' : `${settings.count}問`} /{' '}
        {settings.order === 'random' ? 'ランダム' : '順番通り'} /{' '}
        {settings.direction === 'word-to-meaning' ? '英→日' : '日→英'}
      </p>
      {scoped.length === 0 && <p className="settings-empty">条件に合う単語がありません。</p>}

      <button type="button" className="btn-text btn-advanced-toggle" onClick={() => setAdvancedOpen((v) => !v)}>
        {advancedOpen ? '▾ 詳細設定を閉じる' : '▸ 詳細設定'}
      </button>

      {advancedOpen && (
        <div className="advanced-settings">
          <div className="setting-group">
            <span className="setting-label">出題数</span>
            <SegmentedControl
              label="出題数"
              value={String(settings.count)}
              onChange={(v) => onChange({ ...settings, count: (v === 'all' ? 'all' : Number(v)) as QuestionCount })}
              options={COUNT_OPTIONS}
            />
          </div>
          <div className="setting-group">
            <span className="setting-label">出題範囲</span>
            <SegmentedControl
              label="出題範囲"
              value={settings.scope}
              onChange={(v) => onChange({ ...settings, scope: v })}
              options={SCOPE_OPTIONS}
            />
          </div>
          <div className="setting-group">
            <span className="setting-label">出題順</span>
            <SegmentedControl
              label="出題順"
              value={settings.order}
              onChange={(v) => onChange({ ...settings, order: v })}
              options={ORDER_OPTIONS}
            />
          </div>
          <div className="setting-group">
            <span className="setting-label">出題モード</span>
            <SegmentedControl
              label="出題モード"
              value={settings.direction}
              onChange={(v) => onChange({ ...settings, direction: v })}
              options={DIRECTION_OPTIONS}
            />
          </div>
          <div className="setting-group">
            <span className="setting-label">タグ絞り込み</span>
            <ToggleChips
              label="タグ絞り込み"
              selected={settings.tags}
              onChange={(tags) => onChange({ ...settings, tags })}
              options={TAGS.map((t) => ({ value: t.id, label: t.short }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
