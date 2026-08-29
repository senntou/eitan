import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'eitan.starredWordIds'

function loadStarredIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

export function useStarredWords() {
  const [starredIds, setStarredIds] = useState<Set<number>>(() => loadStarredIds())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...starredIds]))
  }, [starredIds])

  const toggleStar = useCallback((id: number) => {
    setStarredIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return { starredIds, toggleStar }
}
