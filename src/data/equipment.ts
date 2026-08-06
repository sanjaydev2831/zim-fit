export type EquipmentId =
  | 'bodyweight'
  | 'mat'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'ez_bar'
  | 'bench'
  | 'cable'
  | 'cable_crossover'
  | 'multi_gym'
  | 'smith_machine'
  | 'leg_press'
  | 'hack_squat'
  | 'leg_extension'
  | 'leg_curl'
  | 'calf_machine'
  | 'pullup_bar'
  | 'dip_station'
  | 'chest_press_machine'
  | 'shoulder_press_machine'
  | 'pec_deck'
  | 'seated_row_machine'
  | 'preacher_curl'
  | 'hip_thrust_setup'
  | 'hyperextension'
  | 'ab_crunch_machine'
  | 'cardio_bike'
  | 'treadmill'
  | 'elliptical'

export interface GymEquipment {
  id: EquipmentId
  name: string
  category: 'free_weights' | 'machines' | 'cable' | 'body' | 'cardio'
  description: string
  image: string
  alwaysAvailable?: boolean
}

const img = (file: string) => `/equipment/${file}`

export const gymEquipment: GymEquipment[] = [
  {
    id: 'bodyweight',
    name: 'Bodyweight space',
    category: 'body',
    description: 'Floor space for push-ups, planks, lunges',
    image: img('dumbbells.png'),
    alwaysAvailable: true,
  },
  {
    id: 'mat',
    name: 'Exercise mat',
    category: 'body',
    description: 'Mobility and core work',
    image: img('ab-crunch.png'),
    alwaysAvailable: true,
  },
  {
    id: 'dumbbells',
    name: 'Dumbbells',
    category: 'free_weights',
    description: 'Fixed / adjustable dumbbell rack — every Indian gym staple',
    image: img('dumbbells.png'),
  },
  {
    id: 'barbell',
    name: 'Barbell + plates',
    category: 'free_weights',
    description: 'Olympic bar, squat rack / bench press station',
    image: img('barbell.png'),
  },
  {
    id: 'ez_bar',
    name: 'EZ curl bar',
    category: 'free_weights',
    description: 'Curls and skull crushers — common in India gyms',
    image: img('ez-bar.png'),
  },
  {
    id: 'kettlebell',
    name: 'Kettlebells',
    category: 'free_weights',
    description: 'Goblet squats, swings, carries',
    image: img('kettlebells.png'),
  },
  {
    id: 'bench',
    name: 'Flat / incline bench',
    category: 'free_weights',
    description: 'Presses, supported rows, hip thrusts',
    image: img('bench.png'),
  },
  {
    id: 'smith_machine',
    name: 'Smith machine',
    category: 'machines',
    description: 'Guided squat / press — very common in Indian gyms',
    image: img('smith-machine.png'),
  },
  {
    id: 'multi_gym',
    name: 'Multi-gym station',
    category: 'machines',
    description: 'Combo lat / row / butterfly unit found in many local gyms',
    image: img('multi-gym.png'),
  },
  {
    id: 'cable',
    name: 'Lat pulldown / cable tower',
    category: 'cable',
    description: 'Pulldowns, rows, pushdowns',
    image: img('cable-lat.png'),
  },
  {
    id: 'cable_crossover',
    name: 'Cable crossover',
    category: 'cable',
    description: 'Dual-pulley flyes and functional cable work',
    image: img('cable-crossover.png'),
  },
  {
    id: 'leg_press',
    name: 'Leg press (45°)',
    category: 'machines',
    description: 'Plate-loaded or pin-loaded sled',
    image: img('leg-press.png'),
  },
  {
    id: 'hack_squat',
    name: 'Hack squat',
    category: 'machines',
    description: 'Angled sled squat — popular India commercial gym machine',
    image: img('hack-squat.png'),
  },
  {
    id: 'leg_extension',
    name: 'Leg extension',
    category: 'machines',
    description: 'Quad isolation machine',
    image: img('leg-extension.png'),
  },
  {
    id: 'leg_curl',
    name: 'Leg curl',
    category: 'machines',
    description: 'Lying or seated hamstring curl',
    image: img('leg-curl.png'),
  },
  {
    id: 'calf_machine',
    name: 'Calf raise machine',
    category: 'machines',
    description: 'Standing or seated calf raise',
    image: img('calf-machine.png'),
  },
  {
    id: 'chest_press_machine',
    name: 'Chest press machine',
    category: 'machines',
    description: 'Plate-loaded or selectorized press',
    image: img('chest-press.png'),
  },
  {
    id: 'pec_deck',
    name: 'Pec deck / butterfly',
    category: 'machines',
    description: 'Chest fly machine — classic Indian gym staple',
    image: img('pec-deck.png'),
  },
  {
    id: 'shoulder_press_machine',
    name: 'Shoulder press machine',
    category: 'machines',
    description: 'Seated overhead press',
    image: img('shoulder-press.png'),
  },
  {
    id: 'seated_row_machine',
    name: 'Seated row machine',
    category: 'machines',
    description: 'Plate-loaded or pin row with chest pad',
    image: img('seated-row-machine.png'),
  },
  {
    id: 'preacher_curl',
    name: 'Preacher curl bench',
    category: 'machines',
    description: 'Arm curl desk / Scott bench',
    image: img('preacher-curl.png'),
  },
  {
    id: 'pullup_bar',
    name: 'Pull-up / assist tower',
    category: 'machines',
    description: 'Chin-up bar or assisted pull-up',
    image: img('pullup-bar.png'),
  },
  {
    id: 'dip_station',
    name: 'Dip / parallel bars',
    category: 'machines',
    description: 'Dips and knee raises',
    image: img('dip-station.png'),
  },
  {
    id: 'hip_thrust_setup',
    name: 'Hip thrust setup',
    category: 'machines',
    description: 'Bench + pad or glute drive machine',
    image: img('hip-thrust.png'),
  },
  {
    id: 'hyperextension',
    name: 'Roman chair / hyperextension',
    category: 'machines',
    description: 'Back extensions and side bends',
    image: img('hyperextension.png'),
  },
  {
    id: 'ab_crunch_machine',
    name: 'Ab crunch machine',
    category: 'machines',
    description: 'Seated crunch with weight stack',
    image: img('ab-crunch.png'),
  },
  {
    id: 'cardio_bike',
    name: 'Exercise bike',
    category: 'cardio',
    description: 'Upright or spin bike for warm-up',
    image: img('cardio-bike.png'),
  },
  {
    id: 'treadmill',
    name: 'Treadmill',
    category: 'cardio',
    description: 'Walking / jogging warm-up and recovery',
    image: img('treadmill.png'),
  },
  {
    id: 'elliptical',
    name: 'Elliptical / cross trainer',
    category: 'cardio',
    description: 'Low-impact cardio — common in city gyms',
    image: img('elliptical.png'),
  },
]

export const selectableEquipment = gymEquipment.filter((e) => !e.alwaysAvailable)

export const defaultEquipmentIds: EquipmentId[] = selectableEquipment.map((e) => e.id)

export function getEquipment(id: EquipmentId): GymEquipment | undefined {
  return gymEquipment.find((e) => e.id === id)
}

/** Expand multi-gym / crossover into virtual gear for exercise matching */
export function expandEquipment(selected: EquipmentId[]): EquipmentId[] {
  const set = new Set<EquipmentId>([...selected, 'bodyweight', 'mat'])
  if (set.has('multi_gym')) {
    set.add('cable')
    set.add('pec_deck')
    set.add('seated_row_machine')
  }
  if (set.has('cable_crossover')) {
    set.add('cable')
  }
  return [...set]
}

export const daysPerWeekOptions = [
  { days: 2 as const, title: '2 days', blurb: 'Full body twice · best if time is tight' },
  { days: 3 as const, title: '3 days', blurb: 'Classic full-body trainer split' },
  { days: 4 as const, title: '4 days', blurb: 'Upper / Lower · solid growth volume' },
  { days: 5 as const, title: '5 days', blurb: 'Push / Pull / Legs + extras' },
  { days: 6 as const, title: '6 days', blurb: 'Push / Pull / Legs twice · advanced density' },
]

export type DaysPerWeek = (typeof daysPerWeekOptions)[number]['days']

export const sessionDurationOptions = [
  {
    minutes: 30 as const,
    title: '30 min',
    blurb: '4 key lifts · busy-day session',
    exerciseCount: 4,
  },
  {
    minutes: 45 as const,
    title: '45 min',
    blurb: '6 exercises · standard trainer session',
    exerciseCount: 6,
  },
  {
    minutes: 60 as const,
    title: '60 min',
    blurb: '8 exercises · add accessories',
    exerciseCount: 8,
  },
  {
    minutes: 75 as const,
    title: '75 min',
    blurb: '10 exercises · full volume day',
    exerciseCount: 10,
  },
]

export type SessionDuration = (typeof sessionDurationOptions)[number]['minutes']

export function exerciseCountForDuration(minutes: SessionDuration): number {
  return sessionDurationOptions.find((o) => o.minutes === minutes)?.exerciseCount ?? 6
}
