import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgressContext } from '../context/ProgressContext'
import { askAiCoach, isApiConfigured } from '../lib/api'

export function CoachPage() {
  const { loggedIn, apiReady } = useAuth()
  const { state } = useProgressContext()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onAsk(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    if (!isApiConfigured() || !apiReady) {
      setError('API is not configured')
      return
    }
    if (!loggedIn) {
      setError('Log in to use the AI coach with your progress context.')
      return
    }
    if (!state.profile) {
      setError('Finish setup first so the coach knows your program.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await askAiCoach(question.trim())
      setAnswer(res.answer)
      setModel(res.model)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coach request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <p className="muted" style={{ margin: 0 }}>
            Gemini coach
          </p>
          <h1 className="display">Ask your trainer</h1>
          <p>
            Questions about load, swaps, focus guides, or recovery — answered with your current
            profile and recent training context.
          </p>
        </div>

        {state.profile?.aiSummary && (
          <div className="panel">
            <p className="muted" style={{ marginTop: 0 }}>
              Your AI plan summary
            </p>
            <p style={{ marginBottom: 0 }}>{state.profile.aiSummary}</p>
            {state.profile.aiPlanNotes && (
              <p className="muted" style={{ marginBottom: 0, marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {state.profile.aiPlanNotes}
              </p>
            )}
          </div>
        )}

        <form className="panel" onSubmit={(e) => void onAsk(e)}>
          <label className="muted" htmlFor="coach-q" style={{ display: 'block', marginBottom: 8 }}>
            Your question
          </label>
          <textarea
            id="coach-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="Should I add weight on bench if last week was 40 kg × 10 @ RPE 7?"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 4,
              border: '1px solid var(--line)',
              background: 'var(--bg-soft)',
              color: 'var(--text)',
              resize: 'vertical',
            }}
          />
          {error && (
            <p className="alert" style={{ marginTop: '0.75rem' }}>
              {error}{' '}
              {!loggedIn && (
                <Link to="/account" style={{ color: 'inherit', fontWeight: 700 }}>
                  Log in
                </Link>
              )}
              {!state.profile && loggedIn && (
                <Link to="/start" style={{ color: 'inherit', fontWeight: 700 }}>
                  Start setup
                </Link>
              )}
            </p>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy || !question.trim()}
            style={{ marginTop: '0.85rem' }}
          >
            {busy ? 'Thinking…' : 'Ask coach'}
          </button>
        </form>

        {answer && (
          <div className="panel">
            <p className="muted" style={{ marginTop: 0 }}>
              Answer{model ? ` · ${model}` : ''}
            </p>
            <div style={{ whiteSpace: 'pre-wrap' }}>{answer}</div>
          </div>
        )}
      </div>
    </section>
  )
}
