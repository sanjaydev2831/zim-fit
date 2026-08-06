import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FocusGuideId, FocusGuideProgress } from '../data/focusGuides'
import { getAttendance, getProgramPosition } from '../data/calendar'
import type { ExperienceLevel, ProgressState, UserProfile } from '../data/types'
import { buildProgram } from '../data/program'

const STORAGE_KEY = 'zim-fit-progress-v5'

const defaultState: ProgressState = {
  profile: null,
  completedSessionIds: [],
  currentWeek: 1,
  currentDay: 1,
  focusGuides: [],
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      ;['zim-fit-progress-v4', 'zim-fit-progress-v3', 'zim-fit-progress-v2', 'zim-fit-progress-v1'].forEach(
        (k) => localStorage.removeItem(k),
      )
      return defaultState
    }
    const parsed = JSON.parse(raw) as ProgressState
    return {
      ...defaultState,
      ...parsed,
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

  // Refresh "today" if the tab stays open past midnight
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
      ),
    [
      state.profile?.level,
      state.profile?.daysPerWeek,
      state.profile?.availableEquipment,
      state.profile?.sessionDuration,
    ],
  )

  const calendarToday = useMemo(() => new Date(todayTick), [todayTick])

  const todayPosition = useMemo(() => {
    if (!state.profile?.startDate) return { week: 1, day: 1, inProgram: false }
    return getProgramPosition(state.profile.startDate, calendarToday)
  }, [state.profile?.startDate, calendarToday])

  const start = useCallback((profile: Omit<UserProfile, 'startDate'> & { startDate?: string }) => {
    const startDate = profile.startDate ?? new Date().toISOString()
    const pos = getProgramPosition(startDate, new Date())
    setState((prev) => ({
      profile: {
        ...profile,
        startDate,
      },
      completedSessionIds: [],
      currentWeek: pos.week,
      currentDay: pos.day,
      focusGuides: prev.focusGuides,
    }))
  }, [])

  const completeSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const completed = prev.completedSessionIds.includes(sessionId)
        ? prev.completedSessionIds
        : [...prev.completedSessionIds, sessionId]
      const pos = prev.profile?.startDate
        ? getProgramPosition(prev.profile.startDate, new Date())
        : { week: prev.currentWeek, day: prev.currentDay }
      return {
        ...prev,
        completedSessionIds: completed,
        currentWeek: pos.week,
        currentDay: pos.day,
      }
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

  const getDayAttendance = useCallback(
    (session: Parameters<typeof getAttendance>[0]) => {
      if (!state.profile?.startDate) return 'upcoming' as const
      return getAttendance(session, state.profile.startDate, state.completedSessionIds, calendarToday)
    },
    [state.profile?.startDate, state.completedSessionIds, calendarToday],
  )

  return {
    state,
    program,
    currentWeekPlan,
    currentSession,
    completedCount,
    calendarToday,
    todayPosition,
    start,
    completeSession,
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
