import type { TagId } from '../data/tags'

export type Direction = 'word-to-meaning' | 'meaning-to-word'
export type OrderMode = 'sequential' | 'random'
export type ScopeFilter = 'all' | 'unseen' | 'learning' | 'starred'
export type QuestionCount = 10 | 20 | 50 | 'all'

export type StudySettings = {
  count: QuestionCount
  scope: ScopeFilter
  order: OrderMode
  direction: Direction
  tags: TagId[]
  /** ホーム画面の「続きから」で直行する最後に学習したレベル */
  lastLevelId: number
}

const KEY = 'eitan.settings.v1'

export const defaultSettings: StudySettings = {
  count: 20,
  scope: 'all',
  order: 'random',
  direction: 'word-to-meaning',
  tags: [],
  lastLevelId: 1,
}

export function loadSettings(): StudySettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<StudySettings>) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings: StudySettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // localStorageが利用できない場合は何もしない
  }
}
