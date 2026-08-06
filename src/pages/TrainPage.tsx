import { Link } from 'react-router-dom'
import {
  attendanceLabel,
  formatCalendarDate,
  formatDayMonth,
  formatWeekday,
  getSessionDate,
  weeklyRestBlurb,
} from '../data/calendar'
import { formatDayType, formatFocus } from '../data/labels'
import { focusGuideCatalog } from '../data/focusGuides'
import { useProgressContext } from '../context/ProgressContext'
import { DifficultyMeter } from '../components/Layout'

export function TrainPage() {
  const {
    state,
    currentWeekPlan,
    currentSession,
    completedCount,
    todayPosition,
    calendarToday,
    getDayAttendance,
    jumpTo,
  } = useProgressContext()

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
  const progressPct = Math.min(100, Math.round((completedCount / 84) * 100))
  const todayLabel = formatCalendarDate(calendarToday)
  const isProgrammedRest =
    Boolean(session) && (session!.dayType === 'rest' || session!.dayType === 'active_recovery')
  const weeklyRest = weeklyRestBlurb(state.profile.restWeekdays ?? [])

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="muted" style={{ margin: 0 }}>
            Hey {state.profile.name}
            {state.profile.medicalClearanceNeeded ? ' · clearance recommended before hard training' : ''}
          </p>
          <h1 className="display">Today&apos;s plan</h1>
          <p className="muted" style={{ margin: '0.35rem 0 0' }}>
            {todayLabel}
            {todayPosition.inProgram
              ? ` · Week ${todayPosition.week} · ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][todayPosition.day - 1]}`
              : ' · Outside the 12-week calendar window'}
          </p>
          <p className="accent" style={{ margin: '0.35rem 0 0', fontSize: '0.92rem', fontWeight: 700 }}>
            {weeklyRest}
          </p>
        </div>

        <div className="stat-inline">
          <div>
            <strong>W{todayPosition.week}</strong>
            <span>Program week</span>
          </div>
          <div>
            <strong>{state.profile.daysPerWeek}×</strong>
            <span>Train days / week</span>
          </div>
          <div>
            <strong>
              {state.profile.heightCm}/{state.profile.weightKg}
            </strong>
            <span>cm / kg</span>
          </div>
          <div>
            <strong>{state.profile.sessionDuration}m</strong>
            <span>Session length</span>
          </div>
        </div>

        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${progressPct}%` }} />
        </div>

        <div className="legend-row">
          <span>
            <i className="dot today" /> Today
          </span>
          <span>
            <i className="dot done" /> Completed
          </span>
          <span>
            <i className="dot rested" /> Rest day
          </span>
          <span>
            <i className="dot missed" /> Incomplete
          </span>
          <span>
            <i className="dot upcoming" /> Upcoming
          </span>
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

        {isProgrammedRest ? (
          <div className="panel rest-today-panel" style={{ marginBottom: '1.5rem' }}>
            <h2 className="display" style={{ fontSize: '2.4rem', marginBottom: '0.35rem' }}>
              Rest day
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Scheduled rest ({weeklyRest}). Recover well and come back on your next train day.
            </p>
            {session && (
              <Link className="btn btn-ghost" to={`/workout/${session.week}/${session.day}`} style={{ marginTop: 12 }}>
                View recovery notes
              </Link>
            )}
          </div>
        ) : (
          session && (
            <Link
              to={`/workout/${session.week}/${session.day}`}
              className={`day-row current ${getDayAttendance(session)}`}
              style={{ marginBottom: '1rem' }}
            >
              <span className="dow">
                <strong>
                  {formatWeekday(getSessionDate(state.profile.startDate, session.week, session.day))}
                </strong>
                <small>
                  {formatDayMonth(getSessionDate(state.profile.startDate, session.week, session.day))}
                </small>
              </span>
              <div>
                <strong>{session.title}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {session.durationMin > 0 ? `${session.durationMin} min` : 'Recovery day'} ·{' '}
                  {formatFocus(session.focus)} · {attendanceLabel(getDayAttendance(session), session.dayType)}
                </div>
              </div>
              <span className={`badge ${session.dayType}`}>{formatDayType(session.dayType)}</span>
            </Link>
          )
        )}

        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: '0.75rem' }}>
          This week (Mon–Sun)
        </h3>
        <div className="day-list">
          {week?.sessions.map((s) => {
            const status = getDayAttendance(s)
            const date = getSessionDate(state.profile!.startDate, s.week, s.day)
            return (
              <Link
                key={s.id}
                to={`/workout/${s.week}/${s.day}`}
                className={`day-row ${status}`}
                onClick={() => jumpTo(s.week, s.day)}
              >
                <span className="dow">
                  <strong>{formatWeekday(date)}</strong>
                  <small>{formatDayMonth(date)}</small>
                </span>
                <div>
                  <strong>{s.title}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {attendanceLabel(status, s.dayType)}
                    {status === 'upcoming' || status === 'today'
                      ? ` · ${s.durationMin > 0 ? `${s.durationMin} min` : 'off'}`
                      : ''}
                  </div>
                </div>
                <span
                  className={`badge ${
                    status === 'missed' ? 'missed' : status === 'rested' ? 'rested' : s.dayType
                  }`}
                >
                  {status === 'missed'
                    ? 'Incomplete'
                    : status === 'rested'
                      ? 'Rest'
                      : formatDayType(s.dayType)}
                </span>
              </Link>
            )
          })}
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
          <Link className="btn btn-ghost" to="/profile">
            Edit profile
          </Link>
          <Link className="btn btn-ghost" to="/guides">
            Muscle focus guides
          </Link>
        </div>
      </div>
    </section>
  )
}
