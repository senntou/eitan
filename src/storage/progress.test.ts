import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadProgress, masteryOf, saveProgress } from './progress'

describe('masteryOf', () => {
  it('returns "unseen" when there is no progress', () => {
    expect(masteryOf(undefined)).toBe('unseen')
  })

  it('returns "unseen" when seen is 0', () => {
    expect(masteryOf({ seen: 0, known: 0, unknown: 0, streak: 0, lastAt: 0, starred: false })).toBe('unseen')
  })

  it('returns "learning" when streak is below 2', () => {
    expect(masteryOf({ seen: 1, known: 1, unknown: 0, streak: 1, lastAt: 0, starred: false })).toBe('learning')
  })

  it('returns "mastered" when streak reaches 2', () => {
    expect(masteryOf({ seen: 2, known: 2, unknown: 0, streak: 2, lastAt: 0, starred: false })).toBe('mastered')
  })
})

describe('loadProgress / saveProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns an empty store when nothing is saved', () => {
    const store = loadProgress()
    expect(store).toEqual({ version: 2, words: {} })
  })

  it('round-trips a saved store', () => {
    const store = {
      version: 2 as const,
      words: { 1: { seen: 3, known: 2, unknown: 1, streak: 1, lastAt: 123, starred: true } },
    }
    saveProgress(store)
    expect(loadProgress()).toEqual(store)
  })

  it('migrates legacy starred word ids into the new store', () => {
    localStorage.setItem('eitan.starredWordIds', JSON.stringify([5, 8]))
    const store = loadProgress()
    expect(store.words[5]?.starred).toBe(true)
    expect(store.words[8]?.starred).toBe(true)
    expect(Object.keys(store.words)).toHaveLength(2)
  })

  it('does not throw when localStorage.getItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => loadProgress()).not.toThrow()
    expect(loadProgress()).toEqual({ version: 2, words: {} })
    spy.mockRestore()
  })

  it('does not throw when localStorage.setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => saveProgress({ version: 2, words: {} })).not.toThrow()
    spy.mockRestore()
  })
})
