import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  defaultRestWeekdays,
  formatWeekdayList,
  restDayCount,
  type DaysPerWeek,
  type EquipmentId,
  type SessionDuration,
} from '../data/equipment'
import { levelCopy } from '../data/program'
import type { ExperienceLevel, UserProfile } from '../data/types'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useProgressContext } from '../context/ProgressContext'

export function ProfilePage() {
  const { state, updateProfile, reset, cloudEnabled, syncing, syncError } = useProgressContext()
  const { selectableEquipment, options } = useCatalog()
  const { loggedIn, email } = useAuth()
  const navigate = useNavigate()
  const profile = state.profile

  const [name, setName] = useState('')
  const [level, setLevel] = useState<ExperienceLevel>('beginner')
  const [goal, setGoal] = useState<UserProfile['goal']>('general')
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(3)
  const [restWeekdays, setRestWeekdays] = useState<number[]>(() => defaultRestWeekdays(3))
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(45)
  const [equipment, setEquipment] = useState<EquipmentId[]>([])
  const [heightCm, setHeightCm] = useState(170)
  const [weightKg, setWeightKg] = useState(70)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    setName(profile.name)
    setLevel(profile.level)
    setGoal(profile.goal)
    setDaysPerWeek(profile.daysPerWeek)
    setRestWeekdays(
      profile.restWeekdays?.length === 7 - profile.daysPerWeek
        ? [...profile.restWeekdays]
        : defaultRestWeekdays(profile.daysPerWeek),
    )
    setSessionDuration(profile.sessionDuration)
    setEquipment([...profile.availableEquipment])
    setHeightCm(profile.heightCm ?? 170)
    setWeightKg(profile.weightKg ?? 70)
  }, [profile])

  if (!profile) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">Profile</h1>
          <p className="muted">Start setup first to edit your plan.</p>
          <Link className="btn btn-primary" to="/start">
            Start
          </Link>
        </div>
      </section>
    )
  }

  const neededRest = restDayCount(daysPerWeek)
  const restPickedOk = restWeekdays.length === neededRest
  const heightOk = heightCm >= 120 && heightCm <= 230
  const weightOk = weightKg >= 35 && weightKg <= 200
  const canSave = name.trim().length > 0 && restPickedOk && heightOk && weightOk

  function chooseDaysPerWeek(days: DaysPerWeek) {
    setDaysPerWeek(days)
    setRestWeekdays(defaultRestWeekdays(days))
    setSaved(false)
  }

  function toggleRestDay(day: number) {
    setRestWeekdays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day)
      if (prev.length >= neededRest) {
        return [...prev.slice(0, neededRest - 1), day].sort((a, b) => a - b)
      }
      return [...prev, day].sort((a, b) => a - b)
    })
    setSaved(false)
  }

  function toggleEquipment(id: EquipmentId) {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    setSaved(false)
  }

  function onSave() {
    if (!canSave) return
    updateProfile({
      name: name.trim(),
      level,
      goal,
      daysPerWeek,
      restWeekdays,
      sessionDuration,
      availableEquipment: equipment,
      heightCm,
      weightKg,
    })
    setSaved(true)
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <h1 className="display">Edit profile</h1>
          <p>
            Change machines, rest days, session length, or training mode anytime — progress stays
            saved. Raise your level if sessions feel easy.
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            {cloudEnabled
              ? `Cloud sync on${email ? ` · ${email}` : ''}${syncing ? ' · syncing…' : ''}`
              : loggedIn
                ? 'Signed in — waiting for API sync'
                : (
                  <>
                    Local only · <Link to="/account">Log in</Link> to sync across devices
                  </>
                )}
          </p>
          {syncError && (
            <p style={{ color: 'var(--danger, #c44)', marginBottom: 0 }}>{syncError}</p>
          )}
        </div>

        <div className="panel">
          <label className="muted" htmlFor="edit-name" style={{ display: 'block', marginBottom: 8 }}>
            Name
          </label>
          <input
            id="edit-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
            style={inputStyle}
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
                onChange={(e) => {
                  setHeightCm(Number(e.target.value))
                  setSaved(false)
                }}
                style={inputStyle}
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
                onChange={(e) => {
                  setWeightKg(Number(e.target.value))
                  setSaved(false)
                }}
                style={inputStyle}
              />
            </label>
          </div>
          <p className="muted" style={{ marginBottom: 0, fontSize: '0.9rem' }}>
            Used to refine suggested loads (BMI / bodyweight context).
          </p>
        </div>

        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Training mode (raise if it feels easy)
          </p>
          <div className="choice-grid">
            {(Object.keys(levelCopy) as ExperienceLevel[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`choice ${level === key ? 'selected' : ''}`}
                onClick={() => {
                  setLevel(key)
                  setSaved(false)
                }}
              >
                <strong>{levelCopy[key].title}</strong>
                <span>{levelCopy[key].blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Goal
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
                onClick={() => {
                  setGoal(id)
                  setSaved(false)
                }}
              >
                <strong>{label}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Training days / week
          </p>
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
          <p style={{ fontWeight: 800, margin: '1rem 0 0.5rem', fontFamily: 'var(--font-body)' }}>
            Rest days (any weekday)
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
          <p className="accent" style={{ marginBottom: 0, marginTop: '0.75rem', fontWeight: 700 }}>
            Rest: {restPickedOk ? formatWeekdayList(restWeekdays) : `pick ${neededRest}`}
          </p>
        </div>

        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Session length
          </p>
          <div className="choice-grid">
            {options.sessionDuration.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                className={`choice ${sessionDuration === opt.minutes ? 'selected' : ''}`}
                onClick={() => {
                  setSessionDuration(opt.minutes as SessionDuration)
                  setSaved(false)
                }}
              >
                <strong>{opt.title}</strong>
                <span>
                  {opt.blurb} · {opt.exerciseCount} exercises
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Gym machines
          </p>
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
        </div>

        {saved && (
          <p className="accent" style={{ fontWeight: 700 }}>
            Saved — your plan updates with these settings.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="button" disabled={!canSave} onClick={onSave}>
            Save changes
          </button>
          <Link className="btn btn-ghost" to="/train">
            Back to today
          </Link>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              reset()
              navigate('/start')
            }}
          >
            Reset &amp; restart
          </button>
        </div>
      </div>
    </section>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: 4,
  border: '1px solid var(--line)',
  background: 'var(--bg-soft)',
  color: 'var(--text)',
  marginTop: 6,
}
