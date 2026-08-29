import { level1Words } from './level1'
import { level2Words } from './level2'
import { level3Words } from './level3'
import { level4Words } from './level4'
import type { PartOfSpeech, Word } from './types'

export type { PartOfSpeech, Word }

export const words: Word[] = [...level1Words, ...level2Words, ...level3Words, ...level4Words].sort(
  (a, b) => a.level - b.level || a.order - b.order,
)
