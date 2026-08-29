export type HighlightPart = { text: string; match: boolean }

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** example 中の対象語(活用形含む)を語幹一致でハイライト用に分割する */
export function splitHighlight(text: string, word: string): HighlightPart[] {
  const stem = word.slice(0, Math.min(4, word.length))
  if (!stem) return [{ text, match: false }]
  const re = new RegExp(`\\b(${escapeRegExp(stem)}\\w*)`, 'gi')
  const parts: HighlightPart[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > lastIndex) parts.push({ text: text.slice(lastIndex, m.index), match: false })
    parts.push({ text: m[0], match: true })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), match: false })
  return parts
}
