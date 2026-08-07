import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Exercise } from '../data/types'
import type { FocusGuideId, FocusGuideInfo } from '../data/focusGuides'
import { fetchCatalog, getApiUrl, isApiConfigured, type CatalogBundle } from '../lib/api'

type CatalogContextValue = {
  ready: boolean
  error: string | null
  version: number
  equipment: CatalogBundle['equipment']
  selectableEquipment: CatalogBundle['equipment']
  exercises: Record<string, Exercise>
  focusGuides: FocusGuideInfo[]
  safety: CatalogBundle['safety']
  glossary: CatalogBundle['glossary']
  options: CatalogBundle['options']
  getExercise: (id: string) => Exercise | undefined
  getFocusGuide: (id: FocusGuideId | string) => FocusGuideInfo | undefined
  reload: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<CatalogBundle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isApiConfigured()) {
      setError('VITE_API_URL is not set — cannot load catalog from database')
      return
    }
    let cancelled = false
    setError(null)
    fetchCatalog()
      .then((data) => {
        if (!cancelled) setBundle(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load catalog')
        }
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  const value = useMemo<CatalogContextValue>(() => {
    const equipment = bundle?.equipment ?? []
    const exercises = (bundle?.exercises ?? {}) as Record<string, Exercise>
    const focusGuides = (bundle?.focusGuides ?? []) as FocusGuideInfo[]
    return {
      ready: Boolean(bundle),
      error,
      version: bundle?.version ?? 0,
      equipment,
      selectableEquipment: equipment.filter((e) => !e.alwaysAvailable),
      exercises,
      focusGuides,
      safety: bundle?.safety ?? {
        redFlags: [],
        beforeYouTrain: [],
        limits: [],
        disclaimers: [],
        sources: [],
      },
      glossary: bundle?.glossary ?? {},
      options: bundle?.options ?? {
        daysPerWeek: [],
        sessionDuration: [],
        weekdayShortLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      getExercise: (id) => exercises[id],
      getFocusGuide: (id) => focusGuides.find((g) => g.id === id),
      reload: () => setTick((n) => n + 1),
    }
  }, [bundle, error])

  if (!isApiConfigured()) {
    return (
      <div className="section">
        <div className="container">
          <h1 className="display">API not configured</h1>
          <p className="muted">Set VITE_API_URL to your backend (e.g. https://zym-back.vercel.app).</p>
        </div>
      </div>
    )
  }

  if (error && !bundle) {
    return (
      <div className="section">
        <div className="container">
          <h1 className="display">Catalog unavailable</h1>
          <p className="muted">{error}</p>
          <p className="muted">API: {getApiUrl()}</p>
          <button type="button" className="btn btn-primary" onClick={() => setTick((n) => n + 1)}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="section">
        <div className="container">
          <h1 className="display">ZYM FIT</h1>
          <p className="muted">Loading training catalog from database…</p>
        </div>
      </div>
    )
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
