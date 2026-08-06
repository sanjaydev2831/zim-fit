import type { Session } from './types'

export type DayAttendance = 'completed' | 'missed' | 'today' | 'upcoming'

/** Local calendar date at midnight */
export function startOfDay(input: Date | string): Date {
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

/** Week 1 Day 1 = program start date; then consecutive calendar days */
export function getSessionDate(programStart: string | Date, week: number, day: number): Date {
  const start = startOfDay(programStart)
  const offset = (week - 1) * 7 + (day - 1)
  return addDays(start, offset)
}

export function getProgramPosition(
  programStart: string | Date,
  today: Date = new Date(),
): { week: number; day: number; inProgram: boolean } {
  const start = startOfDay(programStart)
  const now = startOfDay(today)
  const offset = diffDays(now, start)

  if (offset < 0) {
    return { week: 1, day: 1, inProgram: false }
  }

  const totalDays = 12 * 7
  if (offset >= totalDays) {
    return { week: 12, day: 7, inProgram: false }
  }

  const week = Math.floor(offset / 7) + 1
  const day = (offset % 7) + 1
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
): DayAttendance {
  const sessionDate = getSessionDate(programStart, session.week, session.day)
  const now = startOfDay(today)
  const when = startOfDay(sessionDate)
  const completed = completedIds.includes(session.id)

  if (completed) return 'completed'
  if (isSameDay(when, now)) return 'today'
  if (when.getTime() < now.getTime()) return 'missed'
  return 'upcoming'
}

export function attendanceLabel(status: DayAttendance, dayType: string): string {
  switch (status) {
    case 'completed':
      return dayType === 'rest' ? 'Rest logged' : 'Completed'
    case 'missed':
      return dayType === 'rest' ? 'Missed (not logged)' : 'Missed — not attended'
    case 'today':
      return 'Today'
    case 'upcoming':
      return 'Upcoming'
  }
}
