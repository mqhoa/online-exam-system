import type { AuthenticatedUser } from '../../features/auth/types'
import type { AuthErrorCode } from '../../features/auth/api/authApi'
import { DashboardLayout } from '../../features/dashboard/DashboardLayout'
import { TeacherDashboard } from '../../features/teacher/TeacherDashboard'
import { StudentDashboard } from '../../features/student/StudentDashboard'

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
  if (user.role === 'TEACHER') {
    return (
      <TeacherDashboard
        user={user}
        onSignOut={onSignOut}
        isSigningOut={isSigningOut}
      />
    )
  }

  if (user.role === 'STUDENT') {
    return (
      <StudentDashboard
        user={user}
        onSignOut={onSignOut}
        isSigningOut={isSigningOut}
      />
    )
  }

  return (
    <DashboardLayout
      user={user}
      onSignOut={onSignOut}
      isSigningOut={isSigningOut}
    />
  )
}
