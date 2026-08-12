import type { EquipmentId } from './equipment'
import { expandEquipment } from './equipment'
import type { Exercise } from './types'

const eq = (file: string) => `/equipment/${file}`

export const exercises: Record<string, Exercise> = {
  goblet_squat: {
    id: 'goblet_squat',
    name: 'Goblet Squat',
    muscle: 'Quads, glutes, core',
    equipment: 'Dumbbell or kettlebell',
    equipmentIds: ['dumbbells', 'kettlebell'],
    image: eq('dumbbells.png'),
    cues: ['Feet shoulder-width', 'Elbows inside knees', 'Drive through mid-foot'],
    substitutes: ['Hack squat', 'Smith squat', 'Bodyweight squat'],
    altExerciseIds: ['hack_squat', 'smith_squat', 'bodyweight_squat', 'leg_press'],
  },
  smith_squat: {
    id: 'smith_squat',
    name: 'Smith Machine Squat',
    muscle: 'Quads, glutes',
    equipment: 'Smith machine',
    equipmentIds: ['smith_machine'],
    image: eq('smith-machine.png'),
    cues: ['Feet slightly forward of bar', 'Controlled depth', 'Do not smash lockout'],
    substitutes: ['Hack squat', 'Goblet squat'],
    altExerciseIds: ['hack_squat', 'goblet_squat', 'leg_press'],
  },
  hack_squat: {
    id: 'hack_squat',
    name: 'Hack Squat',
    muscle: 'Quads, glutes',
    equipment: 'Hack squat machine',
    equipmentIds: ['hack_squat'],
    image: eq('hack-squat.png'),
    cues: ['Back flat on pad', 'Knees track toes', 'Full control on the way down'],
    substitutes: ['Leg press', 'Smith squat'],
    altExerciseIds: ['leg_press', 'smith_squat', 'goblet_squat'],
  },
  bodyweight_squat: {
    id: 'bodyweight_squat',
    name: 'Bodyweight Squat',
    muscle: 'Quads, glutes',
    equipment: 'Bodyweight',
    equipmentIds: ['bodyweight'],
    image: eq('hack-squat.png'),
    cues: ['Sit hips back', 'Knees track toes', 'Stand tall'],
    substitutes: ['Goblet squat'],
    altExerciseIds: ['goblet_squat'],
  },
  leg_press: {
    id: 'leg_press',
    name: 'Leg Press',
    muscle: 'Quads, glutes',
    equipment: 'Leg press',
    equipmentIds: ['leg_press'],
    image: eq('leg-press.png'),
    cues: ['Feet mid-platform', 'Do not lift hips', 'No hard knee slam'],
    substitutes: ['Hack squat', 'Goblet squat'],
    altExerciseIds: ['hack_squat', 'goblet_squat'],
  },
  leg_extension: {
    id: 'leg_extension',
    name: 'Leg Extension',
    muscle: 'Quads',
    equipment: 'Leg extension machine',
    equipmentIds: ['leg_extension'],
    image: eq('leg-extension.png'),
    cues: ['Pad on lower shin', 'Control the lower', 'Stop if knee pain'],
    substitutes: ['Goblet squat'],
    altExerciseIds: ['goblet_squat', 'walking_lunge'],
  },
  rdl: {
    id: 'rdl',
    name: 'Romanian Deadlift',
    muscle: 'Hamstrings, glutes, back',
    equipment: 'Barbell or dumbbells',
    equipmentIds: ['barbell', 'dumbbells'],
    image: eq('barbell.png'),
    cues: ['Soft knees, hinge hips', 'Bar close to legs', 'Squeeze glutes to stand'],
    substitutes: ['Hyperextension', 'Hip thrust'],
    altExerciseIds: ['hyperextension_back', 'hip_thrust', 'glute_bridge'],
    caution: 'Do not round the lower back',
  },
  hip_thrust: {
    id: 'hip_thrust',
    name: 'Hip Thrust',
    muscle: 'Glutes',
    equipment: 'Hip thrust setup',
    equipmentIds: ['hip_thrust_setup', 'bench'],
    image: eq('hip-thrust.png'),
    cues: ['Upper back on bench', 'Ribs down at top', 'Pause and squeeze'],
    substitutes: ['Glute bridge'],
    altExerciseIds: ['glute_bridge'],
  },
  glute_bridge: {
    id: 'glute_bridge',
    name: 'Glute Bridge',
    muscle: 'Glutes',
    equipment: 'Mat',
    equipmentIds: ['bodyweight', 'mat'],
    image: eq('hip-thrust.png'),
    cues: ['Drive through heels', 'Squeeze at top', 'Ribs down'],
    substitutes: ['Hip thrust'],
    altExerciseIds: ['hip_thrust'],
  },
  walking_lunge: {
    id: 'walking_lunge',
    name: 'Walking Lunge',
    muscle: 'Quads, glutes',
    equipment: 'Bodyweight or dumbbells',
    equipmentIds: ['bodyweight', 'dumbbells'],
    image: eq('dumbbells.png'),
    cues: ['Long step', 'Front shin vertical', 'Push through front heel'],
    substitutes: ['Leg press'],
    altExerciseIds: ['leg_press', 'bodyweight_squat'],
  },
  leg_curl: {
    id: 'leg_curl',
    name: 'Leg Curl',
    muscle: 'Hamstrings',
    equipment: 'Leg curl machine',
    equipmentIds: ['leg_curl'],
    image: eq('leg-curl.png'),
    cues: ['Control eccentric', 'No hip yanking', 'Pain-free range'],
    substitutes: ['Romanian Deadlift', 'Hyperextension'],
    altExerciseIds: ['rdl', 'hyperextension_back'],
  },
  calf_raise: {
    id: 'calf_raise',
    name: 'Calf Raise',
    muscle: 'Calves',
    equipment: 'Calf machine or bodyweight',
    equipmentIds: ['calf_machine', 'bodyweight'],
    image: eq('calf-machine.png'),
    cues: ['Full stretch', 'Pause at top', 'No bounce'],
    substitutes: ['Single-leg calf raise'],
    altExerciseIds: [],
  },
  hyperextension_back: {
    id: 'hyperextension_back',
    name: 'Back Extension (Roman Chair)',
    muscle: 'Erectors, glutes',
    equipment: 'Roman chair',
    equipmentIds: ['hyperextension'],
    image: eq('hyperextension.png'),
    cues: ['Pad below hips', 'Neutral spine', 'Squeeze glutes at top'],
    substitutes: ['Romanian Deadlift', 'Glute bridge'],
    altExerciseIds: ['rdl', 'glute_bridge'],
  },
  bench_press: {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    muscle: 'Chest, triceps, shoulders',
    equipment: 'Barbell + bench',
    equipmentIds: ['barbell', 'bench'],
    image: eq('barbell.png'),
    cues: ['Scapulae retracted', 'Bar to mid-chest', 'Elbows ~45°'],
    substitutes: ['Smith bench press', 'Machine press', 'Dumbbell press'],
    altExerciseIds: ['smith_bench', 'machine_chest_press', 'db_press', 'pushup'],
    caution: 'Use a spotter on heavy sets',
  },
  smith_bench: {
    id: 'smith_bench',
    name: 'Smith Machine Bench Press',
    muscle: 'Chest, triceps',
    equipment: 'Smith + bench',
    equipmentIds: ['smith_machine', 'bench'],
    image: eq('smith-machine.png'),
    cues: ['Bar path over mid-chest', 'Control the lower', 'Full lockout soft'],
    substitutes: ['Machine chest press', 'Dumbbell press'],
    altExerciseIds: ['machine_chest_press', 'db_press', 'pushup'],
  },
  db_press: {
    id: 'db_press',
    name: 'Dumbbell Bench Press',
    muscle: 'Chest, triceps, shoulders',
    equipment: 'Dumbbells + bench',
    equipmentIds: ['dumbbells', 'bench'],
    image: eq('bench.png'),
    cues: ['Wrists stacked', 'Chest stretch', 'Press without hard flare'],
    substitutes: ['Machine press', 'Push-up'],
    altExerciseIds: ['machine_chest_press', 'pushup'],
  },
  machine_chest_press: {
    id: 'machine_chest_press',
    name: 'Machine Chest Press',
    muscle: 'Chest, triceps',
    equipment: 'Chest press machine',
    equipmentIds: ['chest_press_machine'],
    image: eq('chest-press.png'),
    cues: ['Shoulders packed', 'Full range', 'Control return'],
    substitutes: ['Dumbbell press', 'Push-up'],
    altExerciseIds: ['db_press', 'pushup'],
  },
  pec_deck_fly: {
    id: 'pec_deck_fly',
    name: 'Pec Deck / Butterfly',
    muscle: 'Chest',
    equipment: 'Pec deck',
    equipmentIds: ['pec_deck'],
    image: eq('pec-deck.png'),
    cues: ['Soft elbows', 'Squeeze at center', 'Do not overstretch shoulders'],
    substitutes: ['Cable crossover', 'Push-up'],
    altExerciseIds: ['cable_crossover_fly', 'pushup'],
  },
  cable_crossover_fly: {
    id: 'cable_crossover_fly',
    name: 'Cable Crossover',
    muscle: 'Chest',
    equipment: 'Cable crossover',
    equipmentIds: ['cable_crossover', 'cable'],
    image: eq('cable-crossover.png'),
    cues: ['Slight forward lean', 'Hug the tree path', 'Control the open'],
    substitutes: ['Pec deck'],
    altExerciseIds: ['pec_deck_fly'],
  },
  pushup: {
    id: 'pushup',
    name: 'Push-Up',
    muscle: 'Chest, triceps, core',
    equipment: 'Bodyweight',
    equipmentIds: ['bodyweight'],
    image: eq('dip-station.png'),
    cues: ['Body in one line', 'Chest near floor', 'Elbows ~45°'],
    substitutes: ['Machine press'],
    altExerciseIds: ['machine_chest_press'],
  },
  incline_press: {
    id: 'incline_press',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper chest, shoulders',
    equipment: 'Dumbbells + incline bench',
    equipmentIds: ['dumbbells', 'bench'],
    image: eq('bench.png'),
    cues: ['Bench 30–45°', 'Ribs down', 'Control the lower'],
    substitutes: ['Machine press', 'Push-up'],
    altExerciseIds: ['machine_chest_press', 'pushup'],
  },
  dips: {
    id: 'dips',
    name: 'Parallel Bar Dips',
    muscle: 'Chest, triceps',
    equipment: 'Dip station',
    equipmentIds: ['dip_station'],
    image: eq('dip-station.png'),
    cues: ['Slight forward lean for chest', 'Control depth', 'Stop before shoulder pain'],
    substitutes: ['Push-up', 'Triceps pushdown'],
    altExerciseIds: ['pushup', 'triceps_pushdown'],
  },
  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscle: 'Lats, biceps',
    equipment: 'Cable / multi-gym',
    equipmentIds: ['cable', 'multi_gym'],
    image: eq('cable-lat.png'),
    cues: ['Pull elbows to ribs', 'Slight lean', 'Control return'],
    substitutes: ['Pull-up', 'Dumbbell row'],
    altExerciseIds: ['pullup', 'db_row', 'machine_row'],
  },
  seated_row: {
    id: 'seated_row',
    name: 'Seated Cable Row',
    muscle: 'Back, rear delts, biceps',
    equipment: 'Cable / multi-gym',
    equipmentIds: ['cable', 'multi_gym'],
    image: eq('cable-lat.png'),
    cues: ['Neutral spine', 'Pull to lower ribs', 'Squeeze blades'],
    substitutes: ['Machine row', 'Dumbbell row'],
    altExerciseIds: ['machine_row', 'db_row'],
  },
  machine_row: {
    id: 'machine_row',
    name: 'Seated Row Machine',
    muscle: 'Back, biceps',
    equipment: 'Seated row machine',
    equipmentIds: ['seated_row_machine'],
    image: eq('seated-row-machine.png'),
    cues: ['Chest on pad', 'Pull elbows back', 'No shrug'],
    substitutes: ['Cable row', 'Dumbbell row'],
    altExerciseIds: ['seated_row', 'db_row'],
  },
  db_row: {
    id: 'db_row',
    name: 'One-Arm Dumbbell Row',
    muscle: 'Lats, mid-back',
    equipment: 'Dumbbell',
    equipmentIds: ['dumbbells'],
    image: eq('dumbbells.png'),
    cues: ['Flat back', 'Elbow past torso', 'No twist for momentum'],
    substitutes: ['Machine row'],
    altExerciseIds: ['machine_row', 'seated_row'],
  },
  pullup: {
    id: 'pullup',
    name: 'Pull-Up / Assisted',
    muscle: 'Lats, biceps',
    equipment: 'Pull-up bar',
    equipmentIds: ['pullup_bar'],
    image: eq('pullup-bar.png'),
    cues: ['Dead hang start', 'Chest to bar path', 'Full control down'],
    substitutes: ['Lat pulldown'],
    altExerciseIds: ['lat_pulldown', 'db_row'],
  },
  ohp: {
    id: 'ohp',
    name: 'Overhead Press',
    muscle: 'Shoulders, triceps',
    equipment: 'Barbell or dumbbells',
    equipmentIds: ['barbell', 'dumbbells'],
    image: eq('shoulder-press.png'),
    cues: ['Ribs down', 'Bar near face', 'No excessive lean'],
    substitutes: ['Machine shoulder press'],
    altExerciseIds: ['machine_shoulder_press', 'lateral_raise'],
  },
  machine_shoulder_press: {
    id: 'machine_shoulder_press',
    name: 'Machine Shoulder Press',
    muscle: 'Shoulders, triceps',
    equipment: 'Shoulder press machine',
    equipmentIds: ['shoulder_press_machine'],
    image: eq('shoulder-press.png'),
    cues: ['Head neutral', 'No shrug', 'Control down'],
    substitutes: ['Overhead Press', 'Lateral raise'],
    altExerciseIds: ['ohp', 'lateral_raise'],
  },
  lateral_raise: {
    id: 'lateral_raise',
    name: 'Dumbbell Lateral Raise',
    muscle: 'Side delts',
    equipment: 'Dumbbells',
    equipmentIds: ['dumbbells'],
    image: eq('dumbbells.png'),
    cues: ['Soft elbows', 'Raise just below shoulder', 'Lead with elbows'],
    substitutes: ['Cable raise'],
    altExerciseIds: [],
  },
  face_pull: {
    id: 'face_pull',
    name: 'Face Pull',
    muscle: 'Rear delts, upper back',
    equipment: 'Cable',
    equipmentIds: ['cable', 'cable_crossover'],
    image: eq('cable-crossover.png'),
    cues: ['Pull to face', 'External rotate', 'No hard shrug'],
    substitutes: ['Dumbbell row'],
    altExerciseIds: ['db_row'],
  },
  biceps_curl: {
    id: 'biceps_curl',
    name: 'Dumbbell Curl',
    muscle: 'Biceps',
    equipment: 'Dumbbells',
    equipmentIds: ['dumbbells'],
    image: eq('dumbbells.png'),
    cues: ['Elbows pinned', 'No swing', 'Full squeeze'],
    substitutes: ['EZ bar curl', 'Preacher curl'],
    altExerciseIds: ['ez_bar_curl', 'preacher_curl_ex'],
  },
  ez_bar_curl: {
    id: 'ez_bar_curl',
    name: 'EZ Bar Curl',
    muscle: 'Biceps',
    equipment: 'EZ bar',
    equipmentIds: ['ez_bar', 'barbell'],
    image: eq('ez-bar.png'),
    cues: ['Neutral-ish grip on EZ', 'No swing', 'Control eccentric'],
    substitutes: ['Dumbbell curl', 'Preacher curl'],
    altExerciseIds: ['biceps_curl', 'preacher_curl_ex'],
  },
  preacher_curl_ex: {
    id: 'preacher_curl_ex',
    name: 'Preacher Curl',
    muscle: 'Biceps',
    equipment: 'Preacher bench',
    equipmentIds: ['preacher_curl'],
    image: eq('preacher-curl.png'),
    cues: ['Armpit on pad', 'Full stretch', 'No elbow bounce'],
    substitutes: ['EZ-bar curl', 'Dumbbell curl'],
    altExerciseIds: ['ez_bar_curl', 'biceps_curl'],
  },
  triceps_pushdown: {
    id: 'triceps_pushdown',
    name: 'Triceps Pushdown',
    muscle: 'Triceps',
    equipment: 'Cable',
    equipmentIds: ['cable', 'multi_gym'],
    image: eq('cable-lat.png'),
    cues: ['Elbows fixed', 'Extend fully', 'Control return'],
    substitutes: ['Dips', 'Push-up'],
    altExerciseIds: ['dips', 'pushup'],
  },
  plank: {
    id: 'plank',
    name: 'Front Plank',
    muscle: 'Core',
    equipment: 'Mat',
    equipmentIds: ['bodyweight', 'mat'],
    image: eq('ab-crunch.png'),
    cues: ['Ribs down', 'Glutes on', 'Breathe'],
    substitutes: ['Dead bug', 'Ab machine'],
    altExerciseIds: ['dead_bug', 'ab_crunch'],
  },
  dead_bug: {
    id: 'dead_bug',
    name: 'Dead Bug',
    muscle: 'Core',
    equipment: 'Mat',
    equipmentIds: ['mat', 'bodyweight'],
    image: eq('ab-crunch.png'),
    cues: ['Low back pressed down', 'Slow opposite limbs', 'Exhale on extend'],
    substitutes: ['Plank'],
    altExerciseIds: ['plank'],
  },
  ab_crunch: {
    id: 'ab_crunch',
    name: 'Ab Crunch Machine',
    muscle: 'Abs',
    equipment: 'Ab crunch machine',
    equipmentIds: ['ab_crunch_machine'],
    image: eq('ab-crunch.png'),
    cues: ['Curl ribs to pelvis', 'Do not yank neck', 'Control return'],
    substitutes: ['Plank'],
    altExerciseIds: ['plank', 'dead_bug'],
  },
  farmer_carry: {
    id: 'farmer_carry',
    name: 'Farmer Carry',
    muscle: 'Grip, core, traps',
    equipment: 'Dumbbells / kettlebells',
    equipmentIds: ['dumbbells', 'kettlebell'],
    image: eq('kettlebells.png'),
    cues: ['Tall posture', 'Short steps', 'No side lean'],
    substitutes: ['Plank'],
    altExerciseIds: ['plank'],
  },
  bike_easy: {
    id: 'bike_easy',
    name: 'Easy Bike / Walk / Elliptical',
    muscle: 'Cardio / recovery',
    equipment: 'Bike, treadmill, or elliptical',
    equipmentIds: ['cardio_bike', 'treadmill', 'elliptical', 'bodyweight'],
    image: eq('treadmill.png'),
    cues: ['Conversational pace', 'Easy breathing', 'Joints happy'],
    substitutes: ['Outdoor walk'],
    altExerciseIds: ['mobility_flow'],
  },
  mobility_flow: {
    id: 'mobility_flow',
    name: 'Mobility Flow',
    muscle: 'Hips, T-spine, ankles',
    equipment: 'Mat',
    equipmentIds: ['mat', 'bodyweight'],
    image: eq('ab-crunch.png'),
    cues: ['World’s greatest stretch × 5/side', 'Cat-cow × 8', 'Ankle rocks × 10/side'],
    substitutes: ['Easy walk'],
    altExerciseIds: [],
  },
}

const needsAll: Record<string, EquipmentId[]> = {
  bench_press: ['barbell', 'bench'],
  smith_bench: ['smith_machine', 'bench'],
  db_press: ['dumbbells', 'bench'],
  incline_press: ['dumbbells', 'bench'],
}

const FREE_EQUIPMENT = new Set<EquipmentId>(['bodyweight', 'mat'])

export function canDoExercise(ex: Exercise, available: EquipmentId[]): boolean {
  if (!ex.equipmentIds.length) return true
  const bag = new Set(expandEquipment(available))
  // bodyweight/mat are always injected — don't let them unlock machine exercises
  const dedicated = ex.equipmentIds.filter((id) => !FREE_EQUIPMENT.has(id))
  if (dedicated.length > 0) {
    return dedicated.some((id) => bag.has(id))
  }
  return ex.equipmentIds.some((id) => bag.has(id))
}

export function isExerciseAvailable(exId: string, available: EquipmentId[]): boolean {
  const ex = exercises[exId]
  if (!ex) return false
  const bag = new Set(expandEquipment(available))
  const allReq = needsAll[exId]
  if (allReq) {
    // smith expands to barbell, but smith_bench needs smith specifically
    if (exId === 'smith_bench') return allReq.every((id) => bag.has(id))
    if (exId === 'bench_press') {
      return (
        (bag.has('barbell') && bag.has('bench')) ||
        (bag.has('smith_machine') && bag.has('bench'))
      )
    }
    return allReq.every((id) => bag.has(id))
  }
  return canDoExercise(ex, available)
}

/** Returns null when preferred + all alts need gear the user did not select. */
export function resolveExerciseId(
  preferredId: string,
  available: EquipmentId[],
): string | null {
  const bag = new Set(expandEquipment(available))
  if (preferredId === 'bench_press') {
    if (bag.has('barbell') && bag.has('bench')) return 'bench_press'
    if (bag.has('smith_machine') && bag.has('bench')) return 'smith_bench'
  }
  if (preferredId === 'goblet_squat') {
    if (isExerciseAvailable('goblet_squat', available)) return 'goblet_squat'
    if (bag.has('hack_squat')) return 'hack_squat'
    if (bag.has('smith_machine')) return 'smith_squat'
  }
  if (isExerciseAvailable(preferredId, available)) return preferredId
  const preferred = exercises[preferredId]
  if (!preferred) return null
  for (const alt of preferred.altExerciseIds) {
    if (isExerciseAvailable(alt, available)) return alt
  }
  return null
}

export function getExercise(id: string): Exercise {
  const ex = exercises[id]
  if (!ex) throw new Error(`Unknown exercise: ${id}`)
  return ex
}
