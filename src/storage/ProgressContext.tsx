import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadProgress, masteryOf, saveProgress, type Mastery, type ProgressStore, type WordProgress } from './progress'

type ProgressContextValue = {
  getProgress: (id: number) => WordProgress | undefined
  getMastery: (id: number) => Mastery
  isStarred: (id: number) => boolean
  markKnown: (id: number) => void
  markUnknown: (id: number) => void
  toggleStar: (id: number) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function emptyWordProgress(): WordProgress {
  return { seen: 0, known: 0, unknown: 0, streak: 0, lastAt: 0, starred: false }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ProgressStore>(() => loadProgress())

  const update = useCallback((id: number, updater: (prev: WordProgress) => WordProgress) => {
    setStore((prev) => {
      const prevWord = prev.words[id] ?? emptyWordProgress()
      const next: ProgressStore = { ...prev, words: { ...prev.words, [id]: updater(prevWord) } }
      saveProgress(next)
      return next
    })
  }, [])

  const markKnown = useCallback(
    (id: number) => {
      update(id, (p) => ({ ...p, seen: p.seen + 1, known: p.known + 1, streak: p.streak + 1, lastAt: Date.now() }))
    },
    [update],
  )

  const markUnknown = useCallback(
    (id: number) => {
      update(id, (p) => ({
        ...p,
        seen: p.seen + 1,
        unknown: p.unknown + 1,
        streak: 0,
        starred: true,
        lastAt: Date.now(),
      }))
    },
    [update],
  )

  const toggleStar = useCallback(
    (id: number) => {
      update(id, (p) => ({ ...p, starred: !p.starred }))
    },
    [update],
  )

  const value = useMemo<ProgressContextValue>(
    () => ({
      getProgress: (id) => store.words[id],
      getMastery: (id) => masteryOf(store.words[id]),
      isStarred: (id) => store.words[id]?.starred ?? false,
      markKnown,
      markUnknown,
      toggleStar,
    }),
    [store, markKnown, markUnknown, toggleStar],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
