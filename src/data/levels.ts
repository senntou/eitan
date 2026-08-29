export type Level = {
  id: number
  title: string
  subtitle: string
  description: string
}

// LEVELS には単語が実在するレベルだけを載せる。空レベルは追加しない。
export const LEVELS: Level[] = [
  { id: 1, title: 'Level 1', subtitle: '基礎 100 語', description: 'TOEIC 500〜600 点帯の頻出語' },
  { id: 2, title: 'Level 2', subtitle: '標準 100 語', description: 'TOEIC 600〜700 点帯の頻出語' },
  { id: 3, title: 'Level 3', subtitle: '応用 100 語', description: 'TOEIC 700〜800 点帯の頻出語' },
  { id: 4, title: 'Level 4', subtitle: '発展 100 語', description: 'TOEIC 800 点超で差がつく語' },
]

export function levelById(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}
