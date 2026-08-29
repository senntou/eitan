import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadPhaseProgress, phaseKey, savePhaseProgress, type PhaseProgressStore, type PhaseStat } from './phaseProgress'

type PhaseProgressContextValue = {
  getPhaseStat: (levelId: number, phaseIndex: number) => PhaseStat | undefined
  recordPhaseCompletion: (levelId: number, phaseIndex: number, accuracy: number) => void
}

const PhaseProgressContext = createContext<PhaseProgressContextValue | null>(null)

export function PhaseProgressProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<PhaseProgressStore>(() => loadPhaseProgress())

  const recordPhaseCompletion = useCallback((levelId: number, phaseIndex: number, accuracy: number) => {
    setStore((prev) => {
      const key = phaseKey(levelId, phaseIndex)
      const prevStat = prev.phases[key]
      const next: PhaseProgressStore = {
        ...prev,
        phases: {
          ...prev.phases,
          [key]: { laps: (prevStat?.laps ?? 0) + 1, lastAccuracy: accuracy, lastAt: Date.now() },
        },
      }
      savePhaseProgress(next)
      return next
    })
  }, [])

  const value = useMemo<PhaseProgressContextValue>(
    () => ({
      getPhaseStat: (levelId, phaseIndex) => store.phases[phaseKey(levelId, phaseIndex)],
      recordPhaseCompletion,
    }),
    [store, recordPhaseCompletion],
  )

  return <PhaseProgressContext.Provider value={value}>{children}</PhaseProgressContext.Provider>
}

export function usePhaseProgress(): PhaseProgressContextValue {
  const ctx = useContext(PhaseProgressContext)
  if (!ctx) throw new Error('usePhaseProgress must be used within a PhaseProgressProvider')
  return ctx
}
