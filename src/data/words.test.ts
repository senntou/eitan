import { describe, expect, it } from 'vitest'
import { LEVELS } from './levels'
import { TAGS } from './tags'
import { words } from './words'

describe('words data integrity', () => {
  it('has unique ids', () => {
    const ids = words.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique words (case-insensitive)', () => {
    const names = words.map((w) => w.word.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('has exactly 100 words for every level defined in LEVELS', () => {
    for (const level of LEVELS) {
      const count = words.filter((w) => w.level === level.id).length
      expect(count, `level ${level.id}`).toBe(100)
    }
  })

  it('has a contiguous 1..100 order sequence within each level', () => {
    for (const level of LEVELS) {
      const orders = words
        .filter((w) => w.level === level.id)
        .map((w) => w.order)
        .sort((a, b) => a - b)
      expect(orders, `level ${level.id}`).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    }
  })

  it('has a non-empty example and exampleJa for every word', () => {
    for (const w of words) {
      expect(w.example.trim(), `${w.word} example`).not.toBe('')
      expect(w.exampleJa.trim(), `${w.word} exampleJa`).not.toBe('')
    }
  })

  it('has an example that contains the word (allowing inflected forms)', () => {
    for (const w of words) {
      const stem = w.word.toLowerCase().slice(0, 4)
      expect(w.example.toLowerCase(), `${w.word} example should contain its stem`).toContain(stem)
    }
  })

  it('has at least one valid tag for every word', () => {
    const validTagIds = new Set(TAGS.map((t) => t.id))
    for (const w of words) {
      expect(w.tags.length, `${w.word} tags`).toBeGreaterThan(0)
      for (const tag of w.tags) {
        expect(validTagIds.has(tag), `${w.word} tag "${tag}"`).toBe(true)
      }
    }
  })

  it('has the same level id set in LEVELS and in the word data', () => {
    const levelsInWords = new Set(words.map((w) => w.level))
    const levelIds = new Set(LEVELS.map((l) => l.id))
    expect(levelsInWords).toEqual(levelIds)
  })
})
