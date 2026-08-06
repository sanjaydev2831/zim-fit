import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  attendanceLabel,
  formatDayMonth,
  formatWeekday,
  getSessionDate,
} from '../data/calendar'
import { formatDayType } from '../data/labels'
import { useProgressContext } from '../context/ProgressContext'
import { DifficultyMeter } from '../components/Layout'

export function ProgramPage() {
  const { state, program, todayPosition, delayDays, getDayAttendance, jumpTo } = useProgressContext()
  const [week, setWeek] = useState(todayPosition.week || 1)
  const plan = program.find((w) => w.week === week)
  const delay = delayDays ?? 0

  useEffect(() => {
    setWeek(todayPosition.week || 1)
  }, [todayPosition.week])

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
            Weeks follow the live Mon–Sun calendar. Rest days are the ones you chose at setup —
            any weekday, and they do not need to be consecutive.
          </p>
        </div>

        <div className="week-strip">
          {program.map((w) => {
            const missed = w.sessions.some((s) => getDayAttendance(s) === 'missed')
            const allDone = w.sessions.every((s) => getDayAttendance(s) === 'completed')
            return (
              <button
                key={w.week}
                type="button"
                className={`week-pill ${week === w.week ? 'active' : ''} ${allDone ? 'done' : ''} ${missed ? 'has-missed' : ''}`}
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
              {plan.sessions.map((s) => {
                const status = getDayAttendance(s)
                const date = getSessionDate(state.profile!.startDate, s.week, s.day, delay)
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
                        {s.durationMin > 0 ? ` · ${s.durationMin} min` : ''}
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
          </>
        )}
      </div>
    </section>
  )
}
