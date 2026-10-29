import type { AuthenticatedUser } from '../../features/auth/types'

const roleHomePaths = {
  ADMIN: '/app/admin',
  TEACHER: '/app/teacher',
  STUDENT: '/app/student',
} as const

export function authenticationCallback(user: AuthenticatedUser) {
  const destination = roleHomePaths[user.role]
  window.history.replaceState(null, '', destination)
  return destination
}
