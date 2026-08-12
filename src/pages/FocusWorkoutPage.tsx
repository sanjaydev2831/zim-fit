import { useEffect, useRef } from 'react'
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
  const {
    state,
    completeFocusSession,
    isFocusComplete,
    addFocusGuide,
    toggleExerciseComplete,
    getCompletedExercises,
    markExercisesComplete,
  } = useProgressContext()
  const navigate = useNavigate()
  const info = getFocusGuide(id)
  const level = state.profile?.level ?? 'beginner'
  const gear = state.profile?.availableEquipment ?? []
  const duration = state.profile?.sessionDuration ?? 45
  const workout = getFocusSession(id, w, sNum, level, gear, duration)
  const progress = state.focusGuides.find((g) => g.guideId === id)
  const autoFinished = useRef(false)

  const sessionId = workout?.id ?? ''
  const exerciseIds = workout?.blocks.map((b) => b.exerciseId) ?? []
  const exerciseKey = exerciseIds.join('|')
  const completedExercises = getCompletedExercises(sessionId)
  const doneCount = exerciseIds.filter((exId) => completedExercises.includes(exId)).length
  const allExercisesDone = exerciseIds.length > 0 && doneCount === exerciseIds.length
  const done = workout ? isFocusComplete(id, workout.id) : false

  useEffect(() => {
    autoFinished.current = false
  }, [sessionId])

  useEffect(() => {
    if (!info || !sessionId || done || !allExercisesDone || autoFinished.current) return
    autoFinished.current = true
    if (!progress) addFocusGuide(id)
    markExercisesComplete(sessionId, exerciseKey.split('|').filter(Boolean))
    completeFocusSession(id, sessionId, w, sNum, info.sessionsPerWeek, info.weeks)
    navigate(`/guides/${id}`)
  }, [
    allExercisesDone,
    done,
    info,
    sessionId,
    exerciseKey,
    progress,
    addFocusGuide,
    markExercisesComplete,
    completeFocusSession,
    id,
    w,
    sNum,
    navigate,
  ])

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

  const guide = info
  const current = workout

  function finish() {
    if (!progress) addFocusGuide(id)
    markExercisesComplete(current.id, exerciseIds)
    completeFocusSession(id, current.id, w, sNum, guide.sessionsPerWeek, guide.weeks)
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '1rem',
            margin: '1.5rem 0 0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, margin: 0 }}>
            Working sets
          </h2>
          {exerciseIds.length > 0 && (
            <p className="muted" style={{ margin: 0, fontWeight: 700 }}>
              {doneCount}/{exerciseIds.length} exercises done
            </p>
          )}
        </div>
        <div className="block-list">
          {workout.blocks.map((b) => {
            const ex = getExercise(b.exerciseId)
            if (!ex) return null
            const reps = formatReps(b.reps)
            const weight = getSuggestedWeight(b.exerciseId, level, {
              heightCm: state.profile?.heightCm,
              weightKg: state.profile?.weightKg,
            })
            const exerciseDone = completedExercises.includes(b.exerciseId)
            return (
              <article
                key={`${b.exerciseId}-${b.sets}-${b.reps}`}
                className={`exercise-card${exerciseDone ? ' exercise-done' : ''}`}
              >
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
                  <button
                    type="button"
                    className={`btn exercise-done-btn${exerciseDone ? ' is-done' : ''}`}
                    onClick={() => toggleExerciseComplete(workout.id, b.exerciseId)}
                    disabled={done}
                    aria-pressed={exerciseDone}
                  >
                    {exerciseDone ? '✓ Done' : 'Mark done'}
                  </button>
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
