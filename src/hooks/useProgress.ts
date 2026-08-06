import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FocusGuideId, FocusGuideProgress } from '../data/focusGuides'
import type { ExperienceLevel, ProgressState, UserProfile } from '../data/types'
import { buildProgram } from '../data/program'

const STORAGE_KEY = 'zim-fit-progress-v4'

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
      localStorage.removeItem('zim-fit-progress-v3')
      localStorage.removeItem('zim-fit-progress-v2')
      localStorage.removeItem('zim-fit-progress-v1')
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

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

  const start = useCallback((profile: Omit<UserProfile, 'startDate'> & { startDate?: string }) => {
    setState((prev) => ({
      profile: {
        ...profile,
        startDate: profile.startDate ?? new Date().toISOString(),
      },
      completedSessionIds: [],
      currentWeek: 1,
      currentDay: 1,
      focusGuides: prev.focusGuides,
    }))
  }, [])

  const completeSession = useCallback((sessionId: string, week: number, day: number) => {
    setState((prev) => {
      const completed = prev.completedSessionIds.includes(sessionId)
        ? prev.completedSessionIds
        : [...prev.completedSessionIds, sessionId]
      let nextWeek = week
      let nextDay = day + 1
      if (nextDay > 7) {
        nextDay = 1
        nextWeek = Math.min(12, week + 1)
      }
      return {
        ...prev,
        completedSessionIds: completed,
        currentWeek: nextWeek,
        currentDay: nextDay,
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
    (guideId: FocusGuideId, sessionId: string, week: number, sessionNum: number, sessionsPerWeek: number, totalWeeks: number) => {
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

  const currentWeekPlan = program.find((w) => w.week === state.currentWeek)
  const currentSession = currentWeekPlan?.sessions.find((s) => s.day === state.currentDay)
  const completedCount = state.completedSessionIds.length

  return {
    state,
    program,
    currentWeekPlan,
    currentSession,
    completedCount,
    start,
    completeSession,
    jumpTo,
    reset,
    setLevel,
    addFocusGuide,
    removeFocusGuide,
    completeFocusSession,
    isFocusComplete,
    isComplete: (id: string) => state.completedSessionIds.includes(id),
  }
}
