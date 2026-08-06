import type { DaysPerWeek, EquipmentId, SessionDuration } from './equipment'
import type { FocusGuideId, FocusGuideProgress } from './focusGuides'

export type ExperienceLevel = 'beginner' | 'returning' | 'intermediate'

export type DayType = 'train' | 'active_recovery' | 'rest' | 'deload'

export type MuscleFocus =
  | 'full_body'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'mobility'
  | 'cardio'

export interface Exercise {
  id: string
  name: string
  muscle: string
  equipment: string
  /** Any one of these is enough (OR), unless overridden in resolver */
  equipmentIds: EquipmentId[]
  image: string
  cues: string[]
  substitutes: string[]
  /** Prefer these exercise ids when required gear is missing */
  altExerciseIds: string[]
  caution?: string
  /**
   * Suggested working weight by experience (kg — common in Indian gyms).
   * Start at the low end; increase when you hit top reps with clean form.
   */
  suggestedWeight?: {
    beginner: string
    returning: string
    intermediate: string
    tip?: string
  }
}

export interface WorkoutSet {
  exerciseId: string
  sets: number
  reps: string
  restSec: number
  rpe: string
  tempo?: string
  note?: string
}

export interface Session {
  id: string
  week: number
  day: number
  title: string
  dayType: DayType
  focus: MuscleFocus
  durationMin: number
  trainerBrief: string
  warmUp: string[]
  blocks: WorkoutSet[]
  coolDown: string[]
  progressionTip: string
}

export interface WeekPlan {
  week: number
  phase: string
  theme: string
  difficulty: 1 | 2 | 3 | 4 | 5
  volumeNote: string
  intensityNote: string
  focus: string
  sessions: Session[]
}

export interface UserProfile {
  name: string
  level: ExperienceLevel
  goal: 'strength' | 'hypertrophy' | 'general'
  daysPerWeek: DaysPerWeek
  /**
   * Weekdays the user wants off (1=Mon … 7=Sun).
   * Length must be 7 - daysPerWeek; days need not be consecutive.
   */
  restWeekdays: number[]
  sessionDuration: SessionDuration
  availableEquipment: EquipmentId[]
  /** Height in centimetres (for load / BMI context) */
  heightCm: number
  /** Body weight in kilograms (for load suggestions) */
  weightKg: number
  startDate: string
  screened: boolean
  medicalClearanceNeeded: boolean
}

export interface RestDayLog {
  /** Local YYYY-MM-DD */
  dateKey: string
  requestedAt: string
  note?: string
}

export interface ProgressState {
  profile: UserProfile | null
  completedSessionIds: string[]
  /** Sessions the user explicitly marked incomplete (includes today) */
  incompleteSessionIds: string[]
  currentWeek: number
  currentDay: number
  /** Days the schedule was pushed forward after requested rest */
  delayDays: number
  /** Official rest days so they are not counted as missed */
  restDays: RestDayLog[]
  /** Specialty muscle guides the user added */
  focusGuides: FocusGuideProgress[]
}

export type { FocusGuideId, FocusGuideProgress }
