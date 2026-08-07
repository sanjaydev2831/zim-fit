import { useCatalog } from '../context/CatalogContext'

export function SafetyPage() {
  const { safety } = useCatalog()
  const { redFlags, beforeYouTrain, limits, disclaimers, sources } = safety

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="display">Safety & limits</h1>
          <p>
            Evidence-informed precautions from ACSM preparticipation screening, PAR-Q+, NSCA
            progression principles, and the 2026 ACSM resistance-training position stand.
          </p>
        </div>

        <div className="panel">
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>Stop and get help if…</h2>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            {redFlags.map((item) => (
              <article key={item.title} className="feature" style={{ borderTop: 'none', paddingTop: 0 }}>
                <h3 style={{ color: 'var(--danger)' }}>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>Before you train</h2>
          <div className="phase-row" style={{ marginTop: '0.5rem' }}>
            {beforeYouTrain.map((item) => (
              <div className="phase-item" key={item.title}>
                <strong>Check</strong>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1rem' }}>
                    {item.title}
                  </h3>
                  <p className="muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>
            Program limitations (how a smart trainer progresses you)
          </h2>
          <div className="phase-row" style={{ marginTop: '0.5rem' }}>
            {limits.map((item) => (
              <div className="phase-item" key={item.title}>
                <strong>Limit</strong>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1rem' }}>
                    {item.title}
                  </h3>
                  <p className="muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}>What this guide is not</h2>
          <ul className="steps">
            {disclaimers.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="section-head" style={{ marginTop: '2.5rem' }}>
          <h2 className="display">Sources</h2>
          <p>Primary references used to shape progression, volume targets, and screening.</p>
        </div>
        <div className="source-list">
          {sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              <strong>{s.name}</strong>
              <p>{s.what}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
