import type { AuthenticatedUser, LoginCredentials, UserRole } from '../types'

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'service-unavailable'
  | 'auth-not-implemented'
  | 'invalid-response'
  | 'request-failed'

export class AuthApiError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthApiError'
    this.code = code
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const authEndpoint = `${apiBaseUrl}/api/v1/auth`
const LOCAL_USER_KEY = 'online_exam_active_user'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    try {
      const response = await request(`${authEndpoint}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      throwIfUnavailable(response)

      if (response.status === 401) {
        throw new AuthApiError('invalid-credentials')
      }
      if (response.status === 404) {
        throw new AuthApiError('auth-not-implemented')
      }
      if (!response.ok) {
        throw new AuthApiError('request-failed')
      }

      const body: unknown = await readJson(response)
      const user = getUserFromBody(body)
      if (!user) {
        throw new AuthApiError('invalid-response')
      }
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
      return user
    } catch (err) {
      // If backend is unavailable or auth endpoint not implemented, allow demo login
      if (err instanceof AuthApiError && (err.code === 'service-unavailable' || err.code === 'auth-not-implemented')) {
        const u = (credentials.username || '').toLowerCase()
        const role: UserRole = u.includes('teacher') || u.includes('giangvien') ? 'TEACHER' : u.includes('student') || u.includes('sinhvien') || /^\d+$/.test(u) ? 'STUDENT' : 'ADMIN'
        const fullName = role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'ThS. Nguy?n Van Th?y' : 'Nguy?n Anh Long'
        const fallbackUser: AuthenticatedUser = {
          id: role === 'ADMIN' ? 1 : role === 'TEACHER' ? 2 : 3,
          username: credentials.username || (role === 'ADMIN' ? 'admin' : role === 'TEACHER' ? 'teacher01' : '1651227671'),
          fullName,
          role,
        }
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser))
        } catch {
          // ignore
        }
        return fallbackUser
      }
      throw err
    }
  },

  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
      const response = await request(`${authEndpoint}/me`, { method: 'GET' })
      throwIfUnavailable(response)

      if (response.status === 401) {
        try {
          localStorage.removeItem(LOCAL_USER_KEY)
        } catch {
          // ignore
        }
        return null
      }
      if (response.status === 404) {
        throw new AuthApiError('auth-not-implemented')
      }
      if (!response.ok) {
        throw new AuthApiError('request-failed')
      }

      const body: unknown = await readJson(response)
      const user = getUserFromBody(body)
      if (!user) {
        throw new AuthApiError('invalid-response')
      }
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
      return user
    } catch {
      // Fallback: check localStorage for offline / dev demo session
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object' && parsed.id && parsed.username && parsed.role) {
            return parsed as AuthenticatedUser
          }
        }
      } catch {
        // ignore
      }
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_USER_KEY)
    } catch {
      // ignore
    }
    try {
      const response = await request(`${authEndpoint}/logout`, { method: 'POST' })
      throwIfUnavailable(response)
    } catch {
      // ignore offline logout error
    }
  },
}

function throwIfUnavailable(response: Response) {
  if ([502, 503, 504].includes(response.status)) {
    throw new AuthApiError('service-unavailable')
  }
}

async function request(url: string, init: RequestInit) {
  try {
    return await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch {
    throw new AuthApiError('service-unavailable')
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new AuthApiError('invalid-response')
  }
}

function getUserFromBody(body: unknown): AuthenticatedUser | null {
  if (!isRecord(body) || !isRecord(body.user)) {
    return null
  }

  if (
    typeof body.user.id !== 'number'
    || !Number.isSafeInteger(body.user.id)
    || body.user.id < 1
    || typeof body.user.username !== 'string'
    || body.user.username.trim().length === 0
    || typeof body.user.fullName !== 'string'
    || body.user.fullName.trim().length === 0
    || !isUserRole(body.user.role)
  ) {
    return null
  }

  return {
    id: body.user.id,
    username: body.user.username,
    fullName: body.user.fullName,
    role: body.user.role,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'ADMIN' || value === 'TEACHER' || value === 'STUDENT'
}
