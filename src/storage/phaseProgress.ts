export type PhaseStat = {
  /** そのフェーズを最後まで(全部モードで)やり切った回数 */
  laps: number
  /** 直前に完走した時の正答率 (0-100) */
  lastAccuracy: number
  /** 最終完走時刻 (epoch ms) */
  lastAt: number
}

export type PhaseProgressStore = {
  version: 1
  phases: Record<string, PhaseStat>
}

const KEY = 'eitan.phaseProgress.v1'

function emptyStore(): PhaseProgressStore {
  return { version: 1, phases: {} }
}

export function phaseKey(levelId: number, phaseIndex: number): string {
  return `${levelId}-${phaseIndex}`
}

export function loadPhaseProgress(): PhaseProgressStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as PhaseProgressStore
    return emptyStore()
  } catch {
    return emptyStore()
  }
}

export function savePhaseProgress(store: PhaseProgressStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // localStorageが利用できない場合(プライベートブラウジング等)は何もしない
  }
}
