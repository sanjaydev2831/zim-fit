import { Link } from 'react-router-dom'
import { focusGuideCatalog, type FocusGuideId } from '../data/focusGuides'
import { useProgressContext } from '../context/ProgressContext'

export function GuidesPage() {
  const { state, addFocusGuide, removeFocusGuide } = useProgressContext()
  const activeIds = new Set(state.focusGuides.map((g) => g.guideId))

  function toggle(id: FocusGuideId) {
    if (activeIds.has(id)) removeFocusGuide(id)
    else addFocusGuide(id)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="display">Focus guides</h1>
          <p>
            Add a specialty guide for a muscle group — abs, chest, arms, and more. Run them as
            short add-on sessions beside your main 12-week plan.
          </p>
        </div>

        {!state.profile && (
          <div className="alert" style={{ marginBottom: '1.25rem' }}>
            Complete the main setup first so we can match your gym gear and experience level.{' '}
            <Link to="/start" style={{ color: 'var(--accent)' }}>
              Start setup
            </Link>
          </div>
        )}

        {state.focusGuides.length > 0 && (
          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, marginTop: 0 }}>
              Your active guides
            </h2>
            <div className="day-list">
              {state.focusGuides.map((g) => {
                const info = focusGuideCatalog.find((c) => c.id === g.guideId)!
                return (
                  <Link
                    key={g.guideId}
                    to={`/guides/${g.guideId}`}
                    className="day-row current"
                  >
                    <span className="dow">W{g.currentWeek}</span>
                    <div>
                      <strong>{info.name}</strong>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>
                        Session {g.currentSession} · {g.completedSessionIds.length} done
                      </div>
                    </div>
                    <span className="badge train">Open</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="guide-grid">
          {focusGuideCatalog.map((guide) => {
            const active = activeIds.has(guide.id)
            return (
              <article key={guide.id} className={`guide-card ${active ? 'active' : ''}`}>
                <img src={guide.image} alt="" loading="lazy" />
                <div className="guide-card-body">
                  <h3>{guide.name}</h3>
                  <p className="muted">{guide.tagline}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0.35rem 0' }}>
                    <strong className="accent">{guide.targetMuscles}</strong>
                  </p>
                  <p className="muted" style={{ fontSize: '0.85rem' }}>
                    {guide.weeks} weeks · {guide.sessionsPerWeek}× / week · ~{guide.recommendedMin}{' '}
                    min
                  </p>
                  <div className="guide-actions">
                    <button
                      type="button"
                      className={active ? 'btn btn-danger' : 'btn btn-primary'}
                      onClick={() => toggle(guide.id)}
                      disabled={!state.profile && !active}
                    >
                      {active ? 'Remove guide' : 'Add guide'}
                    </button>
                    {active && (
                      <Link className="btn btn-ghost" to={`/guides/${guide.id}`}>
                        View plan
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
