import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FocusGuideId, FocusGuideProgress } from '../data/focusGuides'
import { getAttendance, getProgramPosition, startOfDay, toDateKey } from '../data/calendar'
import type { ExperienceLevel, ProgressState, UserProfile } from '../data/types'
import { buildProgram } from '../data/program'
import { defaultRestWeekdays } from '../data/equipment'

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
    const parsed = JSON.parse(raw) as ProgressState
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
  } catch {
    return defaultState
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() =>
    typeof window === 'undefined' ? defaultState : load(),
  )
  const [todayTick, setTodayTick] = useState(() => new Date().toDateString())

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

  // Use local midnight for "today" — avoid parsing toDateString() which can drift
  const calendarToday = useMemo(() => startOfDay(new Date()), [todayTick])
  const delayDays = state.delayDays ?? 0
  const restDayKeys = useMemo(() => state.restDays.map((r) => r.dateKey), [state.restDays])

  const todayPosition = useMemo(() => {
    if (!state.profile?.startDate) return { week: 1, day: 1, inProgram: false }
    return getProgramPosition(state.profile.startDate, calendarToday, delayDays)
  }, [state.profile?.startDate, calendarToday, delayDays])

  const start = useCallback((profile: Omit<UserProfile, 'startDate'> & { startDate?: string }) => {
    // Store local calendar date (YYYY-MM-DD) so timezone does not shift the start day
    const startDate = profile.startDate ?? toDateKey(new Date())
    const pos = getProgramPosition(startDate, new Date(), 0)
    setState((prev) => ({
      profile: {
        ...profile,
        startDate,
      },
      completedSessionIds: [],
      incompleteSessionIds: [],
      currentWeek: pos.week,
      currentDay: pos.day,
      delayDays: 0,
      restDays: [],
      focusGuides: prev.focusGuides,
    }))
  }, [])

  const completeSession = useCallback((sessionId: string) => {
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
  }, [])

  /** Mark session incomplete — clears completion and flags it as incomplete */
  const markSessionIncomplete = useCallback((sessionId: string) => {
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
  }, [])

  /** Update profile fields without wiping completed sessions */
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev.profile) return prev
      const next = { ...prev.profile, ...patch }
      if (patch.daysPerWeek && (!patch.restWeekdays || patch.restWeekdays.length !== 7 - patch.daysPerWeek)) {
        next.restWeekdays = defaultRestWeekdays(patch.daysPerWeek)
      }
      return { ...prev, profile: next }
    })
  }, [])

  const jumpTo = useCallback((week: number, day: number) => {
    setState((prev) => ({
      ...prev,
      currentWeek: Math.min(12, Math.max(1, week)),
      currentDay: Math.min(7, Math.max(1, day)),
    }))
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }, [])

  const setLevel = useCallback((level: ExperienceLevel) => {
    setState((prev) =>
      prev.profile ? { ...prev, profile: { ...prev.profile, level } } : prev,
    )
  }, [])

  const addFocusGuide = useCallback((guideId: FocusGuideId) => {
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
  }, [])

  const removeFocusGuide = useCallback((guideId: FocusGuideId) => {
    setState((prev) => ({
      ...prev,
      focusGuides: prev.focusGuides.filter((g) => g.guideId !== guideId),
    }))
  }, [])

  const completeFocusSession = useCallback(
    (
      guideId: FocusGuideId,
      sessionId: string,
      week: number,
      sessionNum: number,
      sessionsPerWeek: number,
      totalWeeks: number,
    ) => {
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
    [],
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
