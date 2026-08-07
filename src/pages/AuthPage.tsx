import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../lib/api'

export function AuthPage() {
  const { apiReady, loggedIn, email, busy, error, clearError, login, signup, logout } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    const ok =
      mode === 'login'
        ? await login(emailInput, password)
        : await signup(emailInput, password, name.trim() || undefined)
    if (ok) navigate('/')
  }

  if (!apiReady) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          <h1 className="display">Account</h1>
          <p className="muted">
            Set <code>VITE_API_URL</code> to your backend (e.g. <code>http://localhost:4000</code>)
            to enable cloud sync.
          </p>
          <Link className="btn btn-primary" to="/start">
            Continue offline
          </Link>
        </div>
      </section>
    )
  }

  if (loggedIn) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          <h1 className="display">Account</h1>
          <p>
            Signed in as <strong>{email ?? 'athlete'}</strong>
          </p>
          <p className="muted">Progress syncs to the cloud while you stay logged in.</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            API: {getApiUrl()}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/train">
              Train
            </Link>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void logout()}>
              Log out
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="section-head">
          <h1 className="display">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
          <p>Save your 12-week progress across devices.</p>
        </div>

        <form className="panel" onSubmit={(e) => void onSubmit(e)}>
          {mode === 'signup' && (
            <>
              <label className="muted" htmlFor="auth-name" style={{ display: 'block', marginBottom: 8 }}>
                Name
              </label>
              <input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                autoComplete="name"
              />
            </>
          )}

          <label className="muted" htmlFor="auth-email" style={{ display: 'block', marginBottom: 8, marginTop: 16 }}>
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={inputStyle}
            autoComplete="email"
          />

          <label className="muted" htmlFor="auth-password" style={{ display: 'block', marginBottom: 8, marginTop: 16 }}>
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && (
            <p style={{ color: 'var(--danger, #c44)', marginTop: 16, marginBottom: 0 }}>{error}</p>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 20, width: '100%' }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" className="linkish" onClick={() => { clearError(); setMode('signup') }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="linkish" onClick={() => { clearError(); setMode('login') }}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--line, #333)',
  background: 'var(--panel, transparent)',
  color: 'inherit',
  font: 'inherit',
}
