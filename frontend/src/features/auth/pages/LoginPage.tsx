import { LoginForm } from '../components/LoginForm'
import type { AuthErrorCode } from '../api/authApi'
import type { AuthenticatedUser } from '../types'
import { useI18n } from '../../../i18n'
import heroImage from '../../../assets/hero.png'
import loginBg from '../../../assets/login-bg.png'
import './LoginPage.css'

type LoginPageProps = {
  error: AuthErrorCode | null
  onAuthenticated: (user: AuthenticatedUser) => void
}

export function LoginPage({ error, onAuthenticated }: LoginPageProps) {
  const { t } = useI18n()

  return (
    <main className="login-page"
      style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="login-container">

        {/* Banner bên trái */}
        <section
          className="login-story"
          aria-label={t('platformIntroduction')}
        >
          <img
            className="story-image"
            src={heroImage}
            alt=""
          />

          <div className="story-overlay" aria-hidden="true" />

          <div className="story-content">
            <div className="story-brand">
              <span className="story-brand-title">THI.ONLINE</span>
              <span className="story-brand-subtitle">
                NỀN TẢNG THI TRỰC TUYẾN
              </span>
            </div>

            <div className="story-copy">
              <p className="story-eyebrow">
                {t('platformEyebrow')}
              </p>

              <h2>{t('platformHeadline')}</h2>

              <p className="story-description">
                {t('platformDescription')}
              </p>
            </div>

          </div>
        </section>

        {/* Form đăng nhập bên phải */}
        <section className="login-panel">

          <div className="login-form-wrap">
            <LoginForm
              error={error}
              onAuthenticated={onAuthenticated}
            />
          </div>

          <footer className="login-footer">
            <span>{t('copyright')}</span>
            <span>{t('support')}</span>
          </footer>

        </section>
      </div>
    </main>
  )
}