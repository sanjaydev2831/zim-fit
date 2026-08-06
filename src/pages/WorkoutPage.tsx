import { Link, useNavigate, useParams } from 'react-router-dom'
import { getExercise } from '../data/exercises'
import {
  expandAbbreviations,
  formatDayType,
  formatFocus,
  formatReps,
  formatRpe,
  glossary,
} from '../data/labels'
import { dayLabel, getSession } from '../data/program'
import { getSuggestedWeight } from '../data/weights'
import { useProgressContext } from '../context/ProgressContext'

export function WorkoutPage() {
  const { week = '1', day = '1' } = useParams()
  const w = Number(week)
  const d = Number(day)
  const { program, completeSession, isComplete, state } = useProgressContext()
  const navigate = useNavigate()
  const session = getSession(program, w, d)
  const level = state.profile?.level ?? 'beginner'

  if (!session) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">Session not found</h1>
          <Link to="/train" className="btn btn-ghost">
            Back
          </Link>
        </div>
      </section>
    )
  }

  const done = isComplete(session.id)

  function finish() {
    completeSession(session!.id, session!.week, session!.day)
    navigate('/train')
  }

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        <p className="muted" style={{ margin: 0 }}>
          Week {session.week} · {dayLabel(session.day)}
          {state.profile ? ` · ${state.profile.level}` : ''}
        </p>
        <div className="workout-header">
          <h1 className="display">{session.title}</h1>
          <div className="meta-row">
            <span className={`badge ${session.dayType}`}>{formatDayType(session.dayType)}</span>
            {session.durationMin > 0 && <span>~{session.durationMin} minutes</span>}
            <span>{formatFocus(session.focus)}</span>
          </div>
          <p className="trainer-brief">{expandAbbreviations(session.trainerBrief)}</p>
        </div>

        {session.dayType === 'rest' && session.blocks.length === 0 ? (
          <div className="empty-rest panel">
            <h2 className="display">Rest</h2>
            <p className="muted">{expandAbbreviations(session.progressionTip)}</p>
            {!done && (
              <button className="btn btn-primary" type="button" onClick={finish}>
                Mark rest complete
              </button>
            )}
          </div>
        ) : (
          <>
            {session.warmUp.length > 0 && (
              <div className="panel">
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: 8 }}>
                  Warm-up
                </h2>
                <ol className="steps">
                  {session.warmUp.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <h2
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 800,
                margin: '1.5rem 0 0.75rem',
              }}
            >
              Working sets
            </h2>
            <div className="block-list">
              {session.blocks.map((b) => {
                const ex = getExercise(b.exerciseId)
                const reps = formatReps(b.reps)
                const weight = getSuggestedWeight(b.exerciseId, level)
                return (
                  <article key={`${b.exerciseId}-${b.sets}-${b.reps}`} className="exercise-card">
                    <div className="exercise-media">
                      <img src={ex.image} alt={ex.name} loading="lazy" />
                    </div>
                    <div className="exercise-body">
                      <div className="exercise-top">
                        <h3>{ex.name}</h3>
                        <span className="sets-line">
                          {b.sets} sets × {reps.display}
                        </span>
                      </div>
                      <div className="exercise-meta">
                        <span>{ex.muscle}</span>
                        <span>
                          Rest {b.restSec ? `${b.restSec} seconds` : '—'}
                        </span>
                        <span title={glossary.rpe.meaning}>{formatRpe(b.rpe)}</span>
                        <span>{ex.equipment}</span>
                      </div>
                      {weight && (
                        <div className="weight-box">
                          <strong>Suggested weight ({level})</strong>
                          <span>{weight.label}</span>
                          {weight.tip && <p>{weight.tip}</p>}
                        </div>
                      )}
                      {reps.detail && (
                        <p className="muted" style={{ fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
                          {reps.detail}
                        </p>
                      )}
                      <ul className="cues">
                        {ex.cues.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      {b.note && <p className="caution">{expandAbbreviations(b.note)}</p>}
                      {ex.caution && <p className="caution">Caution: {ex.caution}</p>}
                      <p className="muted" style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
                        Swap options: {ex.substitutes.join(' · ')}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            {session.coolDown.length > 0 && (
              <div className="panel" style={{ marginTop: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: 8 }}>
                  Cool-down
                </h2>
                <ol className="steps">
                  {session.coolDown.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="panel" style={{ marginTop: '1rem' }}>
              <strong className="accent">Trainer tip</strong>
              <p style={{ margin: '0.35rem 0 0' }}>
                {expandAbbreviations(session.progressionTip)}
              </p>
            </div>

            <div className="panel" style={{ marginTop: '1rem' }}>
              <strong>Keyword guide</strong>
              <ul className="glossary-list">
                {(['rpe', 'rir', 'amrap', 'rdl', 'ohp', 'db'] as const).map((key) => (
                  <li key={key}>
                    <strong>{glossary[key].short}</strong> = {glossary[key].full}
                    <span className="muted"> — {glossary[key].meaning}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              {!done ? (
                <button className="btn btn-primary" type="button" onClick={finish}>
                  Mark session complete
                </button>
              ) : (
                <span className="badge train">Completed</span>
              )}
              <Link className="btn btn-ghost" to="/train">
                Back to today
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
