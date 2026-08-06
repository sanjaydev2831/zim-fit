/** Full forms for short training keywords shown in the UI */

export const glossary: Record<string, { short: string; full: string; meaning: string }> = {
  rpe: {
    short: 'RPE',
    full: 'Rate of Perceived Exertion',
    meaning: 'How hard a set feels from 1 (easy) to 10 (max effort). RPE 7 ≈ 3 reps left.',
  },
  rir: {
    short: 'RIR',
    full: 'Reps In Reserve',
    meaning: 'How many more clean reps you could do. 2 RIR = stop with 2 left.',
  },
  amrap: {
    short: 'AMRAP',
    full: 'As Many Reps As Possible',
    meaning: 'Do as many quality reps as you can. AMRAP−2 means stop 2 before failure.',
  },
  rm: {
    short: '1RM',
    full: 'One-Repetition Maximum',
    meaning: 'Heaviest load you could lift for a single clean rep.',
  },
  db: {
    short: 'DB',
    full: 'Dumbbell',
    meaning: 'Hand weight — usually one in each hand.',
  },
  bb: {
    short: 'BB',
    full: 'Barbell',
    meaning: 'Long bar with weight plates.',
  },
  rdl: {
    short: 'RDL',
    full: 'Romanian Deadlift',
    meaning: 'Hip-hinge deadlift with soft knees, emphasis on hamstrings.',
  },
  ohp: {
    short: 'OHP',
    full: 'Overhead Press',
    meaning: 'Press a bar or dumbbells from shoulders to lockout overhead.',
  },
}

export function formatRpe(rpe: string): string {
  return `Effort ${rpe}/10 · Rate of Perceived Exertion`
}

export function formatReps(reps: string): { display: string; detail?: string } {
  const raw = reps.trim()
  if (/^AMRAP/i.test(raw)) {
    const minus = raw.match(/[−-](\d+)/)
    if (minus) {
      return {
        display: `As Many Reps As Possible (stop ${minus[1]} short)`,
        detail: 'AMRAP = As Many Reps As Possible — keep 2 clean reps in reserve.',
      }
    }
    return {
      display: 'As Many Reps As Possible',
      detail: 'AMRAP = As Many Reps As Possible — stop before form breaks.',
    }
  }
  if (/^\d+\s*[–-]\s*\d+$/.test(raw) || /^\d+$/.test(raw)) {
    return { display: `${raw} repetitions` }
  }
  if (/s$/i.test(raw) || /min/i.test(raw) || /m$/i.test(raw)) {
    return { display: raw }
  }
  if (/\/(leg|side)/i.test(raw)) {
    return { display: `${raw} repetitions` }
  }
  return { display: raw }
}

export function formatDayType(dayType: string): string {
  const map: Record<string, string> = {
    train: 'Training day',
    active_recovery: 'Active recovery',
    rest: 'Full rest',
    deload: 'Deload (lighter week)',
  }
  return map[dayType] ?? dayType.replace(/_/g, ' ')
}

export function formatFocus(focus: string): string {
  const map: Record<string, string> = {
    full_body: 'Full body',
    upper: 'Upper body',
    lower: 'Lower body',
    push: 'Push (chest, shoulders, triceps)',
    pull: 'Pull (back, biceps)',
    legs: 'Legs',
    mobility: 'Mobility',
    cardio: 'Cardio / recovery',
  }
  return map[focus] ?? focus.replace(/_/g, ' ')
}

export function expandAbbreviations(text: string): string {
  return text
    .replace(/\bRPE\b/g, 'Rate of Perceived Exertion (RPE)')
    .replace(/\bRIR\b/g, 'Reps In Reserve (RIR)')
    .replace(/\bAMRAP\b/g, 'As Many Reps As Possible (AMRAP)')
    .replace(/\b1RM\b/g, 'one-rep max (1RM)')
    .replace(/\bOHP\b/g, 'Overhead Press (OHP)')
    .replace(/\bRDL\b/g, 'Romanian Deadlift (RDL)')
    .replace(/\bDB\b/g, 'dumbbell')
}
