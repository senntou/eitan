import type { Word } from './words'

export const PHASE_SIZE = 10

export type Phase = {
  /** レベル内でのフェーズ番号(0始まり) */
  index: number
  /** 表示ラベル。例: "1-10" */
  label: string
  words: Word[]
}

/** レベル内の単語を order 順に PHASE_SIZE 語ずつのフェーズへ分割する */
export function phasesForWords(levelWords: Word[]): Phase[] {
  const sorted = [...levelWords].sort((a, b) => a.order - b.order)
  const phases: Phase[] = []
  for (let i = 0; i < sorted.length; i += PHASE_SIZE) {
    const chunk = sorted.slice(i, i + PHASE_SIZE)
    const start = chunk[0]?.order ?? i + 1
    const end = chunk[chunk.length - 1]?.order ?? i + chunk.length
    phases.push({ index: i / PHASE_SIZE, label: `${start}-${end}`, words: chunk })
  }
  return phases
}
