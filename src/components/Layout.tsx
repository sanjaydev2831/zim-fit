import { NavLink } from 'react-router-dom'
import { useProgressContext } from '../context/ProgressContext'

export function Nav() {
  const { state } = useProgressContext()
  const started = Boolean(state.profile)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          Zim <span>Fit</span>
        </NavLink>
        <nav className="nav-links" aria-label="Main">
          {started && (
            <>
              <NavLink to="/train" className={({ isActive }) => (isActive ? 'active' : '')}>
                Today
              </NavLink>
              <NavLink to="/program" className={({ isActive }) => (isActive ? 'active' : '')}>
                Program
              </NavLink>
              <NavLink to="/guides" className={({ isActive }) => (isActive ? 'active' : '')}>
                Guides
              </NavLink>
            </>
          )}
          {!started && (
            <NavLink to="/guides" className={({ isActive }) => (isActive ? 'active' : '')}>
              Guides
            </NavLink>
          )}
          <NavLink to="/safety" className={({ isActive }) => (isActive ? 'active' : '')}>
            Safety
          </NavLink>
          {!started && (
            <NavLink to="/start" className={({ isActive }) => (isActive ? 'active' : '')}>
              Start
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export function DifficultyMeter({ level }: { level: number }) {
  return (
    <div className="difficulty" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= level ? 'on' : ''} />
      ))}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        Zim Fit is an educational gym guide based on ACSM, NSCA, and public physical-activity
        guidelines. Not medical advice.
      </div>
    </footer>
  )
}
