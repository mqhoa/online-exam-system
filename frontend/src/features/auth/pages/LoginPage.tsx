import { Brand } from '../../../components/Brand'
import { LanguageSwitcher } from '../../../components/LanguageSwitcher'
import { LoginForm } from '../components/LoginForm'
import type { AuthErrorCode } from '../api/authApi'
import type { AuthenticatedUser } from '../types'
import { useI18n } from '../../../i18n'
import './LoginPage.css'

type LoginPageProps = {
  error: AuthErrorCode | null
  onAuthenticated: (user: AuthenticatedUser) => void
}

export function LoginPage({ error, onAuthenticated }: LoginPageProps) {
  const { t } = useI18n()

  return (
    <main className="login-page">
      <section className="login-story" aria-label={t('platformIntroduction')}>
        <div className="story-grid" aria-hidden="true" />
        <div className="story-content">
          <Brand light />
          <div className="story-copy">
            <p className="story-eyebrow">{t('platformEyebrow')}</p>
            <h2>{t('platformHeadline')}</h2>
            <p className="story-description">{t('platformDescription')}</p>
            <ul className="story-features">
              <li><span>01</span>{t('featureQuestionBank')}</li>
              <li><span>02</span>{t('featureSecureExam')}</li>
              <li><span>03</span>{t('featureResults')}</li>
            </ul>
          </div>
          <div className="story-bottom">
            <span className="story-rule" />
            <p>{t('institutionalAccess')}</p>
            <span>{t('platformTagline')}</span>
          </div>
        </div>
        <div className="story-orbit story-orbit-one" aria-hidden="true" />
        <div className="story-orbit story-orbit-two" aria-hidden="true" />
        <div className="story-accent-card" aria-hidden="true">
          <span className="accent-card-label">EXAM / 2026</span>
          <span className="accent-card-line accent-card-long" />
          <span className="accent-card-line" />
          <span className="accent-card-line accent-card-short" />
          <span className="accent-card-dot">✓</span>
        </div>
      </section>

      <section className="login-panel">
        <header className="login-header">
          <span>{t('existingAccount')}</span>
          <LanguageSwitcher />
        </header>
        <div className="login-form-wrap">
          <LoginForm error={error} onAuthenticated={onAuthenticated} />
        </div>
        <footer className="login-footer">
          <span>{t('copyright')}</span>
          <span>{t('support')}</span>
        </footer>
      </section>
    </main>
  )
}
