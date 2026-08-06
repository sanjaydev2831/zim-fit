import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  daysPerWeekOptions,
  defaultEquipmentIds,
  selectableEquipment,
  sessionDurationOptions,
  type DaysPerWeek,
  type EquipmentId,
  type SessionDuration,
} from '../data/equipment'
import { levelCopy } from '../data/program'
import { redFlagsStopNow } from '../data/safety'
import type { ExperienceLevel, UserProfile } from '../data/types'
import { useProgressContext } from '../context/ProgressContext'

type Step = 'equipment' | 'days' | 'duration' | 'profile' | 'screen'

export function StartPage() {
  const { start } = useProgressContext()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('equipment')
  const [equipment, setEquipment] = useState<EquipmentId[]>([...defaultEquipmentIds])
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(3)
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(45)
  const [name, setName] = useState('')
  const [level, setLevel] = useState<ExperienceLevel>('beginner')
  const [goal, setGoal] = useState<UserProfile['goal']>('general')
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [ack, setAck] = useState(false)

  const anyFlag = useMemo(() => Object.values(flags).some(Boolean), [flags])
  const canFinish = ack && name.trim().length > 0

  function toggleEquipment(id: EquipmentId) {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canFinish) return
    start({
      name: name.trim(),
      level,
      goal,
      daysPerWeek,
      sessionDuration,
      availableEquipment: equipment,
      screened: true,
      medicalClearanceNeeded: anyFlag,
    })
    navigate(anyFlag ? '/safety' : '/train')
  }

  const stepIndex = { equipment: 1, days: 2, duration: 3, profile: 4, screen: 5 }[step]
  const exerciseCount =
    sessionDurationOptions.find((o) => o.minutes === sessionDuration)?.exerciseCount ?? 6

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <p className="muted" style={{ margin: 0 }}>
            Setup · step {stepIndex} of 5
          </p>
          <h1 className="display">
            {step === 'equipment' && 'Indian gym gear'}
            {step === 'days' && 'Training days'}
            {step === 'duration' && 'Session length'}
            {step === 'profile' && 'About you'}
            {step === 'screen' && 'Safety screen'}
          </h1>
          <p>
            {step === 'equipment' &&
              'Select machines common in Indian gyms (Smith, hack squat, pec deck, multi-gym…). Workouts swap to what you have.'}
            {step === 'days' && 'How many days per week should your guide schedule?'}
            {step === 'duration' &&
              'Longer sessions unlock more exercises. Shorter sessions keep the key lifts.'}
            {step === 'profile' && 'Level and goal shape set progression.'}
            {step === 'screen' && 'ACSM-style symptom check — not a medical diagnosis.'}
          </p>
        </div>

        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${(stepIndex / 5) * 100}%` }} />
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
                const on = equipment.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`equip-card ${on ? 'selected' : ''}`}
                    onClick={() => toggleEquipment(item.id)}
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
              {daysPerWeekOptions.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  className={`choice ${daysPerWeek === opt.days ? 'selected' : ''}`}
                  onClick={() => setDaysPerWeek(opt.days)}
                >
                  <strong>{opt.title}</strong>
                  <span>{opt.blurb}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('equipment')}>
                Back
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setStep('duration')}>
                Next · session length
              </button>
            </div>
          </div>
        )}

        {step === 'duration' && (
          <div>
            <div className="choice-grid">
              {sessionDurationOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  className={`choice ${sessionDuration === opt.minutes ? 'selected' : ''}`}
                  onClick={() => setSessionDuration(opt.minutes)}
                >
                  <strong>{opt.title}</strong>
                  <span>
                    {opt.blurb} · {opt.exerciseCount} exercises
                  </span>
                </button>
              ))}
            </div>
            <p className="muted" style={{ marginTop: '1rem' }}>
              Your train days will target ~{sessionDuration} minutes with {exerciseCount} working
              exercises (plus warm-up / cool-down).
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
                disabled={!name.trim()}
                onClick={() => setStep('screen')}
              >
                Next · safety
              </button>
            </div>
          </div>
        )}

        {step === 'screen' && (
          <form onSubmit={onSubmit}>
            <div className="panel">
              <p className="muted" style={{ marginTop: 0 }}>
                Do you currently experience any of these?
              </p>
              <ul className="check-list">
                {redFlagsStopNow.map((item) => (
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
                  I understand Zim Fit is educational, not medical advice, and I will stop for
                  warning symptoms.
                </span>
              </label>
            </div>

            <div className="panel">
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                <strong className="accent">{daysPerWeek} days/week</strong>
                <span className="muted">
                  {' '}
                  · {sessionDuration} min · {exerciseCount} exercises · {equipment.length} machines
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setStep('profile')}>
                Back
              </button>
              <button className="btn btn-primary" type="submit" disabled={!canFinish}>
                Build my guide
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
