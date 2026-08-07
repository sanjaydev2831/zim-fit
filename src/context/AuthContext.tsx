import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as api from '../lib/api'
import {
  clearSession,
  getAccessToken,
  getStoredEmail,
  isLoggedIn as readLoggedIn,
} from '../lib/authStorage'

type AuthContextValue = {
  apiReady: boolean
  loggedIn: boolean
  email: string | null
  busy: boolean
  error: string | null
  clearError: () => void
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  /** Bump when auth changes so progress can re-sync */
  authEpoch: number
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() => readLoggedIn())
  const [email, setEmail] = useState<string | null>(() => getStoredEmail())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authEpoch, setAuthEpoch] = useState(0)

  const apiReady = api.isApiConfigured()

  const bump = useCallback(() => setAuthEpoch((n) => n + 1), [])

  const login = useCallback(async (emailInput: string, password: string) => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.login(emailInput.trim(), password)
      if (!res.session) {
        setError(res.message ?? 'Check your email to confirm the account, then log in.')
        return false
      }
      setLoggedIn(true)
      setEmail(res.user?.email ?? emailInput.trim())
      bump()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    } finally {
      setBusy(false)
    }
  }, [bump])

  const signup = useCallback(async (emailInput: string, password: string, name?: string) => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.signup(emailInput.trim(), password, name)
      if (!res.session) {
        setError(res.message ?? 'Account created — confirm email, then log in.')
        return false
      }
      setLoggedIn(true)
      setEmail(res.user?.email ?? emailInput.trim())
      bump()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      return false
    } finally {
      setBusy(false)
    }
  }, [bump])

  const logout = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await api.logout()
    } finally {
      clearSession()
      setLoggedIn(false)
      setEmail(null)
      bump()
      setBusy(false)
    }
  }, [bump])

  const value = useMemo<AuthContextValue>(
    () => ({
      apiReady,
      loggedIn: loggedIn && Boolean(getAccessToken()),
      email,
      busy,
      error,
      clearError: () => setError(null),
      login,
      signup,
      logout,
      authEpoch,
    }),
    [apiReady, loggedIn, email, busy, error, login, signup, logout, authEpoch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
