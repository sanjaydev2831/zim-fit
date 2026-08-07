import type { ProgressState, UserProfile } from '../data/types'
import type { FocusGuideId } from '../data/focusGuides'
import { clearSession, getAccessToken, getRefreshToken, saveSession } from './authStorage'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export function isApiConfigured(): boolean {
  return Boolean(API_URL)
}

export function getApiUrl(): string {
  return API_URL
}

type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

type AuthResponse = {
  user: { id: string; email?: string | null } | null
  session: AuthSession | null
  message?: string
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string }
    return body.error ?? res.statusText
  } catch {
    return res.statusText || 'Request failed'
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken || !API_URL) return null

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    clearSession()
    return null
  }
  const data = (await res.json()) as AuthResponse
  if (!data.session) {
    clearSession()
    return null
  }
  saveSession(data.session)
  return data.session.accessToken
}

async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not set')

  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  let token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (res.status === 401 && retry) {
    token = await refreshAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
      res = await fetch(`${API_URL}${path}`, { ...init, headers })
    }
  }

  if (!res.ok) throw new Error(await parseError(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function signup(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, false)
  if (data.session) saveSession(data.session, data.user?.email ?? email)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
  if (data.session) saveSession(data.session, data.user?.email ?? email)
  return data
}

export async function logout(): Promise<void> {
  try {
    if (API_URL && getAccessToken()) {
      await apiFetch('/api/auth/logout', { method: 'POST' }, false)
    }
  } finally {
    clearSession()
  }
}

export async function fetchProgress(): Promise<ProgressState> {
  return apiFetch<ProgressState>('/api/progress')
}

export async function startOnboarding(
  profile: Omit<UserProfile, 'startDate'> & { startDate?: string },
): Promise<ProgressState> {
  return apiFetch<ProgressState>('/api/progress/start', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export async function patchProfile(patch: Partial<UserProfile>): Promise<ProgressState> {
  return apiFetch<ProgressState>('/api/progress/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export async function completeSessionRemote(sessionId: string): Promise<ProgressState> {
  return apiFetch<ProgressState>(`/api/progress/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
  })
}

export async function markIncompleteRemote(sessionId: string): Promise<ProgressState> {
  return apiFetch<ProgressState>(
    `/api/progress/sessions/${encodeURIComponent(sessionId)}/incomplete`,
    { method: 'POST' },
  )
}

export async function jumpToRemote(week: number, day: number): Promise<ProgressState> {
  return apiFetch<ProgressState>('/api/progress/jump', {
    method: 'PATCH',
    body: JSON.stringify({ week, day }),
  })
}

export async function resetProgressRemote(): Promise<ProgressState> {
  return apiFetch<ProgressState>('/api/progress', { method: 'DELETE' })
}

export async function addFocusGuideRemote(guideId: FocusGuideId): Promise<ProgressState> {
  return apiFetch<ProgressState>(`/api/progress/focus-guides/${guideId}`, { method: 'POST' })
}

export async function removeFocusGuideRemote(guideId: FocusGuideId): Promise<ProgressState> {
  return apiFetch<ProgressState>(`/api/progress/focus-guides/${guideId}`, { method: 'DELETE' })
}

export async function completeFocusSessionRemote(
  guideId: FocusGuideId,
  body: {
    sessionId: string
    week: number
    sessionNum: number
    sessionsPerWeek: number
    totalWeeks: number
  },
): Promise<ProgressState> {
  return apiFetch<ProgressState>(`/api/progress/focus-guides/${guideId}/sessions/complete`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
