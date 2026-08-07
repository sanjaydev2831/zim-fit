import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFocusSession, type FocusGuideId } from '../data/focusGuides'
import {
  expandAbbreviations,
  formatReps,
  formatRpe,
  glossary,
} from '../data/labels'
import { getSuggestedWeight } from '../data/weights'
import { useCatalog } from '../context/CatalogContext'
import { useProgressContext } from '../context/ProgressContext'

export function FocusWorkoutPage() {
  const { guideId = '', week = '1', session = '1' } = useParams()
  const id = guideId as FocusGuideId
  const w = Number(week)
  const sNum = Number(session)
  const { getFocusGuide, getExercise } = useCatalog()
  const { state, completeFocusSession, isFocusComplete, addFocusGuide } = useProgressContext()
  const navigate = useNavigate()
  const info = getFocusGuide(id)
  const level = state.profile?.level ?? 'beginner'
  const gear = state.profile?.availableEquipment ?? []
  const duration = state.profile?.sessionDuration ?? 45
  const workout = getFocusSession(id, w, sNum, level, gear, duration)
  const progress = state.focusGuides.find((g) => g.guideId === id)

  if (!info || !workout) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">Session not found</h1>
          <Link to="/guides" className="btn btn-ghost">
            Back
          </Link>
        </div>
      </section>
    )
  }

  const done = isFocusComplete(id, workout.id)

  function finish() {
    if (!progress) addFocusGuide(id)
    completeFocusSession(id, workout!.id, w, sNum, info!.sessionsPerWeek, info!.weeks)
    navigate(`/guides/${id}`)
  }

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        <p className="muted" style={{ margin: 0 }}>
          {info.name} · Week {w} · Session {sNum}
        </p>
        <div className="workout-header">
          <h1 className="display">{workout.title}</h1>
          <div className="meta-row">
            <span className="badge train">Focus guide</span>
            <span>~{workout.durationMin} minutes</span>
            <span>{info.targetMuscles}</span>
          </div>
          <p className="trainer-brief">{expandAbbreviations(workout.trainerBrief)}</p>
        </div>

        {workout.warmUp.length > 0 && (
          <div className="panel">
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: 8 }}>
              Warm-up
            </h2>
            <ol className="steps">
              {workout.warmUp.map((step) => (
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
          {workout.blocks.map((b) => {
            const ex = getExercise(b.exerciseId)
            if (!ex) return null
            const reps = formatReps(b.reps)
            const weight = getSuggestedWeight(b.exerciseId, level, {
              heightCm: state.profile?.heightCm,
              weightKg: state.profile?.weightKg,
            })
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
                    <span>Rest {b.restSec ? `${b.restSec} seconds` : '—'}</span>
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
                  <ul className="cues">
                    {ex.cues.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  {b.note && <p className="caution">{expandAbbreviations(b.note)}</p>}
                  {ex.caution && <p className="caution">Caution: {ex.caution}</p>}
                </div>
              </article>
            )
          })}
        </div>

        {workout.coolDown.length > 0 && (
          <div className="panel" style={{ marginTop: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginBottom: 8 }}>
              Cool-down
            </h2>
            <ol className="steps">
              {workout.coolDown.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="panel" style={{ marginTop: '1rem' }}>
          <strong className="accent">Trainer tip</strong>
          <p style={{ margin: '0.35rem 0 0' }}>{expandAbbreviations(workout.progressionTip)}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {!done ? (
            <button className="btn btn-primary" type="button" onClick={finish}>
              Mark session complete
            </button>
          ) : (
            <span className="badge train">Completed</span>
          )}
          <Link className="btn btn-ghost" to={`/guides/${id}`}>
            Back to guide
          </Link>
        </div>
      </div>
    </section>
  )
}
