import { Brand } from '../../components/Brand'
import { useI18n } from '../../i18n'
import type { AuthenticatedUser } from '../../features/auth/types'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { getAuthErrorMessage } from '../../features/auth/authErrors'
import type { AuthErrorCode } from '../../features/auth/api/authApi'

type AuthenticatedPageProps = {
  error: AuthErrorCode | null
  isSigningOut: boolean
  onSignOut: () => void
  user: AuthenticatedUser
}

const roleTranslationKeys = {
  ADMIN: 'roleAdmin',
  TEACHER: 'roleTeacher',
  STUDENT: 'roleStudent',
} as const

export function AuthenticatedPage({
  error,
  isSigningOut,
  onSignOut,
  user,
}: AuthenticatedPageProps) {
  const { t } = useI18n()

  return (
    <main className="authenticated-page">
      <header className="authenticated-header">
        <Brand />
        <div className="authenticated-actions">
          <LanguageSwitcher />
          <button
            className="button button-outline"
            disabled={isSigningOut}
            onClick={onSignOut}
            type="button"
          >
            {isSigningOut ? t('signingOut') : t('signOut')}
          </button>
        </div>
      </header>
      <section className="authenticated-card">
        <span className="success-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">{t('signedIn')}</p>
        <h1>{t('welcomeUser', { name: user.fullName })}</h1>
        <p className="authenticated-role">
          {t('accountRole')}: <strong>{t(roleTranslationKeys[user.role])}</strong>
        </p>
        <p className="authenticated-note">{t('dashboardPlaceholder')}</p>
        {error && <p className="form-alert" role="alert">{getAuthErrorMessage(error, t)}</p>}
      </section>
    </main>
  )
}
