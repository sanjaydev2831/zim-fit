export interface PrecautionItem {
  title: string
  detail: string
}

export interface SourceRef {
  name: string
  what: string
  url: string
}

/** Evidence-backed limits & precautions for the trainer guide */
export const redFlagsStopNow: PrecautionItem[] = [
  {
    title: 'Chest discomfort with exertion',
    detail:
      'Pressure, pain, or tightness in the chest, jaw, neck, or arm during exercise. Stop and seek medical care.',
  },
  {
    title: 'Unreasonable breathlessness',
    detail:
      'Shortness of breath that is out of proportion to effort, especially if new or sudden.',
  },
  {
    title: 'Dizziness, fainting, or blackouts',
    detail: 'Lightheadedness or loss of consciousness — stop immediately and get evaluated.',
  },
  {
    title: 'Irregular or racing heartbeat awareness',
    detail:
      'Unpleasant awareness of a forceful, rapid, or irregular heart rate that is unusual for you.',
  },
  {
    title: 'Leg pain / claudication',
    detail:
      'Burning or cramping in the lower legs when walking short distances — may need clearance.',
  },
]

export const beforeYouTrain: PrecautionItem[] = [
  {
    title: 'Medical clearance when needed',
    detail:
      'If you have known cardiovascular, metabolic (e.g. diabetes), or renal disease and are inactive — or if you have any red-flag symptoms — get medical clearance before starting or advancing intensity (ACSM preparticipation screening).',
  },
  {
    title: 'PAR-Q+ style self-screen',
    detail:
      'Answer health questions honestly. A “yes” to heart disease history, chest pain, dizziness, or uncontrolled conditions means pause and talk to a clinician or qualified exercise professional.',
  },
  {
    title: 'Temporary illness',
    detail:
      'Delay training with fever, acute infection, or feeling markedly unwell. Resume when recovered, usually with a lighter session first.',
  },
  {
    title: 'Pregnancy',
    detail:
      'Do not follow this general gym plan without guidance from your healthcare provider and a qualified professional (ePARmed-X+ / prenatal modifications).',
  },
  {
    title: 'Age 45+ and new to vigorous work',
    detail:
      'If you are not used to vigorous or near-maximal effort, consult a qualified exercise professional before jumping into heavy loading or HIIT.',
  },
]

export const trainingLimitations: PrecautionItem[] = [
  {
    title: 'Progressive overload — not sudden spikes',
    detail:
      'NSCA-aligned guidance: increase load, volume, or frequency gradually. A practical ceiling many coaches use is ~10% weekly load/volume change, and avoid raising intensity, volume, and frequency all at once.',
  },
  {
    title: '2–3 reps in reserve (RIR)',
    detail:
      'ACSM 2026 synthesis: you do not need to train to absolute failure for general fitness. Leave about 2–3 reps in the tank for safer, more sustainable progress.',
  },
  {
    title: 'Major muscle groups ≥2× / week',
    detail:
      'For most healthy adults, hitting each major muscle group at least twice weekly matters more than complex periodization.',
  },
  {
    title: 'Strength vs hypertrophy targets',
    detail:
      'Strength bias: heavier loads (~80% 1RM), 2–3 sets. Hypertrophy bias: higher weekly volume (~10 sets per muscle group). Power: moderate loads moved quickly on the concentric.',
  },
  {
    title: 'Recovery is part of the plan',
    detail:
      'Sleep, protein intake, and rest days drive adaptation. Chronic fatigue, stalled lifts, or joint pain that worsens session-to-session = deload or regress.',
  },
  {
    title: 'Technique before ego loading',
    detail:
      'If form breaks, reduce the load. Free weights and machines both work; choose what you can perform safely and consistently.',
  },
  {
    title: 'Joint / prior injury limits',
    detail:
      'Pain (sharp, worsening, or radiating) is a stop signal. Swap to listed substitutes or see a clinician/physio. This app is not rehab.',
  },
  {
    title: 'Aerobic minimums (HHS / ACSM)',
    detail:
      'Alongside lifting: aim toward 150+ min/week moderate cardio or 75+ min vigorous, as tolerated — optional easy sessions are built into recovery days.',
  },
]

export const whatThisGuideIsNot: string[] = [
  'Not a medical diagnosis, rehab protocol, or substitute for a physician, PT, or certified coach for clinical conditions.',
  'Not optimized for competitive powerlifting/bodybuilding peaking — it is a general progressive gym system.',
  'Not personalized for disability, post-surgery timelines, or uncontrolled hypertension/diabetes without clinician input.',
]

export const sources: SourceRef[] = [
  {
    name: 'ACSM Position Stand (2026)',
    what: 'Resistance training prescription for muscle function, hypertrophy, and performance in healthy adults — consistency, ≥2×/week major groups, goal-based load/volume.',
    url: 'https://acsm.org/resistance-training-guidelines-update-2026/',
  },
  {
    name: 'ACSM Progression Models (2009 baseline)',
    what: 'Classic progression ranges for novice→advanced frequency, RM zones, and 2–10% load increases when reps exceed target.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19204579/',
  },
  {
    name: 'NSCA Foundations / Basics of S&C',
    what: 'Progressive overload, variation, recovery, and frequency by training status.',
    url: 'https://www.nsca.com/',
  },
  {
    name: 'Physical Activity Guidelines for Americans',
    what: 'Adult aerobic and muscle-strengthening minimums (HHS / ACSM summary).',
    url: 'https://acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines/',
  },
  {
    name: 'ACSM / EIM Preparticipation Screening',
    what: 'Symptom checklist and when medical clearance is recommended before exercise.',
    url: 'https://www.exerciseismedicine.org/wp-content/uploads/2021/04/EIM-exercise-preparticipation-screening.pdf',
  },
  {
    name: 'PAR-Q+',
    what: 'Evidence-based self-screening questionnaire before becoming more active.',
    url: 'https://eparmedx.com/',
  },
]
