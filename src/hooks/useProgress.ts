import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FocusGuideId, FocusGuideProgress } from '../data/focusGuides'
import { getAttendance, getProgramPosition, startOfDay, toDateKey } from '../data/calendar'
import type { ExperienceLevel, ProgressState, UserProfile } from '../data/types'
import { buildProgram } from '../data/program'
import { defaultRestWeekdays } from '../data/equipment'
import * as api from '../lib/api'
import { isLoggedIn } from '../lib/authStorage'

const STORAGE_KEY = 'zim-fit-progress-v10'

const defaultState: ProgressState = {
  profile: null,
  completedSessionIds: [],
  incompleteSessionIds: [],
  currentWeek: 1,
  currentDay: 1,
  delayDays: 0,
  restDays: [],
  focusGuides: [],
}

function normalize(parsed: ProgressState): ProgressState {
  const profile = parsed.profile
    ? {
        ...parsed.profile,
        restWeekdays:
          parsed.profile.restWeekdays?.length === 7 - parsed.profile.daysPerWeek
            ? parsed.profile.restWeekdays
            : defaultRestWeekdays(parsed.profile.daysPerWeek),
        heightCm: parsed.profile.heightCm ?? 170,
        weightKg: parsed.profile.weightKg ?? 70,
      }
    : null
  return {
    ...defaultState,
    ...parsed,
    profile,
    incompleteSessionIds: parsed.incompleteSessionIds ?? [],
    delayDays: parsed.delayDays ?? 0,
    restDays: parsed.restDays ?? [],
    focusGuides: parsed.focusGuides ?? [],
  }
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      ;[
        'zim-fit-progress-v9',
        'zim-fit-progress-v8',
        'zim-fit-progress-v7',
        'zim-fit-progress-v6',
        'zim-fit-progress-v5',
        'zim-fit-progress-v4',
        'zim-fit-progress-v3',
        'zim-fit-progress-v2',
        'zim-fit-progress-v1',
      ].forEach((k) => localStorage.removeItem(k))
      return defaultState
    }
    return normalize(JSON.parse(raw) as ProgressState)
  } catch {
    return defaultState
  }
}

export type AuthSync = {
  loggedIn: boolean
  authEpoch: number
  apiReady: boolean
}

export function useProgress(auth?: AuthSync) {
  const [state, setState] = useState<ProgressState>(() =>
    typeof window === 'undefined' ? defaultState : load(),
  )
  const [todayTick, setTodayTick] = useState(() => new Date().toDateString())
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const cloud = Boolean(auth?.apiReady && auth.loggedIn && isLoggedIn())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = new Date().toDateString()
      setTodayTick((prev) => (prev === next ? prev : next))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  // Pull cloud progress after login / auth change
  useEffect(() => {
    if (!auth?.apiReady || !auth.loggedIn || !isLoggedIn()) return
    let cancelled = false
    setSyncing(true)
    setSyncError(null)
    api
      .fetchProgress()
      .then((remote) => {
        if (!cancelled) setState(normalize(remote))
      })
      .catch((err) => {
        if (!cancelled) {
          setSyncError(err instanceof Error ? err.message : 'Could not sync progress')
        }
      })
      .finally(() => {
        if (!cancelled) setSyncing(false)
      })
    return () => {
      cancelled = true
    }
  }, [auth?.apiReady, auth?.loggedIn, auth?.authEpoch])

  const applyRemote = useCallback(async (run: () => Promise<ProgressState>) => {
    setSyncError(null)
    try {
      const remote = await run()
      setState(normalize(remote))
      return true
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed')
      return false
    }
  }, [])

  const program = useMemo(
    () =>
      buildProgram(
        state.profile?.level ?? 'beginner',
        state.profile?.daysPerWeek ?? 3,
        state.profile?.availableEquipment ?? [],
        state.profile?.sessionDuration ?? 45,
        state.profile?.restWeekdays ?? defaultRestWeekdays(state.profile?.daysPerWeek ?? 3),
      ),
    [
      state.profile?.level,
      state.profile?.daysPerWeek,
      state.profile?.availableEquipment,
      state.profile?.sessionDuration,
      state.profile?.restWeekdays,
    ],
  )

  const calendarToday = useMemo(() => startOfDay(new Date()), [todayTick])
  const delayDays = state.delayDays ?? 0
  const restDayKeys = useMemo(() => state.restDays.map((r) => r.dateKey), [state.restDays])

  const todayPosition = useMemo(() => {
    if (!state.profile?.startDate) return { week: 1, day: 1, inProgram: false }
    return getProgramPosition(state.profile.startDate, calendarToday, delayDays)
  }, [state.profile?.startDate, calendarToday, delayDays])

  const start = useCallback(
    (profile: Omit<UserProfile, 'startDate'> & { startDate?: string }) => {
      const startDate = profile.startDate ?? toDateKey(new Date())
      const payload = { ...profile, startDate }
      const pos = getProgramPosition(startDate, new Date(), 0)

      if (cloud) {
        void applyRemote(() => api.startOnboarding(payload))
        return
      }

      setState((prev) => ({
        profile: payload,
        completedSessionIds: [],
        incompleteSessionIds: [],
        currentWeek: pos.week,
        currentDay: pos.day,
        delayDays: 0,
        restDays: [],
        focusGuides: prev.focusGuides,
      }))
    },
    [cloud, applyRemote],
  )

  const completeSession = useCallback(
    (sessionId: string) => {
      if (cloud) {
        void applyRemote(() => api.completeSessionRemote(sessionId))
        return
      }
      setState((prev) => {
        const completed = prev.completedSessionIds.includes(sessionId)
          ? prev.completedSessionIds
          : [...prev.completedSessionIds, sessionId]
        const delay = prev.delayDays ?? 0
        const pos = prev.profile?.startDate
          ? getProgramPosition(prev.profile.startDate, new Date(), delay)
          : { week: prev.currentWeek, day: prev.currentDay }
        return {
          ...prev,
          completedSessionIds: completed,
          incompleteSessionIds: (prev.incompleteSessionIds ?? []).filter((id) => id !== sessionId),
          currentWeek: pos.week,
          currentDay: pos.day,
        }
      })
    },
    [cloud, applyRemote],
  )

  const markSessionIncomplete = useCallback(
    (sessionId: string) => {
      if (cloud) {
        void applyRemote(() => api.markIncompleteRemote(sessionId))
        return
      }
      setState((prev) => {
        const incomplete = prev.incompleteSessionIds ?? []
        return {
          ...prev,
          completedSessionIds: prev.completedSessionIds.filter((id) => id !== sessionId),
          incompleteSessionIds: incomplete.includes(sessionId)
            ? incomplete
            : [...incomplete, sessionId],
        }
      })
    },
    [cloud, applyRemote],
  )

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      if (cloud) {
        void applyRemote(() => api.patchProfile(patch))
        return
      }
      setState((prev) => {
        if (!prev.profile) return prev
        const next = { ...prev.profile, ...patch }
        if (
          patch.daysPerWeek &&
          (!patch.restWeekdays || patch.restWeekdays.length !== 7 - patch.daysPerWeek)
        ) {
          next.restWeekdays = defaultRestWeekdays(patch.daysPerWeek)
        }
        return { ...prev, profile: next }
      })
    },
    [cloud, applyRemote],
  )

  const jumpTo = useCallback(
    (week: number, day: number) => {
      const w = Math.min(12, Math.max(1, week))
      const d = Math.min(7, Math.max(1, day))
      if (cloud) {
        void applyRemote(() => api.jumpToRemote(w, d))
        return
      }
      setState((prev) => ({ ...prev, currentWeek: w, currentDay: d }))
    },
    [cloud, applyRemote],
  )

  const reset = useCallback(() => {
    if (cloud) {
      void applyRemote(() => api.resetProgressRemote())
      return
    }
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }, [cloud, applyRemote])

  const setLevel = useCallback(
    (level: ExperienceLevel) => {
      updateProfile({ level })
    },
    [updateProfile],
  )

  const addFocusGuide = useCallback(
    (guideId: FocusGuideId) => {
      if (cloud) {
        void applyRemote(() => api.addFocusGuideRemote(guideId))
        return
      }
      setState((prev) => {
        if (prev.focusGuides.some((g) => g.guideId === guideId)) return prev
        const entry: FocusGuideProgress = {
          guideId,
          addedAt: new Date().toISOString(),
          completedSessionIds: [],
          currentWeek: 1,
          currentSession: 1,
        }
        return { ...prev, focusGuides: [...prev.focusGuides, entry] }
      })
    },
    [cloud, applyRemote],
  )

  const removeFocusGuide = useCallback(
    (guideId: FocusGuideId) => {
      if (cloud) {
        void applyRemote(() => api.removeFocusGuideRemote(guideId))
        return
      }
      setState((prev) => ({
        ...prev,
        focusGuides: prev.focusGuides.filter((g) => g.guideId !== guideId),
      }))
    },
    [cloud, applyRemote],
  )

  const completeFocusSession = useCallback(
    (
      guideId: FocusGuideId,
      sessionId: string,
      week: number,
      sessionNum: number,
      sessionsPerWeek: number,
      totalWeeks: number,
    ) => {
      if (cloud) {
        void applyRemote(() =>
          api.completeFocusSessionRemote(guideId, {
            sessionId,
            week,
            sessionNum,
            sessionsPerWeek,
            totalWeeks,
          }),
        )
        return
      }
      setState((prev) => ({
        ...prev,
        focusGuides: prev.focusGuides.map((g) => {
          if (g.guideId !== guideId) return g
          const completed = g.completedSessionIds.includes(sessionId)
            ? g.completedSessionIds
            : [...g.completedSessionIds, sessionId]
          let nextWeek = week
          let nextSession = sessionNum + 1
          if (nextSession > sessionsPerWeek) {
            nextSession = 1
            nextWeek = Math.min(totalWeeks, week + 1)
          }
          return {
            ...g,
            completedSessionIds: completed,
            currentWeek: nextWeek,
            currentSession: nextSession,
          }
        }),
      }))
    },
    [cloud, applyRemote],
  )

  const isFocusComplete = useCallback(
    (guideId: FocusGuideId, sessionId: string) => {
      const g = state.focusGuides.find((x) => x.guideId === guideId)
      return Boolean(g?.completedSessionIds.includes(sessionId))
    },
    [state.focusGuides],
  )

  const currentWeekPlan = program.find((w) => w.week === todayPosition.week)
  const currentSession = currentWeekPlan?.sessions.find((s) => s.day === todayPosition.day)
  const completedCount = state.completedSessionIds.length
  const incompleteIds = state.incompleteSessionIds ?? []

  const getDayAttendance = useCallback(
    (session: Parameters<typeof getAttendance>[0]) => {
      if (!state.profile?.startDate) return 'upcoming' as const
      return getAttendance(
        session,
        state.profile.startDate,
        state.completedSessionIds,
        calendarToday,
        delayDays,
        restDayKeys,
        incompleteIds,
      )
    },
    [
      state.profile?.startDate,
      state.completedSessionIds,
      calendarToday,
      delayDays,
      restDayKeys,
      incompleteIds,
    ],
  )

  return {
    state,
    program,
    currentWeekPlan,
    currentSession,
    completedCount,
    calendarToday,
    todayPosition,
    delayDays,
    syncing,
    syncError,
    cloudEnabled: cloud,
    start,
    completeSession,
    markSessionIncomplete,
    updateProfile,
    jumpTo,
    reset,
    setLevel,
    addFocusGuide,
    removeFocusGuide,
    completeFocusSession,
    isFocusComplete,
    getDayAttendance,
    isComplete: (id: string) => state.completedSessionIds.includes(id),
  }
}
