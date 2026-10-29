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

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
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
    return user
  },

  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const response = await request(`${authEndpoint}/me`, { method: 'GET' })
    throwIfUnavailable(response)

    if (response.status === 401) {
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
    return user
  },

  async logout(): Promise<void> {
    const response = await request(`${authEndpoint}/logout`, { method: 'POST' })
    throwIfUnavailable(response)
    if (!response.ok) {
      throw new AuthApiError(response.status === 404 ? 'auth-not-implemented' : 'request-failed')
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
