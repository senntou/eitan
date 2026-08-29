import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadPhaseProgress, phaseKey, savePhaseProgress } from './phaseProgress'

describe('phaseKey', () => {
  it('combines levelId and phaseIndex', () => {
    expect(phaseKey(2, 3)).toBe('2-3')
  })
})

describe('loadPhaseProgress / savePhaseProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns an empty store when nothing is saved', () => {
    expect(loadPhaseProgress()).toEqual({ version: 1, phases: {} })
  })

  it('round-trips a saved store', () => {
    const store = { version: 1 as const, phases: { '1-0': { laps: 2, lastAccuracy: 80, lastAt: 123 } } }
    savePhaseProgress(store)
    expect(loadPhaseProgress()).toEqual(store)
  })

  it('does not throw when localStorage.getItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => loadPhaseProgress()).not.toThrow()
    expect(loadPhaseProgress()).toEqual({ version: 1, phases: {} })
    spy.mockRestore()
  })

  it('does not throw when localStorage.setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => savePhaseProgress({ version: 1, phases: {} })).not.toThrow()
    spy.mockRestore()
  })
})
