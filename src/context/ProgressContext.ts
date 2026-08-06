import { createContext, useContext } from 'react'
import type { useProgress } from '../hooks/useProgress'

export type ProgressApi = ReturnType<typeof useProgress>

export const ProgressContext = createContext<ProgressApi | null>(null)

export function useProgressContext() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgressContext must be used within ProgressProvider')
  return ctx
}
