import type { AuthenticatedUser } from '../../features/auth/types'
import type { AuthErrorCode } from '../../features/auth/api/authApi'
import { DashboardLayout } from '../../features/dashboard/DashboardLayout'

type AuthenticatedPageProps = {
  error: AuthErrorCode | null
  isSigningOut: boolean
  onSignOut: () => void
  user: AuthenticatedUser
}

export function AuthenticatedPage({
  isSigningOut,
  onSignOut,
  user,
}: AuthenticatedPageProps) {
  return (
    <DashboardLayout
      user={user}
      onSignOut={onSignOut}
      isSigningOut={isSigningOut}
    />
  )
}
