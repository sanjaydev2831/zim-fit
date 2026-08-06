import { Link } from 'react-router-dom'
import { dayLabel } from '../data/program'
import { formatDayType, formatFocus } from '../data/labels'
import { focusGuideCatalog } from '../data/focusGuides'
import { useProgressContext } from '../context/ProgressContext'
import { DifficultyMeter } from '../components/Layout'

export function TrainPage() {
  const { state, currentWeekPlan, currentSession, completedCount, isComplete, jumpTo, reset } =
    useProgressContext()

  if (!state.profile) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">No plan yet</h1>
          <p className="muted">Screen in and we will build your 12-week trainer guide.</p>
          <Link className="btn btn-primary" to="/start">
            Start
          </Link>
        </div>
      </section>
    )
  }

  const week = currentWeekPlan
  const session = currentSession
  const progressPct = Math.min(100, Math.round((completedCount / 60) * 100))

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="muted" style={{ margin: 0 }}>
            Hey {state.profile.name}
            {state.profile.medicalClearanceNeeded ? ' · clearance recommended before hard training' : ''}
          </p>
          <h1 className="display">Today&apos;s plan</h1>
        </div>

        <div className="stat-inline">
          <div>
            <strong>W{state.currentWeek}</strong>
            <span>Current week</span>
          </div>
          <div>
            <strong>{state.profile.daysPerWeek}×</strong>
            <span>Days / week</span>
          </div>
          <div>
            <strong>{state.profile.sessionDuration}m</strong>
            <span>Session length</span>
          </div>
          <div>
            <strong>{state.profile.availableEquipment.length}</strong>
            <span>Gear selected</span>
          </div>
        </div>

        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${progressPct}%` }} />
        </div>

        {week && (
          <div className="panel" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: 4 }}>
                  Week {week.week}: {week.phase}
                </h2>
                <p className="muted" style={{ margin: 0 }}>
                  {week.theme}
                </p>
              </div>
              <DifficultyMeter level={week.difficulty} />
            </div>
            <p style={{ margin: '0.85rem 0 0', fontSize: '0.92rem' }}>
              <span className="accent">{week.volumeNote}</span>
              <span className="muted"> · {week.intensityNote}</span>
            </p>
          </div>
        )}

        {session && (
          <Link
            to={`/workout/${session.week}/${session.day}`}
            className={`day-row current`}
            style={{ marginBottom: '1.5rem' }}
          >
            <span className="dow">{dayLabel(session.day)}</span>
            <div>
              <strong>{session.title}</strong>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {session.durationMin > 0 ? `${session.durationMin} min` : 'Recovery day'} ·{' '}
                {formatFocus(session.focus)}
              </div>
            </div>
            <span className={`badge ${session.dayType}`}>{formatDayType(session.dayType)}</span>
          </Link>
        )}

        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: '0.75rem' }}>
          This week
        </h3>
        <div className="day-list">
          {week?.sessions.map((s) => (
            <Link
              key={s.id}
              to={`/workout/${s.week}/${s.day}`}
              className={`day-row ${s.day === state.currentDay ? 'current' : ''} ${isComplete(s.id) ? 'done' : ''}`}
              onClick={() => jumpTo(s.week, s.day)}
            >
              <span className="dow">{dayLabel(s.day)}</span>
              <div>
                <strong>{s.title}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {isComplete(s.id) ? 'Completed' : s.trainerBrief.slice(0, 72) + '…'}
                </div>
              </div>
              <span className={`badge ${s.dayType}`}>{formatDayType(s.dayType)}</span>
            </Link>
          ))}
        </div>

        {state.focusGuides.length > 0 && (
          <>
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 800,
                margin: '1.75rem 0 0.75rem',
              }}
            >
              Focus guides
            </h3>
            <div className="day-list">
              {state.focusGuides.map((g) => {
                const info = focusGuideCatalog.find((c) => c.id === g.guideId)
                if (!info) return null
                return (
                  <Link
                    key={g.guideId}
                    to={`/guides/${g.guideId}/workout/${g.currentWeek}/${g.currentSession}`}
                    className="day-row"
                  >
                    <span className="dow">FG</span>
                    <div>
                      <strong>{info.name}</strong>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>
                        Week {g.currentWeek} · Session {g.currentSession}
                      </div>
                    </div>
                    <span className="badge train">Continue</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to="/program">
            Full 12-week map
          </Link>
          <Link className="btn btn-ghost" to="/guides">
            Muscle focus guides
          </Link>
          <button className="btn btn-danger" type="button" onClick={() => reset()}>
            Reset profile
          </button>
        </div>
      </div>
    </section>
  )
}
