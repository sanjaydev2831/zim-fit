import { Link, useNavigate, useParams } from 'react-router-dom'
import { buildFocusGuideSessions, type FocusGuideId } from '../data/focusGuides'
import { useCatalog } from '../context/CatalogContext'
import { useProgressContext } from '../context/ProgressContext'
import { DifficultyMeter } from '../components/Layout'

export function GuideDetailPage() {
  const { guideId = '' } = useParams()
  const id = guideId as FocusGuideId
  const { getFocusGuide } = useCatalog()
  const info = getFocusGuide(id)
  const { state, addFocusGuide, removeFocusGuide, isFocusComplete } = useProgressContext()
  const navigate = useNavigate()

  const progress = state.focusGuides.find((g) => g.guideId === id)
  const level = state.profile?.level ?? 'beginner'
  const gear = state.profile?.availableEquipment ?? []
  const duration = state.profile?.sessionDuration ?? 45
  const weeks = buildFocusGuideSessions(id, level, gear, duration)

  if (!info) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">Guide not found</h1>
          <Link to="/guides" className="btn btn-ghost">
            Back to guides
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <p className="muted" style={{ margin: 0 }}>
          Specialty guide
        </p>
        <div className="workout-header">
          <h1 className="display">{info.name}</h1>
          <p className="trainer-brief">{info.tagline}</p>
          <div className="meta-row">
            <span className="badge train">{info.targetMuscles}</span>
            <span>
              {info.weeks} weeks · {info.sessionsPerWeek} sessions/week
            </span>
            <span>~{info.recommendedMin} min</span>
          </div>
        </div>

        <div className="grid-2">
          <div className="panel">
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginTop: 0 }}>
              Who it&apos;s for
            </h2>
            <p className="muted">{info.whoFor}</p>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>How to use</h2>
            <p className="muted">{info.howToUse}</p>
          </div>
          <div className="panel">
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginTop: 0 }}>
              Precautions
            </h2>
            <ul className="steps">
              {info.precautions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
          {!progress ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!state.profile}
              onClick={() => {
                addFocusGuide(id)
              }}
            >
              Add this guide
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(`/guides/${id}/workout/${progress.currentWeek}/${progress.currentSession}`)
                }
              >
                Continue · Week {progress.currentWeek} Session {progress.currentSession}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => removeFocusGuide(id)}>
                Remove guide
              </button>
            </>
          )}
          <Link className="btn btn-ghost" to="/guides">
            All guides
          </Link>
        </div>

        {weeks.map((sessions, wi) => (
          <div key={wi} style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, margin: 0 }}>
                Week {wi + 1}
              </h2>
              <DifficultyMeter level={Math.min(5, wi + 2) as 1 | 2 | 3 | 4 | 5} />
            </div>
            <div className="day-list">
              {sessions.map((s, si) => {
                const done = isFocusComplete(id, s.id)
                return (
                  <Link
                    key={s.id}
                    to={`/guides/${id}/workout/${wi + 1}/${si + 1}`}
                    className={`day-row ${done ? 'done' : ''} ${
                      progress?.currentWeek === wi + 1 && progress?.currentSession === si + 1
                        ? 'current'
                        : ''
                    }`}
                  >
                    <span className="dow">S{si + 1}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>
                        {s.blocks.length} exercises · ~{s.durationMin} min
                        {done ? ' · Completed' : ''}
                      </div>
                    </div>
                    <span className={`badge ${s.dayType}`}>Open</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
