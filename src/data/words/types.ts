import type { TagId } from '../tags'

export type PartOfSpeech = 'v' | 'n' | 'adj' | 'adv' | 'prep' | 'phrase'

export type Word = {
  /** 全体で一意・不変。既存 ID は絶対に振り直さない(localStorageの進捗が壊れるため) */
  id: number
  word: string
  /** 主要な訳。多くても2つまで、読点区切り */
  meaning: string
  pos: PartOfSpeech
  /** 1..N。難易度順のレベル */
  level: number
  /** レベル内の並び順 1..100 */
  order: number
  /** ジャンルタグ。複数可。フィルタと一覧表示にのみ使う */
  tags: TagId[]
  example: string
  /** example の和訳 */
  exampleJa: string
  /** 語法・コロケーション・引っかけポイントなど */
  note?: string
}
