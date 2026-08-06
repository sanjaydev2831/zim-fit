import { Link } from 'react-router-dom'
import { useProgressContext } from '../context/ProgressContext'

export function HomePage() {
  const { state } = useProgressContext()
  const started = Boolean(state.profile)

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden />
        <div className="container hero-content">
          <h1 className="display">
            Zim <span className="accent">Fit</span>
          </h1>
          <h2>Train like a coach is writing your day.</h2>
          <p>
            A 12-week gym system with daily sessions, week-by-week difficulty, and evidence-based
            limits — built from ACSM 2026, NSCA progression, and preparticipation safety screening.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={started ? '/train' : '/start'}>
              {started ? 'Continue training' : 'Start as your trainer'}
            </Link>
            <Link className="btn btn-ghost" to="/safety">
              Precautions & limits
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="display">What you get</h2>
            <p>One job per day. Clear sets, reps, effort rating, cues, and swaps — like a floor trainer.</p>
          </div>
          <div className="grid-3">
            <article className="feature">
              <h3>Daily trainer brief</h3>
              <p>
                Warm-up, working blocks, cool-down, and coaching cues for every lift — not a random
                exercise dump.
              </p>
            </article>
            <article className="feature">
              <h3>Week-by-week climb</h3>
              <p>
                Foundation → Build → Intensify → Deload. Volume and intensity rise gradually so you
                adapt instead of burn out.
              </p>
            </article>
            <article className="feature">
              <h3>Safety first</h3>
              <p>
                Red-flag symptoms, when to get clearance, progressive overload caps, and sources you
                can verify.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2 className="display">12-week arc</h2>
            <p>
              Aligned with ACSM: hit major muscle groups at least twice weekly; progress load when
              reps are easy with 2–3 left in reserve.
            </p>
          </div>
          <div className="phase-row">
            <div className="phase-item">
              <strong>Weeks 1–4</strong>
              <div>
                <h3>Foundation</h3>
                <p className="muted">
                  Full body 3×/week. Learn squat, hinge, push, pull. Effort 6–7/10. Consistency over load.
                </p>
              </div>
            </div>
            <div className="phase-item">
              <strong>Weeks 5–8</strong>
              <div>
                <h3>Build</h3>
                <p className="muted">
                  Upper/Lower 4×/week. ~3 sets. Raise weekly volume toward hypertrophy-friendly
                  ranges.
                </p>
              </div>
            </div>
            <div className="phase-item">
              <strong>Weeks 9–11</strong>
              <div>
                <h3>Intensify</h3>
                <p className="muted">
                  Push / Pull / Legs. Heavier compounds, tighter rest, effort ~8/10 with reps still in
                  reserve.
                </p>
              </div>
            </div>
            <div className="phase-item">
              <strong>Week 12</strong>
              <div>
                <h3>Deload</h3>
                <p className="muted">
                  Cut volume ~40–50%. Keep movements, drop grinding. Reset for the next cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
