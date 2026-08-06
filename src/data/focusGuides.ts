import type { EquipmentId, SessionDuration } from './equipment'
import { exerciseCountForDuration } from './equipment'
import { resolveExerciseId } from './exercises'
import type { ExperienceLevel, Session, WorkoutSet } from './types'

export type FocusGuideId =
  | 'abs'
  | 'chest'
  | 'back'
  | 'arms'
  | 'shoulders'
  | 'legs'
  | 'glutes'
  | 'core'

export interface FocusGuideInfo {
  id: FocusGuideId
  name: string
  tagline: string
  targetMuscles: string
  weeks: number
  sessionsPerWeek: number
  recommendedMin: number
  image: string
  whoFor: string
  howToUse: string
  precautions: string[]
}

export interface FocusGuideProgress {
  guideId: FocusGuideId
  addedAt: string
  completedSessionIds: string[]
  currentWeek: number
  currentSession: number
}

function block(
  exerciseId: string,
  sets: number,
  reps: string,
  restSec: number,
  rpe: string,
  note?: string,
): WorkoutSet {
  return { exerciseId, sets, reps, restSec, rpe, note }
}

function adapt(blocks: WorkoutSet[], available: EquipmentId[], duration: SessionDuration): WorkoutSet[] {
  const n = Math.min(exerciseCountForDuration(duration), blocks.length)
  return blocks.slice(0, n).map((b) => {
    const resolved = resolveExerciseId(b.exerciseId, available)
    if (resolved === b.exerciseId) return b
    return {
      ...b,
      exerciseId: resolved,
      note: [b.note, `Swapped → ${resolved.replace(/_/g, ' ')}`].filter(Boolean).join(' · '),
    }
  })
}

const eq = (file: string) => `/equipment/${file}`

export const focusGuideCatalog: FocusGuideInfo[] = [
  {
    id: 'abs',
    name: 'Abs & Midsection',
    tagline: 'Core strength and definition work — not only crunches',
    targetMuscles: 'Rectus abdominis, obliques, deep core',
    weeks: 4,
    sessionsPerWeek: 3,
    recommendedMin: 20,
    image: eq('ab-crunch.png'),
    whoFor: 'Anyone wanting stronger abs and better bracing for lifts',
    howToUse: 'Add after your main workout or on lighter days. Do not train abs to failure every day.',
    precautions: [
      'Stop if you feel sharp lower-back pain',
      'Abs need recovery — 3 focused days/week is enough for most people',
      'Visible abs also need nutrition; this guide builds the muscle under the skin',
    ],
  },
  {
    id: 'chest',
    name: 'Chest Builder',
    tagline: 'Press + fly volume for upper and mid chest',
    targetMuscles: 'Pectorals, front delts, triceps assist',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 35,
    image: eq('chest-press.png'),
    whoFor: 'Lifters who want more chest emphasis beside the main program',
    howToUse: 'Use on upper / push days as a specialty finisher, or as a short standalone session',
    precautions: [
      'Warm shoulders thoroughly before heavy presses',
      'Do not stack this on top of a hard push day without reducing main-program volume',
    ],
  },
  {
    id: 'back',
    name: 'Back Thickness',
    tagline: 'Rows, pulldowns, and rear-delt health',
    targetMuscles: 'Lats, mid-back, rear delts, biceps assist',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 35,
    image: eq('seated-row-machine.png'),
    whoFor: 'Anyone balancing pressing work or improving posture',
    howToUse: 'Pair with pull days or run as a short second session',
    precautions: ['Keep a neutral spine on rows', 'If grip fails first, still finish the back work'],
  },
  {
    id: 'arms',
    name: 'Arms Pump',
    tagline: 'Biceps + triceps isolation for sleeve-filling arms',
    targetMuscles: 'Biceps, triceps, forearms',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 25,
    image: eq('ez-bar.png'),
    whoFor: 'Beginners to intermediates wanting arm specialization',
    howToUse: 'Best as a finisher after upper-body days — keep effort controlled',
    precautions: ['Elbows sensitive? Reduce load and range', 'Avoid daily arm grinding'],
  },
  {
    id: 'shoulders',
    name: 'Shoulder Caps',
    tagline: 'Side / rear delts and healthy pressing',
    targetMuscles: 'Side delts, rear delts, front delts',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 25,
    image: eq('shoulder-press.png'),
    whoFor: 'Lifters wanting wider shoulders and better press support',
    howToUse: 'Use light lateral raises — form over heavy swinging',
    precautions: [
      'Sharp shoulder pain = stop and regress',
      'Prioritize rear-delt / face-pull work if you press a lot',
    ],
  },
  {
    id: 'legs',
    name: 'Leg Strength',
    tagline: 'Quads and hamstrings with machine + free-weight options',
    targetMuscles: 'Quads, hamstrings, calves',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 40,
    image: eq('leg-press.png'),
    whoFor: 'People who want extra lower-body volume',
    howToUse: 'Do not run this the day before a hard main-program leg session',
    precautions: ['Knees / hips complaining? Shorten range and lighten load', 'Warm up thoroughly'],
  },
  {
    id: 'glutes',
    name: 'Glute Focus',
    tagline: 'Thrusts, hinges, and posterior-chain pumps',
    targetMuscles: 'Glutes, hamstrings, lower back support',
    weeks: 4,
    sessionsPerWeek: 2,
    recommendedMin: 30,
    image: eq('hip-thrust.png'),
    whoFor: 'Anyone building glute strength for looks or athletic power',
    howToUse: 'Great on lower days or as a short standalone session',
    precautions: ['Do not arch the lower back hard on thrusts', 'Pad the bar for comfort'],
  },
  {
    id: 'core',
    name: 'Core Stability',
    tagline: 'Anti-extension and bracing for safer lifting',
    targetMuscles: 'Deep core, obliques, spinal stability',
    weeks: 4,
    sessionsPerWeek: 3,
    recommendedMin: 15,
    image: eq('ab-crunch.png'),
    whoFor: 'Beginners and anyone with desk posture needing bracing skill',
    howToUse: 'Short sessions — quality holds beat endless crunches',
    precautions: [
      'This is stability work, not a six-pack-only plan',
      'Stop if pain radiates into the legs',
    ],
  },
]

export function getFocusGuideInfo(id: FocusGuideId): FocusGuideInfo | undefined {
  return focusGuideCatalog.find((g) => g.id === id)
}

function setsFor(level: ExperienceLevel, week: number, base = 3): number {
  if (week >= 4) return Math.min(base + (level === 'intermediate' ? 1 : 0), 4)
  if (week >= 2) return base
  return Math.max(2, base - (level === 'beginner' ? 1 : 0))
}

function rpeFor(week: number): string {
  if (week === 1) return '6–7'
  if (week === 4) return '7–8'
  return '7'
}

type SessionBuilder = (
  week: number,
  session: number,
  level: ExperienceLevel,
) => Omit<Session, 'blocks'> & { blocks: WorkoutSet[] }

const builders: Record<FocusGuideId, SessionBuilder[]> = {
  abs: [
    (week, session, level) => {
      const s = setsFor(level, week)
      const r = rpeFor(week)
      return {
        id: `focus-abs-w${week}-s${session}`,
        week,
        day: session,
        title: 'Abs A · Flexion',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 20,
        trainerBrief:
          'Quality core work. Brace like someone will poke your stomach. Stop 2 reps before failure.',
        warmUp: ['Cat-cow × 8', 'Dead bug practice × 4/side (easy)', 'Light torso circles'],
        blocks: [
          block('ab_crunch', s, '12–15', 45, r),
          block('dead_bug', s, '8/side', 45, '6–7'),
          block('plank', s, '25–40s', 45, '7'),
          block('ab_crunch', 2, '10–12', 45, r, 'Second round — slower tempo'),
          block('plank', 2, '20–30s', 40, '7', 'Side plank if front plank is easy'),
        ],
        coolDown: ['Child’s pose 45s', 'Gentle twist each side 30s'],
        progressionTip: 'Add 5 seconds to planks or 1–2 reps when the top of the range feels easy.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week)
      const r = rpeFor(week)
      return {
        id: `focus-abs-w${week}-s${session}`,
        week,
        day: session,
        title: 'Abs B · Brace & Twist',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 20,
        trainerBrief: 'Anti-rotation and bracing. Move slow — feel the midsection work.',
        warmUp: ['Bird-dog × 6/side', 'Open books × 6/side'],
        blocks: [
          block('dead_bug', s, '8–10/side', 45, r),
          block('plank', s, '30–45s', 45, '7'),
          block('ab_crunch', s, '10–15', 45, r),
          block('farmer_carry', 3, '20–30m', 60, '7', 'Suitcase carry if only one dumbbell'),
          block('dead_bug', 2, '6/side', 40, '6'),
        ],
        coolDown: ['Hip flexor stretch 30s/side'],
        progressionTip: 'Carries build real-world core strength — stand tall, do not lean.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week)
      const r = rpeFor(week)
      return {
        id: `focus-abs-w${week}-s${session}`,
        week,
        day: session,
        title: 'Abs C · Finisher',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 18,
        trainerBrief: 'Short denser core day. Leave a little in the tank.',
        warmUp: ['Easy march 2 min', 'Cat-cow × 6'],
        blocks: [
          block('ab_crunch', s, '12–20', 40, r),
          block('plank', s, '20–40s', 40, '7'),
          block('dead_bug', s, '6–8/side', 40, '6–7'),
          block('ab_crunch', 2, 'AMRAP−2', 45, '7'),
        ],
        coolDown: ['Long exhale breathing × 5'],
        progressionTip: 'Week 4: keep form strict even if reps climb.',
      }
    },
  ],
  chest: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-chest-w${week}-s${session}`,
        week,
        day: session,
        title: 'Chest A · Press Focus',
        dayType: 'train',
        focus: 'push',
        durationMin: 35,
        trainerBrief: 'Horizontal pressing first while fresh. Leave ~2 reps in reserve.',
        warmUp: ['Arm circles', 'Band / easy push-ups × 8', '1–2 light press warm-up sets'],
        blocks: [
          block('bench_press', s, week >= 3 ? '6–10' : '8–12', 120, r),
          block('incline_press', s, '8–12', 90, r),
          block('pec_deck_fly', s, '12–15', 60, '7'),
          block('machine_chest_press', 2, '10–12', 75, '7'),
          block('pushup', 2, 'AMRAP−2', 60, '7'),
          block('dips', 2, '6–10', 75, '7'),
        ],
        coolDown: ['Doorway chest stretch 30s/side'],
        progressionTip: 'Add 2–5% to the main press when you hit the top of the rep range cleanly.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-chest-w${week}-s${session}`,
        week,
        day: session,
        title: 'Chest B · Fly & Upper',
        dayType: 'train',
        focus: 'push',
        durationMin: 35,
        trainerBrief: 'Upper-chest and stretch-position work. Control every lower.',
        warmUp: ['Band pull-aparts × 12', 'Light incline press warm-up'],
        blocks: [
          block('incline_press', s, '8–12', 90, r),
          block('cable_crossover_fly', s, '12–15', 60, '7'),
          block('db_press', s, '8–12', 90, r),
          block('pec_deck_fly', 2, '12–15', 60, '7'),
          block('pushup', 2, '10–15', 60, '7'),
        ],
        coolDown: ['Gentle pec stretch'],
        progressionTip: 'If shoulders ache, reduce fly range and prioritize presses.',
      }
    },
  ],
  back: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-back-w${week}-s${session}`,
        week,
        day: session,
        title: 'Back A · Width',
        dayType: 'train',
        focus: 'pull',
        durationMin: 35,
        trainerBrief: 'Vertical pulls for lat width. Pull with elbows, not wrists.',
        warmUp: ['Scapular hangs or easy pulldowns × 10', 'Thoracic openers'],
        blocks: [
          block('pullup', s, 'AMRAP−2', 120, r),
          block('lat_pulldown', s, '8–12', 90, r),
          block('seated_row', s, '8–12', 90, r),
          block('face_pull', s, '12–15', 60, '7'),
          block('db_row', 2, '10–12', 75, '7'),
          block('hyperextension_back', 2, '10–12', 60, '6–7'),
        ],
        coolDown: ['Child’s pose + lat stretch'],
        progressionTip: 'Add a pull-up rep or reduce assist before adding isolation load.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-back-w${week}-s${session}`,
        week,
        day: session,
        title: 'Back B · Thickness',
        dayType: 'train',
        focus: 'pull',
        durationMin: 35,
        trainerBrief: 'Row variations for mid-back thickness and posture.',
        warmUp: ['Band face pulls × 12', 'Easy row warm-up set'],
        blocks: [
          block('machine_row', s, '8–12', 90, r),
          block('db_row', s, '8–12', 90, r),
          block('seated_row', s, '10–12', 75, r),
          block('lat_pulldown', 2, '10–12', 75, '7'),
          block('face_pull', 2, '12–15', 60, '7'),
          block('biceps_curl', 2, '10–12', 60, '7'),
        ],
        coolDown: ['Hang from bar 20–30s if shoulders allow'],
        progressionTip: 'Squeeze at the end of each row for a full second.',
      }
    },
  ],
  arms: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-arms-w${week}-s${session}`,
        week,
        day: session,
        title: 'Arms A · Curl Bias',
        dayType: 'train',
        focus: 'pull',
        durationMin: 25,
        trainerBrief: 'Biceps focus with enough triceps for balance. No swinging.',
        warmUp: ['Arm circles', 'Light empty-bar or band curls × 12'],
        blocks: [
          block('ez_bar_curl', s, '8–12', 60, r),
          block('preacher_curl_ex', s, '10–12', 60, r),
          block('biceps_curl', s, '10–12', 45, '7'),
          block('triceps_pushdown', s, '10–12', 60, '7'),
          block('dips', 2, '6–10', 75, '7'),
        ],
        coolDown: ['Forearm stretch 20s'],
        progressionTip: 'When top reps are easy, add the smallest plate or dumbbell jump.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-arms-w${week}-s${session}`,
        week,
        day: session,
        title: 'Arms B · Triceps Bias',
        dayType: 'train',
        focus: 'push',
        durationMin: 25,
        trainerBrief: 'Triceps volume with curl finishers. Elbows stay quiet.',
        warmUp: ['Light pushdowns × 12', 'Easy diamond push-ups × 5'],
        blocks: [
          block('triceps_pushdown', s, '10–12', 60, r),
          block('dips', s, '6–10', 75, r),
          block('pushup', 2, '8–15', 60, '7'),
          block('ez_bar_curl', s, '8–12', 60, '7'),
          block('biceps_curl', 2, '10–12', 45, '7'),
        ],
        coolDown: ['Triceps overhead stretch 30s/side'],
        progressionTip: 'Full lockout on pushdowns without shrugging.',
      }
    },
  ],
  shoulders: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-shoulders-w${week}-s${session}`,
        week,
        day: session,
        title: 'Shoulders A · Press',
        dayType: 'train',
        focus: 'push',
        durationMin: 25,
        trainerBrief: 'Overhead strength plus side-delt shape. Brace hard.',
        warmUp: ['Arm circles', 'Band pull-aparts × 15', 'Light press warm-up'],
        blocks: [
          block('ohp', s, '6–10', 90, r),
          block('machine_shoulder_press', s, '8–12', 75, r),
          block('lateral_raise', s, '12–15', 45, '7'),
          block('face_pull', s, '12–15', 45, '7'),
          block('lateral_raise', 2, '12–15', 40, '7', 'Lighter second round'),
        ],
        coolDown: ['Cross-body shoulder stretch'],
        progressionTip: 'Side raises stay light — swinging heavy weight trains momentum, not delts.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-shoulders-w${week}-s${session}`,
        week,
        day: session,
        title: 'Shoulders B · Side & Rear',
        dayType: 'train',
        focus: 'push',
        durationMin: 25,
        trainerBrief: 'Cap the shoulders and protect them with rear-delt work.',
        warmUp: ['Face pulls light × 12', 'Scapular wall slides × 8'],
        blocks: [
          block('lateral_raise', s, '12–15', 45, r),
          block('face_pull', s, '12–15', 45, r),
          block('machine_shoulder_press', s, '8–12', 75, '7'),
          block('lateral_raise', 2, '15–20', 40, '6–7'),
          block('db_row', 2, '10–12', 60, '7', 'Elbows high for rear-delt emphasis'),
        ],
        coolDown: ['Gentle doorway stretch'],
        progressionTip: 'If pressing feels sticky, do more face pulls and fewer overhead sets.',
      }
    },
  ],
  legs: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-legs-w${week}-s${session}`,
        week,
        day: session,
        title: 'Legs A · Quad Bias',
        dayType: 'train',
        focus: 'legs',
        durationMin: 40,
        trainerBrief: 'Squat patterns and extensions. Brace before every hard set.',
        warmUp: ['Bike 3–5 min', 'Bodyweight squats × 10', 'Hip openers'],
        blocks: [
          block('goblet_squat', s, week >= 3 ? '6–10' : '8–12', 120, r),
          block('leg_press', s, '8–12', 120, r),
          block('leg_extension', s, '12–15', 60, '7'),
          block('walking_lunge', 2, '8/leg', 75, '7'),
          block('calf_raise', 3, '12–15', 45, '7'),
          block('hack_squat', 2, '8–12', 120, '7'),
        ],
        coolDown: ['Quad stretch 30s/side'],
        progressionTip: 'Progress the first squat/press movement before chasing isolation.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-legs-w${week}-s${session}`,
        week,
        day: session,
        title: 'Legs B · Hinge Bias',
        dayType: 'train',
        focus: 'legs',
        durationMin: 40,
        trainerBrief: 'Hamstrings and posterior chain. Keep the back flat on hinges.',
        warmUp: ['Glute bridges × 10', 'Easy hinge practice with light load'],
        blocks: [
          block('rdl', s, '6–10', 120, r),
          block('leg_curl', s, '10–12', 75, r),
          block('hip_thrust', s, '8–12', 90, r),
          block('leg_press', 2, '10–12', 90, '7'),
          block('calf_raise', 3, '12–15', 45, '7'),
          block('hyperextension_back', 2, '10–12', 60, '6–7'),
        ],
        coolDown: ['Hamstring stretch 30s/side'],
        progressionTip: 'Never add Romanian Deadlift load if your back rounds.',
      }
    },
  ],
  glutes: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-glutes-w${week}-s${session}`,
        week,
        day: session,
        title: 'Glutes A · Thrust',
        dayType: 'train',
        focus: 'legs',
        durationMin: 30,
        trainerBrief: 'Hip extension focus. Ribs down, squeeze glutes hard at the top.',
        warmUp: ['Glute bridge × 12', 'World’s greatest stretch × 4/side'],
        blocks: [
          block('hip_thrust', s, '8–12', 90, r),
          block('goblet_squat', s, '8–12', 90, r),
          block('walking_lunge', s, '8/leg', 75, '7'),
          block('glute_bridge', 2, '12–15', 45, '7'),
          block('rdl', 2, '8–10', 90, '7'),
        ],
        coolDown: ['Figure-4 stretch 30s/side'],
        progressionTip: 'Pause 1 second at lockout on thrusts — no hyperextending the spine.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-glutes-w${week}-s${session}`,
        week,
        day: session,
        title: 'Glutes B · Hinge & Carry',
        dayType: 'train',
        focus: 'legs',
        durationMin: 30,
        trainerBrief: 'Posterior chain density. Own every hinge.',
        warmUp: ['Cat-cow', 'Bodyweight good mornings × 8'],
        blocks: [
          block('rdl', s, '6–10', 120, r),
          block('hip_thrust', s, '8–12', 90, r),
          block('leg_curl', s, '10–12', 60, '7'),
          block('hyperextension_back', 2, '10–12', 60, '7'),
          block('farmer_carry', 3, '20–40m', 60, '7'),
        ],
        coolDown: ['Pigeon or figure-4 stretch'],
        progressionTip: 'Add load to thrusts first — they tolerate progression well.',
      }
    },
  ],
  core: [
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      return {
        id: `focus-core-w${week}-s${session}`,
        week,
        day: session,
        title: 'Core A · Anti-Extension',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 15,
        trainerBrief: 'Learn to brace. Imagine protecting your spine under a lift.',
        warmUp: ['Breathing: 3 deep belly breaths', 'Cat-cow × 6'],
        blocks: [
          block('dead_bug', s, '6–8/side', 40, '6–7'),
          block('plank', s, '20–40s', 40, '7'),
          block('dead_bug', 2, '6/side', 40, '6'),
          block('plank', 2, '15–30s', 40, '7'),
        ],
        coolDown: ['Easy walk 2 min'],
        progressionTip: 'Add time before adding fancy variations.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      return {
        id: `focus-core-w${week}-s${session}`,
        week,
        day: session,
        title: 'Core B · Carry & Brace',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 15,
        trainerBrief: 'Standing core — carries transfer to real lifting.',
        warmUp: ['March in place 1 min', 'Dead bug × 4/side easy'],
        blocks: [
          block('farmer_carry', 4, '20–30m', 45, '7'),
          block('plank', s, '25–40s', 40, '7'),
          block('dead_bug', s, '6–8/side', 40, '6–7'),
        ],
        coolDown: ['Hip flexor stretch'],
        progressionTip: 'Heavier carries beat longer floppy carries.',
      }
    },
    (week, session, level) => {
      const s = setsFor(level, week, 3)
      const r = rpeFor(week)
      return {
        id: `focus-core-w${week}-s${session}`,
        week,
        day: session,
        title: 'Core C · Controlled Flexion',
        dayType: 'train',
        focus: 'full_body',
        durationMin: 15,
        trainerBrief: 'Crunch pattern with bracing standards — no neck yanking.',
        warmUp: ['Pelvic tilts × 10'],
        blocks: [
          block('ab_crunch', s, '10–15', 40, r),
          block('plank', s, '20–35s', 40, '7'),
          block('dead_bug', s, '6/side', 40, '6–7'),
          block('ab_crunch', 2, 'AMRAP−2', 45, '7'),
        ],
        coolDown: ['Supine twist 20s/side'],
        progressionTip: 'If the neck tires first, support the head lightly and slow down.',
      }
    },
  ],
}

export function buildFocusGuideSessions(
  guideId: FocusGuideId,
  level: ExperienceLevel,
  available: EquipmentId[],
  duration: SessionDuration = 45,
): Session[][] {
  const info = getFocusGuideInfo(guideId)
  if (!info) return []
  const sessionBuilders = builders[guideId]
  const weeks: Session[][] = []

  for (let week = 1; week <= info.weeks; week++) {
    const weekSessions: Session[] = sessionBuilders.map((build, idx) => {
      const raw = build(week, idx + 1, level)
      const budget = (
        info.recommendedMin <= 20 ? 30 : info.recommendedMin <= 30 ? 45 : Math.min(duration, 60)
      ) as SessionDuration
      return {
        ...raw,
        durationMin: info.recommendedMin,
        blocks: adapt(raw.blocks, available, budget),
      }
    })
    weeks.push(weekSessions)
  }
  return weeks
}

export function getFocusSession(
  guideId: FocusGuideId,
  week: number,
  sessionNum: number,
  level: ExperienceLevel,
  available: EquipmentId[],
  duration: SessionDuration,
): Session | undefined {
  const weeks = buildFocusGuideSessions(guideId, level, available, duration)
  return weeks[week - 1]?.[sessionNum - 1]
}
