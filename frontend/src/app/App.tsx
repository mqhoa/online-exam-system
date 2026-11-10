import { useEffect, useState } from 'react'
import { authApi, AuthApiError } from '../features/auth/api/authApi'
import type { AuthenticatedUser, UserRole } from '../features/auth/types'
import { useI18n } from '../i18n'
import { authenticationCallback } from './callbacks/authenticationCallback'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AuthenticatedPage } from './pages/AuthenticatedPage'

export function App() {
  const { t } = useI18n()
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState<AuthApiError['code'] | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    authApi.getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
          if (currentUser) {
            authenticationCallback(currentUser)
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setSessionError(getAuthErrorCode(error))
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)
    setSessionError(null)
    try {
      await authApi.logout()
      setUser(null)
      window.history.replaceState(null, '', '/login')
    } catch (error) {
      setSessionError(getAuthErrorCode(error))
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleSwitchRole(role: UserRole) {
    const updatedUser: AuthenticatedUser = {
      id: role === 'ADMIN' ? 1 : role === 'TEACHER' ? 2 : 3,
      username: role === 'ADMIN' ? 'admin' : role === 'TEACHER' ? 'teacher' : 'student',
      fullName:
        role === 'ADMIN'
          ? 'Admin'
          : role === 'TEACHER'
          ? 'ThS. Nguyễn Văn Thầy'
          : 'Nguyễn Anh Long',
      role,
    }
    setUser(updatedUser)
    authenticationCallback(updatedUser)
    try {
      localStorage.setItem('online_exam_active_user', JSON.stringify(updatedUser))
    } catch {
      // ignore
    }
  }

  if (isCheckingSession) {
    return (
      <main className="app-loading" aria-live="polite">
        <span className="loading-mark" aria-hidden="true">T</span>
        <p>{t('checkingSession')}</p>
      </main>
    )
  }

  if (user) {
    return (
      <AuthenticatedPage
        error={sessionError}
        isSigningOut={isSigningOut}
        onSignOut={handleSignOut}
        user={user}
        onSwitchRole={handleSwitchRole}
      />
    )
  }

  return (
    <LoginPage
      error={sessionError}
      onAuthenticated={(authenticatedUser) => {
        authenticationCallback(authenticatedUser)
        setSessionError(null)
        setUser(authenticatedUser)
      }}
    />
  )
}

function getAuthErrorCode(error: unknown): AuthApiError['code'] {
  return error instanceof AuthApiError ? error.code : 'request-failed'
}
