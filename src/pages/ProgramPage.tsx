import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dayLabel } from '../data/program'
import { formatDayType } from '../data/labels'
import { useProgressContext } from '../context/ProgressContext'
import { DifficultyMeter } from '../components/Layout'

export function ProgramPage() {
  const { state, program, isComplete, jumpTo } = useProgressContext()
  const [week, setWeek] = useState(state.currentWeek || 1)
  const plan = program.find((w) => w.week === week)

  if (!state.profile) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">Program</h1>
          <p className="muted">Start screening to personalize set progression.</p>
          <Link className="btn btn-primary" to="/start">
            Start
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="display">12-week map</h1>
          <p>
            Difficulty rises by phase. Tap a week, open any day, train with full cues — then log it
            done.
          </p>
        </div>

        <div className="week-strip">
          {program.map((w) => {
            const done = w.sessions.every((s) => isComplete(s.id) || s.dayType === 'rest')
            return (
              <button
                key={w.week}
                type="button"
                className={`week-pill ${week === w.week ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => setWeek(w.week)}
              >
                {w.week}
              </button>
            )
          })}
        </div>

        {plan && (
          <>
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>
                    Week {plan.week} · {plan.phase}
                  </h2>
                  <p className="muted">{plan.focus}</p>
                </div>
                <DifficultyMeter level={plan.difficulty} />
              </div>
              <p style={{ marginBottom: 0 }}>{plan.theme}</p>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                {plan.volumeNote} · {plan.intensityNote}
              </p>
            </div>

            <div className="day-list" style={{ marginTop: '1rem' }}>
              {plan.sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/workout/${s.week}/${s.day}`}
                  className={`day-row ${isComplete(s.id) ? 'done' : ''}`}
                  onClick={() => jumpTo(s.week, s.day)}
                >
                  <span className="dow">{dayLabel(s.day)}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <div className="muted" style={{ fontSize: '0.85rem' }}>
                      {s.durationMin > 0 ? `${s.durationMin} min` : 'Off day'}
                    </div>
                  </div>
                  <span className={`badge ${s.dayType}`}>{formatDayType(s.dayType)}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
