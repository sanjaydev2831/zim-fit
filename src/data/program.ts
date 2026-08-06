import type { DaysPerWeek, EquipmentId, SessionDuration } from './equipment'
import { exerciseCountForDuration } from './equipment'
import { resolveExerciseId } from './exercises'
import type { ExperienceLevel, Session, WeekPlan, WorkoutSet } from './types'

export type { DaysPerWeek, SessionDuration }

function block(
  exerciseId: string,
  sets: number,
  reps: string,
  restSec: number,
  rpe: string,
  extra?: Partial<WorkoutSet>,
): WorkoutSet {
  return { exerciseId, sets, reps, restSec, rpe, ...extra }
}

function adaptBlocks(blocks: WorkoutSet[], available: EquipmentId[]): WorkoutSet[] {
  return blocks.map((b) => {
    const resolved = resolveExerciseId(b.exerciseId, available)
    if (resolved === b.exerciseId) return b
    return {
      ...b,
      exerciseId: resolved,
      note: [b.note, `Swapped → ${resolved.replace(/_/g, ' ')}`].filter(Boolean).join(' · '),
    }
  })
}

function fitDuration(blocks: WorkoutSet[], duration: SessionDuration): WorkoutSet[] {
  return blocks.slice(0, exerciseCountForDuration(duration))
}

function finalize(
  session: Session,
  available: EquipmentId[],
  duration: SessionDuration,
): Session {
  return {
    ...session,
    durationMin: duration,
    blocks: fitDuration(adaptBlocks(session.blocks, available), duration),
  }
}

function scaleSets(base: number, level: ExperienceLevel, week: number): number {
  const bonus = level === 'intermediate' ? 1 : 0
  if (week >= 9) return Math.min(base + bonus + 1, 4)
  if (week >= 5) return Math.min(base + bonus, 4)
  return Math.max(2, base)
}

function phaseMeta(
  week: number,
  daysPerWeek: DaysPerWeek,
  duration: SessionDuration,
): Pick<WeekPlan, 'phase' | 'theme' | 'difficulty' | 'volumeNote' | 'intensityNote' | 'focus'> {
  const count = exerciseCountForDuration(duration)
  if (week <= 4) {
    return {
      phase: 'Foundation',
      theme: `Learn patterns · ${daysPerWeek} days · ~${duration} min sessions`,
      difficulty: week <= 2 ? 1 : 2,
      volumeNote: `${count} exercises/session · form over load`,
      intensityNote: 'Effort 6–7/10 (Rate of Perceived Exertion) · leave 3+ reps in reserve',
      focus: `${daysPerWeek}-day · ${duration}-min guide`,
    }
  }
  if (week <= 8) {
    return {
      phase: 'Build',
      theme: `Raise volume · ${count} lifts per session`,
      difficulty: week <= 6 ? 3 : 4,
      volumeNote: `${count} exercises · progressive overload`,
      intensityNote: 'Effort 7–8/10 (Rate of Perceived Exertion) · add 2–5% load when reps are easy',
      focus: `${daysPerWeek}-day · ${duration}-min build`,
    }
  }
  return {
    phase: week === 12 ? 'Deload & Reset' : 'Intensify',
    theme:
      week === 12
        ? `Cut effort · keep ${Math.max(4, count - 2)} crisp movements`
        : `Heavier compounds · ${count} exercises · ~2 Reps In Reserve`,
    difficulty: week === 12 ? 2 : 5,
    volumeNote: week === 12 ? 'Reduced effort' : `${count} exercises on training days`,
    intensityNote:
      week === 12
        ? 'Effort 5–6/10 (Rate of Perceived Exertion)'
        : 'Effort 8/10 (Rate of Perceived Exertion) · strength-biased reps',
    focus: week === 12 ? 'Recovery week' : `${daysPerWeek}-day intensify`,
  }
}

function warmUpStandard(focus: string): string[] {
  return [
    '5 min easy bike, treadmill, or elliptical',
    'Dynamic mobility: hips, T-spine, shoulders (2–3 min)',
    `Activation: 1–2 light warm-up sets of first ${focus} lift`,
  ]
}

function coolDownStandard(): string[] {
  return [
    '2–3 min easy walk',
    'Stretch worked muscles 30–45s each (pain-free)',
    'Log loads + how you felt',
  ]
}

function fullBodyA(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(2, level, week)
  const reps = week <= 2 ? '10–12' : '8–12'
  const rpe = week === 12 ? '5–6' : week <= 2 ? '6–7' : week >= 9 ? '8' : '7'
  const sets = week === 12 ? 2 : s
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Full Body A',
    dayType: week === 12 ? 'deload' : 'train',
    focus: 'full_body',
    durationMin: 45,
    trainerBrief: 'Complete session. Control eccentrics; leave 2–3 reps in reserve.',
    warmUp: warmUpStandard('squat'),
    blocks: [
      block('goblet_squat', sets, reps, 90, rpe),
      block('db_press', sets, reps, 90, rpe),
      block('seated_row', sets, reps, 90, rpe),
      block('rdl', sets, reps, 90, rpe),
      block('lat_pulldown', sets, reps, 75, rpe),
      block('leg_extension', sets, '12–15', 60, week === 12 ? '5' : '6–7'),
      block('lateral_raise', 2, '12–15', 60, week === 12 ? '5' : '6–7'),
      block('triceps_pushdown', 2, '10–12', 60, week === 12 ? '5' : '7'),
      block('biceps_curl', 2, '10–12', 60, week === 12 ? '5' : '7'),
      block('plank', 2, '20–40s', 45, '6'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'Longer sessions unlock accessories — still progress compounds first.',
  }
}

function fullBodyB(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(2, level, week)
  const reps = week <= 2 ? '10–12' : '8–12'
  const rpe = week === 12 ? '5–6' : week <= 2 ? '6–7' : week >= 9 ? '8' : '7'
  const sets = week === 12 ? 2 : s
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Full Body B',
    dayType: week === 12 ? 'deload' : 'train',
    focus: 'full_body',
    durationMin: 45,
    trainerBrief: 'Different angles, same standard: braced core, full range you own.',
    warmUp: warmUpStandard('hinge / press'),
    blocks: [
      block('leg_press', sets, reps, 90, rpe),
      block('ohp', sets, '8–10', 90, rpe),
      block('db_row', sets, reps, 90, rpe),
      block('hip_thrust', sets, reps, 90, rpe),
      block('face_pull', sets, '12–15', 60, week === 12 ? '5' : '6–7'),
      block('leg_curl', sets, '10–12', 75, rpe),
      block('pec_deck_fly', 2, '12–15', 60, week === 12 ? '5' : '7'),
      block('ez_bar_curl', 2, '10–12', 60, week === 12 ? '5' : '7'),
      block('calf_raise', 2, '12–15', 45, week === 12 ? '5' : '7'),
      block('dead_bug', 2, '6–8/side', 45, '6'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'Match or beat last session’s compound loads with clean form.',
  }
}

function fullBodyC(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(2, level, week)
  const rpe = week === 12 ? '5–6' : week >= 4 ? '7' : '6–7'
  const sets = week === 12 ? 2 : s
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Full Body C',
    dayType: week === 12 ? 'deload' : 'train',
    focus: 'full_body',
    durationMin: 45,
    trainerBrief: 'Close the week strong — quality over ego.',
    warmUp: warmUpStandard('lunge'),
    blocks: [
      block('walking_lunge', sets, '8–10/leg', 90, rpe),
      block('incline_press', sets, '8–12', 90, rpe),
      block('lat_pulldown', sets, '8–12', 90, rpe),
      block('leg_curl', sets, '10–12', 75, rpe),
      block('lateral_raise', sets, '12–15', 60, week === 12 ? '5' : '6–7'),
      block('hack_squat', sets, '8–12', 90, rpe),
      block('dips', 2, '6–10', 75, week === 12 ? '5' : '7'),
      block('preacher_curl_ex', 2, '10–12', 60, week === 12 ? '5' : '7'),
      block('farmer_carry', 3, '20–30m', 60, week === 12 ? '5' : '7'),
      block('ab_crunch', 2, '10–15', 45, '6'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'Log lunges and carries — small weekly wins stack up.',
  }
}

function upper(week: number, day: number, level: ExperienceLevel, variant: 'A' | 'B'): Session {
  const s = scaleSets(3, level, week)
  const heavy = week >= 9 ? '6–8' : '8–10'
  const deload = week === 12
  const sets = deload ? Math.max(2, s - 1) : s
  const useRpe = deload ? '5–6' : week >= 9 ? '8' : '7–8'
  const blocksA: WorkoutSet[] = [
    block('bench_press', sets, heavy, 120, useRpe),
    block('seated_row', sets, '10–12', 90, useRpe),
    block('ohp', sets, '8–10', 90, useRpe),
    block('lat_pulldown', sets, '10–12', 90, useRpe),
    block('pec_deck_fly', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('lateral_raise', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('triceps_pushdown', Math.max(2, sets - 1), '10–12', 60, deload ? '5' : '7'),
    block('biceps_curl', Math.max(2, sets - 1), '10–12', 60, deload ? '5' : '7'),
    block('face_pull', 2, '12–15', 60, deload ? '5' : '7'),
    block('dips', 2, '6–10', 75, deload ? '5' : '7'),
  ]
  const blocksB: WorkoutSet[] = [
    block('incline_press', sets, heavy, 120, useRpe),
    block('pullup', sets, 'AMRAP−2', 120, useRpe),
    block('db_press', sets, '10–12', 90, useRpe),
    block('machine_row', sets, '10–12', 90, useRpe),
    block('cable_crossover_fly', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('face_pull', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('triceps_pushdown', Math.max(2, sets - 1), '10–12', 60, deload ? '5' : '7'),
    block('ez_bar_curl', Math.max(2, sets - 1), '10–12', 60, deload ? '5' : '7'),
    block('preacher_curl_ex', 2, '10–12', 60, deload ? '5' : '7'),
    block('lateral_raise', 2, '12–15', 45, deload ? '5' : '7'),
  ]
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: `Upper ${variant}`,
    dayType: deload ? 'deload' : 'train',
    focus: 'upper',
    durationMin: 45,
    trainerBrief: deload
      ? 'Deload upper — lighter effort, same movement quality.'
      : 'Push + pull balance. Big lifts first, accessories if time allows.',
    warmUp: warmUpStandard('press'),
    blocks: variant === 'A' ? blocksA : blocksB,
    coolDown: coolDownStandard(),
    progressionTip: 'Hit top reps cleanly → add ~2–5% next time on compounds.',
  }
}

function lower(week: number, day: number, level: ExperienceLevel, variant: 'A' | 'B'): Session {
  const s = scaleSets(3, level, week)
  const heavy = week >= 9 ? '6–8' : '8–10'
  const deload = week === 12
  const sets = deload ? Math.max(2, s - 1) : s
  const useRpe = deload ? '5–6' : week >= 9 ? '8' : '7–8'
  const blocksA: WorkoutSet[] = [
    block('goblet_squat', sets, heavy, 120, useRpe),
    block('rdl', sets, '8–10', 120, useRpe),
    block('walking_lunge', Math.max(2, sets - 1), '8–10/leg', 90, useRpe),
    block('leg_curl', Math.max(2, sets - 1), '10–12', 75, deload ? '5' : '7'),
    block('leg_extension', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('calf_raise', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('hip_thrust', sets, '8–12', 90, useRpe),
    block('hyperextension_back', 2, '10–12', 60, deload ? '5' : '7'),
    block('ab_crunch', 2, '10–15', 45, '6'),
    block('plank', 2, '30–45s', 45, '6'),
  ]
  const blocksB: WorkoutSet[] = [
    block('leg_press', sets, heavy, 120, useRpe),
    block('hack_squat', sets, '8–12', 120, useRpe),
    block('hip_thrust', sets, '8–12', 90, useRpe),
    block('leg_curl', sets, '10–12', 75, useRpe),
    block('walking_lunge', Math.max(2, sets - 1), '8/leg', 90, deload ? '5' : '7'),
    block('leg_extension', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('calf_raise', Math.max(2, sets - 1), '12–15', 60, deload ? '5' : '7'),
    block('hyperextension_back', 2, '10–12', 60, deload ? '5' : '7'),
    block('farmer_carry', 3, '20–30m', 60, deload ? '5' : '7'),
    block('dead_bug', 2, '8/side', 45, '6'),
  ]
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: `Lower ${variant}`,
    dayType: deload ? 'deload' : 'train',
    focus: 'lower',
    durationMin: 45,
    trainerBrief: deload
      ? 'Deload lower — smooth reps, leave fresher than you arrived.'
      : 'Legs first. Longer duration adds isolation and core.',
    warmUp: warmUpStandard('squat / hinge'),
    blocks: variant === 'A' ? blocksA : blocksB,
    coolDown: coolDownStandard(),
    progressionTip: 'Never add hinge load if your back rounds.',
  }
}

function pushDay(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(3, level, week)
  const deload = week === 12
  const sets = deload ? 2 : s
  const rpe = deload ? '5–6' : week >= 10 ? '8' : '7–8'
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Push',
    dayType: deload ? 'deload' : 'train',
    focus: 'push',
    durationMin: 45,
    trainerBrief: 'Chest, shoulders, triceps — compounds then pumps.',
    warmUp: warmUpStandard('press'),
    blocks: [
      block('bench_press', sets, week >= 9 ? '6–8' : '8–10', 120, rpe),
      block('ohp', sets, '6–10', 120, rpe),
      block('incline_press', sets, '8–12', 90, rpe),
      block('pec_deck_fly', 2, '12–15', 60, deload ? '5' : '7'),
      block('lateral_raise', 2, '12–15', 60, deload ? '5' : '7'),
      block('triceps_pushdown', 2, '10–12', 60, deload ? '5' : '7'),
      block('dips', 2, '6–10', 75, deload ? '5' : '7'),
      block('cable_crossover_fly', 2, '12–15', 60, deload ? '5' : '7'),
      block('machine_shoulder_press', 2, '8–12', 75, deload ? '5' : '7'),
      block('pushup', 2, 'AMRAP−2', 60, deload ? '5' : '7'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'More minutes = more accessories — compounds still come first.',
  }
}

function pullDay(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(3, level, week)
  const deload = week === 12
  const sets = deload ? 2 : s
  const rpe = deload ? '5–6' : week >= 10 ? '8' : '7–8'
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Pull',
    dayType: deload ? 'deload' : 'train',
    focus: 'pull',
    durationMin: 45,
    trainerBrief: 'Back thickness and width — pull with the elbows.',
    warmUp: warmUpStandard('row'),
    blocks: [
      block('pullup', sets, 'AMRAP−2', 120, rpe),
      block('seated_row', sets, '8–10', 90, rpe),
      block('db_row', sets, '8–12', 90, rpe),
      block('lat_pulldown', sets, '10–12', 90, rpe),
      block('face_pull', 2, '12–15', 60, deload ? '5' : '7'),
      block('biceps_curl', 2, '10–12', 60, deload ? '5' : '7'),
      block('ez_bar_curl', 2, '10–12', 60, deload ? '5' : '7'),
      block('preacher_curl_ex', 2, '10–12', 60, deload ? '5' : '7'),
      block('hyperextension_back', 2, '10–12', 60, deload ? '5' : '7'),
      block('machine_row', 2, '10–12', 75, deload ? '5' : '7'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'If grip fails first, still finish back work.',
  }
}

function legsDay(week: number, day: number, level: ExperienceLevel): Session {
  const s = scaleSets(3, level, week)
  const deload = week === 12
  const sets = deload ? 2 : s
  const rpe = deload ? '5–6' : week >= 10 ? '8' : '7–8'
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Legs',
    dayType: deload ? 'deload' : 'train',
    focus: 'legs',
    durationMin: 45,
    trainerBrief: 'Squat, hinge, single-leg — stay braced and honest with depth.',
    warmUp: warmUpStandard('squat'),
    blocks: [
      block('goblet_squat', sets, week >= 9 ? '6–8' : '8–10', 120, rpe),
      block('rdl', sets, '6–10', 120, rpe),
      block('hip_thrust', Math.max(2, sets - 1), '8–12', 90, rpe),
      block('leg_curl', 2, '10–12', 75, deload ? '5' : '7'),
      block('leg_extension', 2, '12–15', 60, deload ? '5' : '7'),
      block('calf_raise', 2, '12–15', 60, deload ? '5' : '7'),
      block('hack_squat', sets, '8–12', 120, rpe),
      block('walking_lunge', 2, '8/leg', 90, deload ? '5' : '7'),
      block('hyperextension_back', 2, '10–12', 60, deload ? '5' : '7'),
      block('ab_crunch', 2, '10–15', 45, '6'),
    ],
    coolDown: coolDownStandard(),
    progressionTip: 'Add load only when every working set is clean.',
  }
}

function recovery(week: number, day: number, kind: 'active' | 'rest'): Session {
  if (kind === 'rest') {
    return {
      id: `w${week}-d${day}`,
      week,
      day,
      title: 'Full Rest',
      dayType: 'rest',
      focus: 'mobility',
      durationMin: 0,
      trainerBrief: 'Growth happens between sessions. Sleep, protein, hydration.',
      warmUp: [],
      blocks: [],
      coolDown: [],
      progressionTip: 'Rest is programmed on purpose.',
    }
  }
  return {
    id: `w${week}-d${day}`,
    week,
    day,
    title: 'Active Recovery',
    dayType: 'active_recovery',
    focus: 'cardio',
    durationMin: 30,
    trainerBrief: 'Easy blood flow only — conversational pace.',
    warmUp: ['2 min easy start'],
    blocks: [
      block('bike_easy', 1, '20–30 min', 0, '3–4'),
      block('mobility_flow', 1, '8–10 min', 0, '3'),
    ],
    coolDown: ['Optional light stretch'],
    progressionTip: 'If very sore, walk and shorten to 15–20 min.',
  }
}

type TrainFactory = (week: number, day: number, level: ExperienceLevel) => Session

function scheduleTrainDays(daysPerWeek: DaysPerWeek): TrainFactory[] {
  switch (daysPerWeek) {
    case 2:
      return [fullBodyA, fullBodyB]
    case 3:
      return [fullBodyA, fullBodyB, fullBodyC]
    case 4:
      return [
        (w, d, l) => upper(w, d, l, 'A'),
        (w, d, l) => lower(w, d, l, 'A'),
        (w, d, l) => upper(w, d, l, 'B'),
        (w, d, l) => lower(w, d, l, 'B'),
      ]
    case 5:
      return [pushDay, pullDay, legsDay, (w, d, l) => upper(w, d, l, 'A'), (w, d, l) => lower(w, d, l, 'A')]
    case 6:
      return [pushDay, pullDay, legsDay, pushDay, pullDay, legsDay]
    default:
      return [fullBodyA, fullBodyB, fullBodyC]
  }
}

function trainingDayNumbers(
  daysPerWeek: DaysPerWeek,
  restWeekdays?: number[],
): number[] {
  if (restWeekdays && restWeekdays.length === 7 - daysPerWeek) {
    const rest = new Set(restWeekdays)
    return [1, 2, 3, 4, 5, 6, 7].filter((d) => !rest.has(d))
  }
  // Fallback defaults if profile is missing custom rest days
  const map: Record<DaysPerWeek, number[]> = {
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6],
  }
  return map[daysPerWeek]
}

function buildWeek(
  week: number,
  level: ExperienceLevel,
  daysPerWeek: DaysPerWeek,
  available: EquipmentId[],
  duration: SessionDuration,
  restWeekdays?: number[],
): WeekPlan {
  const meta = phaseMeta(week, daysPerWeek, duration)
  const trainFactories = scheduleTrainDays(daysPerWeek)
  const trainDays = trainingDayNumbers(daysPerWeek, restWeekdays)
  const trainSet = new Set(trainDays)
  const sessions: Session[] = []
  let trainIdx = 0

  for (let day = 1; day <= 7; day++) {
    if (trainSet.has(day)) {
      const factory = trainFactories[trainIdx++]!
      sessions.push(finalize(factory(week, day, level), available, duration))
    } else {
      // User-chosen rest day — full rest (any weekday, not necessarily consecutive)
      sessions.push(recovery(week, day, 'rest'))
    }
  }

  return { week, ...meta, sessions }
}

export function buildProgram(
  level: ExperienceLevel = 'beginner',
  daysPerWeek: DaysPerWeek = 3,
  availableEquipment: EquipmentId[] = [],
  sessionDuration: SessionDuration = 45,
  restWeekdays?: number[],
): WeekPlan[] {
  return Array.from({ length: 12 }, (_, i) =>
    buildWeek(i + 1, level, daysPerWeek, availableEquipment, sessionDuration, restWeekdays),
  )
}

export function getSession(program: WeekPlan[], week: number, day: number): Session | undefined {
  return program.find((w) => w.week === week)?.sessions.find((s) => s.day === day)
}

export function dayLabel(day: number): string {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1] ?? `Day ${day}`
}

export const levelCopy: Record<ExperienceLevel, { title: string; blurb: string }> = {
  beginner: {
    title: 'Beginner',
    blurb: 'New to the gym or long break. Form-first progression.',
  },
  returning: {
    title: 'Returning',
    blurb: 'Trained before, rusty now. Same structure, steady climb.',
  },
  intermediate: {
    title: 'Intermediate',
    blurb: 'Consistent ≥6 months. Extra set capacity as weeks advance.',
  },
}
