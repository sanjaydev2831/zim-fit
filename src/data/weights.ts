import type { ExperienceLevel } from './types'
import { exercises } from './exercises'

type Load = {
  beginner: string
  returning: string
  intermediate: string
  tip?: string
}

/** Suggested working loads (kg) for Indian gym plates / dumbbell racks */
const loads: Record<string, Load> = {
  goblet_squat: {
    beginner: '8–12 kg dumbbell',
    returning: '12–20 kg dumbbell',
    intermediate: '20–32 kg dumbbell / kettlebell',
    tip: 'Hold at chest. Go heavier only if depth stays clean.',
  },
  smith_squat: {
    beginner: '20–40 kg (bar + plates)',
    returning: '40–60 kg',
    intermediate: '60–100+ kg',
    tip: 'Smith bar may already weigh ~15–20 kg — check your machine.',
  },
  hack_squat: {
    beginner: '20–40 kg on sled',
    returning: '40–80 kg',
    intermediate: '80–140+ kg',
    tip: 'Start light to learn foot placement.',
  },
  bodyweight_squat: {
    beginner: 'Bodyweight only',
    returning: 'Bodyweight or light backpack',
    intermediate: 'Bodyweight slow tempo / pause reps',
    tip: 'No external load needed until form is automatic.',
  },
  leg_press: {
    beginner: '40–80 kg (sled)',
    returning: '80–140 kg',
    intermediate: '140–220+ kg',
    tip: 'Do not lock knees hard; keep hips on the pad.',
  },
  leg_extension: {
    beginner: '15–25 kg',
    returning: '25–40 kg',
    intermediate: '40–60+ kg',
    tip: 'Use a full pain-free range — stop if knees complain.',
  },
  rdl: {
    beginner: '20–30 kg barbell or 8–12 kg dumbbells each',
    returning: '40–60 kg barbell or 14–20 kg dumbbells each',
    intermediate: '60–100+ kg barbell or 22–32 kg dumbbells each',
    tip: 'Hinge first — lighter is better than a rounded back.',
  },
  hip_thrust: {
    beginner: '20–40 kg',
    returning: '40–70 kg',
    intermediate: '70–120+ kg',
    tip: 'Pad the bar. Pause 1 second at the top.',
  },
  glute_bridge: {
    beginner: 'Bodyweight',
    returning: 'Bodyweight or 10–20 kg plate on hips',
    intermediate: '20–40 kg on hips',
    tip: 'Drive through heels; squeeze glutes hard.',
  },
  walking_lunge: {
    beginner: 'Bodyweight or 4–8 kg each hand',
    returning: '8–14 kg each hand',
    intermediate: '14–24 kg each hand',
    tip: 'Shorten stride if knees push past toes painfully.',
  },
  leg_curl: {
    beginner: '15–25 kg',
    returning: '25–40 kg',
    intermediate: '40–60+ kg',
    tip: 'Control the way down for 2–3 seconds.',
  },
  calf_raise: {
    beginner: 'Bodyweight or 20–40 kg',
    returning: '40–60 kg',
    intermediate: '60–100+ kg',
    tip: 'Full stretch at the bottom every rep.',
  },
  hyperextension_back: {
    beginner: 'Bodyweight',
    returning: 'Bodyweight or 5–10 kg plate',
    intermediate: '10–25 kg plate at chest',
    tip: 'Neutral spine — do not hyperextend the neck.',
  },
  bench_press: {
    beginner: '20–40 kg (often empty / light bar)',
    returning: '40–60 kg',
    intermediate: '60–100+ kg',
    tip: 'Olympic bar is usually 20 kg. Use a spotter when heavy.',
  },
  smith_bench: {
    beginner: '20–35 kg',
    returning: '35–55 kg',
    intermediate: '55–90+ kg',
    tip: 'Set safety stops just below chest height.',
  },
  db_press: {
    beginner: '6–10 kg each',
    returning: '12–18 kg each',
    intermediate: '20–32+ kg each',
    tip: 'Wrists stacked over elbows; full control at the bottom.',
  },
  machine_chest_press: {
    beginner: '20–35 kg',
    returning: '35–55 kg',
    intermediate: '55–90+ kg',
    tip: 'Choose a seat height where handles meet mid-chest.',
  },
  pec_deck_fly: {
    beginner: '15–25 kg',
    returning: '25–40 kg',
    intermediate: '40–60+ kg',
    tip: 'Soft elbows; do not force an extreme stretch.',
  },
  cable_crossover_fly: {
    beginner: '5–8 kg per side',
    returning: '8–12 kg per side',
    intermediate: '12–20+ kg per side',
    tip: 'Hug path — squeeze chest at the middle.',
  },
  pushup: {
    beginner: 'Knee or incline push-up (bodyweight)',
    returning: 'Full push-up (bodyweight)',
    intermediate: 'Bodyweight or weighted vest / plate',
    tip: 'Elevate hands on a bench if floor reps are too hard.',
  },
  incline_press: {
    beginner: '6–10 kg each',
    returning: '10–16 kg each',
    intermediate: '18–28+ kg each',
    tip: 'Bench at 30–45°. Keep ribs down.',
  },
  dips: {
    beginner: 'Assisted dips or foot-assisted',
    returning: 'Bodyweight',
    intermediate: 'Bodyweight + 5–20 kg belt',
    tip: 'Stop before shoulders hurt at the bottom.',
  },
  lat_pulldown: {
    beginner: '25–35 kg',
    returning: '35–50 kg',
    intermediate: '50–75+ kg',
    tip: 'Pull elbows to ribs — do not yank with momentum.',
  },
  seated_row: {
    beginner: '25–35 kg',
    returning: '35–50 kg',
    intermediate: '50–75+ kg',
    tip: 'Chest proud; squeeze shoulder blades each rep.',
  },
  machine_row: {
    beginner: '20–35 kg',
    returning: '35–55 kg',
    intermediate: '55–90+ kg',
    tip: 'Chest stays on the pad — no bouncing.',
  },
  db_row: {
    beginner: '8–12 kg',
    returning: '14–22 kg',
    intermediate: '24–40+ kg',
    tip: 'One arm at a time. Flat back, elbow past torso.',
  },
  pullup: {
    beginner: 'Assisted machine 40–70% bodyweight help',
    returning: 'Light assist or band',
    intermediate: 'Bodyweight (add weight when 8+ clean reps)',
    tip: 'As Many Reps As Possible, stop 2 before failure (AMRAP−2).',
  },
  ohp: {
    beginner: '15–25 kg barbell or 6–8 kg dumbbells each',
    returning: '25–40 kg barbell or 10–14 kg dumbbells each',
    intermediate: '40–60+ kg barbell or 16–24+ kg dumbbells each',
    tip: 'Brace glutes; do not lean back to cheat.',
  },
  machine_shoulder_press: {
    beginner: '15–25 kg',
    returning: '25–40 kg',
    intermediate: '40–65+ kg',
    tip: 'Head neutral; press without shrugging.',
  },
  lateral_raise: {
    beginner: '2–4 kg each',
    returning: '4–6 kg each',
    intermediate: '6–10 kg each',
    tip: 'Light weight wins — swingy heavy reps waste the side delts.',
  },
  face_pull: {
    beginner: '10–15 kg',
    returning: '15–25 kg',
    intermediate: '25–35 kg',
    tip: 'Pull to face height and rotate thumbs back.',
  },
  biceps_curl: {
    beginner: '4–8 kg each',
    returning: '8–12 kg each',
    intermediate: '12–20+ kg each',
    tip: 'No swinging. Full stretch at the bottom.',
  },
  ez_bar_curl: {
    beginner: '10–15 kg',
    returning: '15–25 kg',
    intermediate: '25–40+ kg',
    tip: 'EZ bar = curved bar that is easier on the wrists.',
  },
  preacher_curl_ex: {
    beginner: '10–15 kg',
    returning: '15–25 kg',
    intermediate: '25–40 kg',
    tip: 'Armpit on the pad; no bounce at the bottom.',
  },
  triceps_pushdown: {
    beginner: '15–20 kg',
    returning: '20–30 kg',
    intermediate: '30–50+ kg',
    tip: 'Elbows glued to your sides.',
  },
  plank: {
    beginner: 'Bodyweight · 20–30 seconds',
    returning: 'Bodyweight · 30–45 seconds',
    intermediate: 'Bodyweight · 45–60+ seconds',
    tip: 'Stop if hips sag — quality over time.',
  },
  dead_bug: {
    beginner: 'Bodyweight',
    returning: 'Bodyweight',
    intermediate: 'Light 2–4 kg in hands (optional)',
    tip: 'Low back stays pressed into the floor.',
  },
  ab_crunch: {
    beginner: '10–20 kg',
    returning: '20–35 kg',
    intermediate: '35–50+ kg',
    tip: 'Curl ribs toward pelvis — do not yank the neck.',
  },
  farmer_carry: {
    beginner: '8–12 kg each hand',
    returning: '14–22 kg each hand',
    intermediate: '24–40+ kg each hand',
    tip: 'Tall posture, short steps, no side lean.',
  },
  bike_easy: {
    beginner: 'Easy resistance · conversational pace',
    returning: 'Easy–moderate · still able to talk',
    intermediate: 'Steady Zone 2 · nasal or easy speech',
    tip: 'This is recovery cardio — not a hard interval.',
  },
  mobility_flow: {
    beginner: 'Bodyweight only',
    returning: 'Bodyweight only',
    intermediate: 'Bodyweight only',
    tip: 'Pain-free range. Skip any position that pinches.',
  },
}

/** Attach load guides onto exercise definitions (mutates in place once). */
export function applyLoadGuides() {
  for (const [id, load] of Object.entries(loads)) {
    const ex = exercises[id]
    if (ex) ex.suggestedWeight = load
  }
}

applyLoadGuides()

export function bodyContextNote(heightCm?: number, weightKg?: number): string | undefined {
  if (!heightCm || !weightKg || heightCm < 100 || weightKg < 30) return undefined
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  const bmiRounded = Math.round(bmi * 10) / 10
  if (bmi < 18.5) {
    return `BW ${weightKg} kg · BMI ~${bmiRounded} — prefer the lighter end of the range and add load slowly.`
  }
  if (bmi >= 30) {
    return `BW ${weightKg} kg · BMI ~${bmiRounded} — prioritize form; start mid-low in the range for joints.`
  }
  return `BW ${weightKg} kg · BMI ~${bmiRounded} — use the range for your level; nudge up when reps feel easy.`
}

export function getSuggestedWeight(
  exerciseId: string,
  level: ExperienceLevel = 'beginner',
  body?: { heightCm?: number; weightKg?: number },
): { label: string; tip?: string } | null {
  const load = loads[exerciseId] ?? exercises[exerciseId]?.suggestedWeight
  if (!load) return null
  const bodyNote = bodyContextNote(body?.heightCm, body?.weightKg)
  const tip = [load.tip, bodyNote].filter(Boolean).join(' ')
  return {
    label: load[level],
    tip: tip || undefined,
  }
}
