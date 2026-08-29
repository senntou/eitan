export type WordProgress = {
  /** 出題された回数 */
  seen: number
  /** 「わかった」を選んだ累計 */
  known: number
  /** 「わからない」を選んだ累計 */
  unknown: number
  /** 「わかった」の連続回数。「わからない」で 0 にリセット */
  streak: number
  /** 最終回答時刻 (epoch ms) */
  lastAt: number
  /** 手動の ☆ */
  starred: boolean
}

export type ProgressStore = {
  version: 2
  words: Record<number, WordProgress>
}

const KEY = 'eitan.progress.v2'
const LEGACY_KEY = 'eitan.starredWordIds'

export type Mastery = 'unseen' | 'learning' | 'mastered'

export function masteryOf(p: WordProgress | undefined): Mastery {
  if (!p || p.seen === 0) return 'unseen'
  return p.streak >= 2 ? 'mastered' : 'learning'
}

function emptyStore(): ProgressStore {
  return { version: 2, words: {} }
}

function migrateLegacyStarred(): ProgressStore {
  const store = emptyStore()
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return store
    const ids = JSON.parse(raw) as number[]
    for (const id of ids) {
      store.words[id] = { seen: 0, known: 0, unknown: 0, streak: 0, lastAt: 0, starred: true }
    }
  } catch {
    return store
  }
  return store
}

export function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ProgressStore
    return migrateLegacyStarred()
  } catch {
    return emptyStore()
  }
}

export function saveProgress(store: ProgressStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // localStorageが利用できない場合(プライベートブラウジング等)は何もしない
  }
}
