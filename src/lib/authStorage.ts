const ACCESS_KEY = 'zym-fit-access-token'
const REFRESH_KEY = 'zym-fit-refresh-token'
const EXPIRES_KEY = 'zym-fit-expires-at'
const EMAIL_KEY = 'zym-fit-user-email'

export type StoredSession = {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function getStoredEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY)
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession, email?: string | null) {
  localStorage.setItem(ACCESS_KEY, session.accessToken)
  localStorage.setItem(REFRESH_KEY, session.refreshToken)
  if (session.expiresAt != null) {
    localStorage.setItem(EXPIRES_KEY, String(session.expiresAt))
  }
  if (email) localStorage.setItem(EMAIL_KEY, email)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken())
}
