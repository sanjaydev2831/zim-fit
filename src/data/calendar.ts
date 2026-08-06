import type { Session } from './types'
import { formatWeekdayList, trainWeekdaysFromRest } from './equipment'

export type DayAttendance = 'completed' | 'missed' | 'today' | 'upcoming' | 'rested'

/** Local calendar date at midnight */
export function startOfDay(input: Date | string): Date {
  // YYYY-MM-DD must parse as local (not UTC), or the day can shift by timezone
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number)
    return new Date(y!, m! - 1, d!)
  }
  const d = typeof input === 'string' ? new Date(input) : new Date(input)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function diffDays(a: Date, b: Date): number {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Monday of the calendar week containing `input` (local). */
export function mondayOfWeek(input: Date | string): Date {
  const d = startOfDay(input)
  // JS: Sun=0 … Sat=6 → convert so Mon=0 … Sun=6
  const jsDay = d.getDay()
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  return addDays(d, mondayOffset)
}

/** 1 = Monday … 7 = Sunday */
export function weekdayMon1(input: Date | string): number {
  const jsDay = startOfDay(input).getDay()
  return jsDay === 0 ? 7 : jsDay
}

/** YYYY-MM-DD in local time */
export function toDateKey(input: Date | string): string {
  const d = startOfDay(input)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Program weeks are real Mon–Sun calendar weeks.
 * Week 1 = the week containing your start date (Monday → Sunday).
 * Day 1 = Monday … Day 7 = Sunday (so weekend rest stays Sun / Mon).
 */
export function getSessionDate(
  programStart: string | Date,
  week: number,
  day: number,
  _delayDays = 0,
): Date {
  const startMonday = mondayOfWeek(programStart)
  const offset = (week - 1) * 7 + (day - 1)
  return addDays(startMonday, offset)
}

export function getProgramPosition(
  programStart: string | Date,
  today: Date = new Date(),
  _delayDays = 0,
): { week: number; day: number; inProgram: boolean } {
  const startMonday = mondayOfWeek(programStart)
  const todayMonday = mondayOfWeek(today)
  const weekOffset = Math.round(diffDays(todayMonday, startMonday) / 7)
  const week = weekOffset + 1
  const day = weekdayMon1(today)

  if (week < 1) {
    return { week: 1, day: 1, inProgram: false }
  }
  if (week > 12) {
    return { week: 12, day: 7, inProgram: false }
  }

  // Before the user's actual start date inside week 1
  if (startOfDay(today).getTime() < startOfDay(programStart).getTime()) {
    return { week: 1, day, inProgram: false }
  }

  return { week, day, inProgram: true }
}

export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function getAttendance(
  session: Session,
  programStart: string | Date,
  completedIds: string[],
  today: Date = new Date(),
  delayDays = 0,
  restDayKeys: string[] = [],
  incompleteIds: string[] = [],
): DayAttendance {
  const sessionDate = getSessionDate(programStart, session.week, session.day, delayDays)
  const now = startOfDay(today)
  const when = startOfDay(sessionDate)
  const completed = completedIds.includes(session.id)
  const key = toDateKey(sessionDate)

  if (completed) return 'completed'
  // User explicitly marked incomplete (works for today / future / past)
  if (incompleteIds.includes(session.id)) return 'missed'
  if (restDayKeys.includes(key)) return 'rested'

  const isProgramRest = session.dayType === 'rest' || session.dayType === 'active_recovery'

  // Any calendar day before today: incomplete (train) or auto-rested (scheduled rest)
  // Do not treat pre-start / past days as "today" or "upcoming".
  if (when.getTime() < now.getTime()) {
    return isProgramRest ? 'rested' : 'missed'
  }
  if (isSameDay(when, now)) return 'today'
  return 'upcoming'
}

export function attendanceLabel(status: DayAttendance, dayType: string): string {
  switch (status) {
    case 'completed':
      return dayType === 'rest' || dayType === 'active_recovery' ? 'Rest logged' : 'Completed'
    case 'missed':
      return 'Incomplete'
    case 'rested':
      return dayType === 'rest' || dayType === 'active_recovery' ? 'Rest day' : 'Rest logged'
    case 'today':
      return 'Today'
    case 'upcoming':
      return 'Upcoming'
  }
}

/** Human label for the user's chosen rest / train pattern */
export function weeklyRestBlurb(restWeekdays: number[]): string {
  const train = trainWeekdaysFromRest(restWeekdays)
  const rest = [...restWeekdays].sort((a, b) => a - b)
  if (rest.length === 0) return 'Train every day'
  return `Train ${formatWeekdayList(train)} · Rest ${formatWeekdayList(rest)}`
}
