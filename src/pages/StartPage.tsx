import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  defaultRestWeekdays,
  formatWeekdayList,
  restDayCount,
  type DaysPerWeek,
  type EquipmentId,
  type SessionDuration,
} from '../data/equipment'
import type { FocusGuideId } from '../data/focusGuides'
import { levelCopy } from '../data/program'
import type { ExperienceLevel, UserProfile } from '../data/types'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useProgressContext } from '../context/ProgressContext'
import { aiPersonalizeFromSetup, isApiConfigured } from '../lib/api'

type Step = 'equipment' | 'days' | 'duration' | 'profile' | 'extras' | 'screen'

const INJURY_OPTIONS = [
  { id: 'knees', label: 'Knees' },
  { id: 'lower_back', label: 'Lower back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'wrists', label: 'Wrists' },
  { id: 'elbows', label: 'Elbows' },
  { id: 'hips', label: 'Hips' },
] as const

const TRAINING_AGE_OPTIONS = [
  { months: 0, label: 'New to lifting', blurb: 'Less than 3 months' },
  { months: 6, label: 'Getting started', blurb: '3–12 months' },
  { months: 18, label: 'Some experience', blurb: '1–3 years (maybe rusty)' },
  { months: 36, label: 'Consistent', blurb: '3+ years' },
] as const

export function StartPage() {
  const { start, addFocusGuide, updateProfile, hydrateFromRemote } = useProgressContext()
  const { loggedIn, apiReady } = useAuth()
  const { selectableEquipment, options, safety, focusGuides } = useCatalog()
  const navigate = useNavigate()
  const defaultEquipmentIds = selectableEquipment.map((e) => e.id as EquipmentId)

  const [step, setStep] = useState<Step>('equipment')
  const [equipment, setEquipment] = useState<EquipmentId[]>(() => [...defaultEquipmentIds])
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(3)
  const [restWeekdays, setRestWeekdays] = useState<number[]>(() => defaultRestWeekdays(3))
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(45)
  const [name, setName] = useState('')
  const [heightCm, setHeightCm] = useState(170)
  const [weightKg, setWeightKg] = useState(70)
  const [level, setLevel] = useState<ExperienceLevel>('beginner')
  const [goal, setGoal] = useState<UserProfile['goal']>('general')
  const [trainingAgeMonths, setTrainingAgeMonths] = useState(0)
  const [focusAreas, setFocusAreas] = useState<FocusGuideId[]>([])
  const [injuries, setInjuries] = useState<string[]>([])
  const [sleepHours, setSleepHours] = useState(7)
  const [notes, setNotes] = useState('')
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [ack, setAck] = useState(false)
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  const neededRest = restDayCount(daysPerWeek)
  const restPickedOk = restWeekdays.length === neededRest
  const bodyOk = heightCm >= 120 && heightCm <= 230 && weightKg >= 35 && weightKg <= 200
  const anyFlag = useMemo(() => Object.values(flags).some(Boolean), [flags])
  const canFinish = ack && name.trim().length > 0 && restPickedOk && bodyOk

  const stepIndex = { equipment: 1, days: 2, duration: 3, profile: 4, extras: 5, screen: 6 }[step]
  const exerciseCount =
    options.sessionDuration.find((o) => o.minutes === sessionDuration)?.exerciseCount ?? 6

  function chooseDaysPerWeek(days: DaysPerWeek) {
    setDaysPerWeek(days)
    setRestWeekdays(defaultRestWeekdays(days))
  }

  function toggleRestDay(day: number) {
    setRestWeekdays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day)
      if (prev.length >= neededRest) {
        return [...prev.slice(0, neededRest - 1), day].sort((a, b) => a - b)
      }
      return [...prev, day].sort((a, b) => a - b)
    })
  }

  function toggleEquipment(id: EquipmentId) {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function toggleFocus(id: FocusGuideId) {
    setFocusAreas((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  function toggleInjury(id: string) {
    setInjuries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canFinish || building) return
    setBuilding(true)
    setBuildError(null)

    const medicalClearanceNeeded = anyFlag
    const profileBase = {
      name: name.trim(),
      level,
      goal,
      daysPerWeek,
      restWeekdays,
      sessionDuration,
      availableEquipment: equipment,
      heightCm,
      weightKg,
      screened: true,
      medicalClearanceNeeded,
      injuries,
      preferredGuides: focusAreas,
      trainingAgeMonths,
      notes: notes.trim() || null,
    }

    try {
      await start(profileBase)

      for (const guideId of focusAreas.slice(0, 2)) {
        addFocusGuide(guideId)
      }

      // Gemini enriches summary / tips from the completed setup (does not override choices)
      if (isApiConfigured() && apiReady) {
        try {
          const result = await aiPersonalizeFromSetup({
            ...profileBase,
            sleepHours,
            redFlags: Object.entries(flags)
              .filter(([, on]) => on)
              .map(([title]) => title),
            apply: loggedIn,
          })
          if (result.progress) {
            hydrateFromRemote(result.progress)
          } else {
            updateProfile({
              aiSummary: result.summary,
              aiPlanNotes: result.planNotes,
              preferredGuides: result.preferredGuides.length
                ? result.preferredGuides
                : focusAreas,
            })
            for (const guideId of result.preferredGuides.slice(0, 2)) {
              if (!focusAreas.includes(guideId)) addFocusGuide(guideId)
            }
          }
        } catch {
          // Setup still succeeds without AI enrichment
        }
      }

      navigate(medicalClearanceNeeded ? '/safety' : '/train')
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Could not build your guide')
    } finally {
      setBuilding(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <p className="muted" style={{ margin: 0 }}>
            Setup · step {stepIndex} of 6
          </p>
          <h1 className="display">
            {step === 'equipment' && 'Indian gym gear'}
            {step === 'days' && 'Training days'}
            {step === 'duration' && 'Session length'}
            {step === 'profile' && 'About you'}
            {step === 'extras' && 'Focus & limits'}
            {step === 'screen' && 'Safety screen'}
          </h1>
          <p>
            {step === 'equipment' &&
              'Select machines common in Indian gyms. Workouts swap to what you have.'}
            {step === 'days' &&
              'Choose how many days you train, then tap which weekdays are rest.'}
            {step === 'duration' &&
              'Longer sessions unlock more exercises. Shorter sessions keep the key lifts.'}
            {step === 'profile' &&
              'Level, goal, and body metrics shape progression and suggested loads.'}
            {step === 'extras' &&
              'Pick focus areas and any joint limits — your 12-week guide and specialty work use this.'}
            {step === 'screen' && 'ACSM-style symptom check — not a medical diagnosis.'}
          </p>
        </div>

        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${(stepIndex / 6) * 100}%` }} />
        </div>

        {step === 'equipment' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEquipment([...defaultEquipmentIds])}
              >
                Select all
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEquipment([])}>
                Clear
              </button>
            </div>
            <div className="equip-grid">
              {selectableEquipment.map((item) => {
                const id = item.id as EquipmentId
                const on = equipment.includes(id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`equip-card ${on ? 'selected' : ''}`}
                    onClick={() => toggleEquipment(id)}
                    aria-pressed={on}
                  >
                    <img src={item.image} alt="" loading="lazy" />
                    <div className="equip-card-body">
                      <strong>{item.name}</strong>
                      <span>{item.description}</span>
                    </div>
                    <span className="equip-check">{on ? '✓' : ''}</span>
                  </button>
                )
              })}
            </div>
            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Bodyweight + mat always included · Selected: {equipment.length}
            </p>
            <button
              className="btn btn-primary"
              type="button"
              style={{ marginTop: '1rem' }}
              onClick={() => setStep('days')}
            >
              Next · training days
            </button>
          </div>
        )}

        {step === 'days' && (
          <div>
            <div className="choice-grid">
              {options.daysPerWeek.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  className={`choice ${daysPerWeek === opt.days ? 'selected' : ''}`}
                  onClick={() => chooseDaysPerWeek(opt.days as DaysPerWeek)}
                >
                  <strong>{opt.title}</strong>
                  <span>{opt.blurb}</span>
                </button>
              ))}
            </div>

            <div className="panel" style={{ marginTop: '1.25rem' }}>
              <p style={{ marginTop: 0, fontWeight: 800, fontFamily: 'var(--font-body)' }}>
                Your rest days
              </p>
              <p className="muted" style={{ marginTop: 0 }}>
                Tap {neededRest} day{neededRest === 1 ? '' : 's'} to rest.
              </p>
              <div className="weekday-pick">
                {options.weekdayShortLabels.map((label, i) => {
                  const day = i + 1
                  const isRest = restWeekdays.includes(day)
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`weekday-chip ${isRest ? 'rest' : 'train'}`}
                      onClick={() => toggleRestDay(day)}
                      aria-pressed={isRest}
                    >
                      <strong>{label}</strong>
                      <span>{isRest ? 'Rest' : 'Train'}</span>
                    </button>
                  )
                })}
              </div>
              <p
                className={restPickedOk ? 'accent' : 'muted'}
                style={{
                  marginBottom: 0,
                  marginTop: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                }}
              >
                {restPickedOk
                  ? `Rest: ${formatWeekdayList(restWeekdays)}`
                  : `Select ${neededRest - restWeekdays.length} more rest day${
                      neededRest - restWeekdays.length === 1 ? '' : 's'
                    }`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('equipment')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!restPickedOk}
                onClick={() => setStep('duration')}
              >
                Next · session length
              </button>
            </div>
          </div>
        )}

        {step === 'duration' && (
          <div>
            <div className="choice-grid">
              {options.sessionDuration.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  className={`choice ${sessionDuration === opt.minutes ? 'selected' : ''}`}
                  onClick={() => setSessionDuration(opt.minutes as SessionDuration)}
                >
                  <strong>{opt.title}</strong>
                  <span>
                    {opt.blurb} · {opt.exerciseCount} exercises
                  </span>
                </button>
              ))}
            </div>
            <p className="muted" style={{ marginTop: '1rem' }}>
              ~{sessionDuration} min sessions with {exerciseCount} working exercises.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('days')}>
                Back
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setStep('profile')}>
                Next · about you
              </button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div>
            <div className="panel">
              <label className="muted" htmlFor="name" style={{ display: 'block', marginBottom: 8 }}>
                What should we call you?
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'var(--bg-soft)',
                  color: 'var(--text)',
                }}
                required
              />
            </div>

            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Height &amp; weight
              </p>
              <div className="body-metrics">
                <label>
                  <span className="muted">Height (cm)</span>
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 4,
                      border: '1px solid var(--line)',
                      background: 'var(--bg-soft)',
                      color: 'var(--text)',
                      marginTop: 6,
                    }}
                  />
                </label>
                <label>
                  <span className="muted">Weight (kg)</span>
                  <input
                    type="number"
                    min={35}
                    max={200}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 4,
                      border: '1px solid var(--line)',
                      background: 'var(--bg-soft)',
                      color: 'var(--text)',
                      marginTop: 6,
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Experience level
              </p>
              <div className="choice-grid">
                {(Object.keys(levelCopy) as ExperienceLevel[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`choice ${level === key ? 'selected' : ''}`}
                    onClick={() => setLevel(key)}
                  >
                    <strong>{levelCopy[key].title}</strong>
                    <span>{levelCopy[key].blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                How long have you lifted?
              </p>
              <div className="choice-grid">
                {TRAINING_AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    className={`choice ${trainingAgeMonths === opt.months ? 'selected' : ''}`}
                    onClick={() => setTrainingAgeMonths(opt.months)}
                  >
                    <strong>{opt.label}</strong>
                    <span>{opt.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Primary goal
              </p>
              <div className="choice-grid">
                {(
                  [
                    ['general', 'General fitness'],
                    ['hypertrophy', 'Muscle growth'],
                    ['strength', 'Strength'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`choice ${goal === id ? 'selected' : ''}`}
                    onClick={() => setGoal(id)}
                  >
                    <strong>{label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('duration')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!name.trim() || !bodyOk}
                onClick={() => setStep('extras')}
              >
                Next · focus & limits
              </button>
            </div>
          </div>
        )}

        {step === 'extras' && (
          <div>
            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Extra focus areas (optional · max 2)
              </p>
              <div className="choice-grid">
                {focusGuides.map((g) => {
                  const id = g.id as FocusGuideId
                  const on = focusAreas.includes(id)
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`choice ${on ? 'selected' : ''}`}
                      onClick={() => toggleFocus(id)}
                      aria-pressed={on}
                    >
                      <strong>{g.name}</strong>
                      <span>{g.tagline}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Joint or soft-tissue limits (optional)
              </p>
              <div className="choice-grid">
                {INJURY_OPTIONS.map((opt) => {
                  const on = injuries.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`choice ${on ? 'selected' : ''}`}
                      onClick={() => toggleInjury(opt.id)}
                      aria-pressed={on}
                    >
                      <strong>{opt.label}</strong>
                    </button>
                  )
                })}
              </div>
              <p className="muted" style={{ marginBottom: 0, fontSize: '0.9rem' }}>
                We keep volume sensible and avoid aggravating patterns — not a diagnosis.
              </p>
            </div>

            <div className="panel">
              <label className="muted" htmlFor="sleep" style={{ display: 'block', marginBottom: 8 }}>
                Typical sleep (hours / night)
              </label>
              <input
                id="sleep"
                type="number"
                min={4}
                max={12}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                style={{
                  width: '100%',
                  maxWidth: 160,
                  padding: '0.85rem 1rem',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'var(--bg-soft)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="panel">
              <label className="muted" htmlFor="notes" style={{ display: 'block', marginBottom: 8 }}>
                Anything else for your coach? (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder="e.g. Prefer morning sessions, avoid barbell back squat…"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'var(--bg-soft)',
                  color: 'var(--text)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('profile')}>
                Back
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setStep('screen')}>
                Next · safety
              </button>
            </div>
          </div>
        )}

        {step === 'screen' && (
          <form onSubmit={(e) => void onSubmit(e)}>
            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Do you currently experience any of these?
              </p>
              <ul className="check-list">
                {safety.redFlags.map((item) => (
                  <li key={item.title}>
                    <input
                      type="checkbox"
                      checked={Boolean(flags[item.title])}
                      onChange={(e) =>
                        setFlags((prev) => ({ ...prev, [item.title]: e.target.checked }))
                      }
                      aria-label={item.title}
                    />
                    <div>
                      <strong>{item.title}</strong>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>
                        {item.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {anyFlag && (
                <div className="alert">
                  Get medical clearance before hard training. You can still browse the plan.
                </div>
              )}
            </div>

            <div className="panel">
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  style={{ marginTop: 4, accentColor: 'var(--accent)' }}
                />
                <span>
                  I understand ZYM FIT is educational, not medical advice, and I will stop for
                  warning symptoms.
                </span>
              </label>
            </div>

            <div className="panel">
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                <strong className="accent">{daysPerWeek} days/week</strong>
                <span className="muted">
                  {' '}
                  · {goal} · {level} · Rest {formatWeekdayList(restWeekdays)} · {heightCm} cm /{' '}
                  {weightKg} kg · {sessionDuration} min · {equipment.length} machines
                  {focusAreas.length ? ` · Focus: ${focusAreas.join(', ')}` : ''}
                  {injuries.length ? ` · Limits: ${injuries.join(', ')}` : ''}
                </span>
              </p>
            </div>

            {buildError && <div className="alert">{buildError}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('extras')}>
                Back
              </button>
              <button className="btn btn-primary" type="submit" disabled={!canFinish || building}>
                {building ? 'Building your guide…' : 'Build my guide'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
