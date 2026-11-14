import { useState, type FormEvent } from 'react'
import { useI18n } from '../../../i18n'
import { AuthApiError, authApi, type AuthErrorCode } from '../api/authApi'
import { getAuthErrorMessage } from '../authErrors'
import { LanguageSwitcher } from '../../../components/LanguageSwitcher'
import type { AuthenticatedUser } from '../types'

type LoginFormProps = { error: AuthErrorCode | null; onAuthenticated: (user: AuthenticatedUser) => void }
type FormMode = 'login' | 'forgot' | 'reset'

export function LoginForm({ error: initialError, onAuthenticated }: LoginFormProps) {
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<AuthErrorCode | null>(initialError)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<FormMode>(() => new URLSearchParams(window.location.search).has('resetToken') ? 'reset' : 'login')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();setError(null);setFormError('');setNotice('');setIsSubmitting(true)
    try {
      if (mode === 'forgot') {
        await authApi.requestPasswordReset(email.trim())
        setNotice(t('resetLinkSent'))
      } else if (mode === 'reset') {
        if (password !== confirmPassword) { setFormError(t('passwordMismatch')); return }
        const token = new URLSearchParams(window.location.search).get('resetToken')
        if (!token) { setError('request-failed'); return }
        await authApi.resetPassword(token, password)
        window.history.replaceState(null, '', '/login')
        setMode('login');setPassword('');setConfirmPassword('');setNotice(t('passwordUpdated'))
      } else {
        const user = await authApi.login({ username: username.trim(), password })
        onAuthenticated(user)
      }
    } catch (requestError) {
      setError(requestError instanceof AuthApiError ? requestError.code : 'request-failed')
    } finally { setIsSubmitting(false) }
  }

  function backToLogin() {
    window.history.replaceState(null, '', '/login')
    setMode('login');setError(null);setNotice('')
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form-heading">
        <p className="eyebrow">{mode === 'login' ? t('welcomeBack') : t('welcomeBack')}</p>
        <div className="login-title-row">
          <h1>{mode === 'login' ? t('loginTitle') : mode === 'forgot' ? t('forgotPassword') : t('resetPasswordTitle')}</h1>
          <LanguageSwitcher />
        </div>
        <p>{mode === 'login' ? t('loginDescription') : mode === 'forgot' ? t('forgotPasswordDescription') : t('resetPasswordDescription')}</p>
      </div>

      {(error || formError) && <div className="form-alert" role="alert"><span className="alert-icon" aria-hidden="true">!</span><span>{formError || (error === 'request-failed' && mode !== 'login' ? t('recoveryRequestFailed') : getAuthErrorMessage(error!, t))}</span></div>}
      {notice && <div className="login-notice" role="status">{notice}</div>}

      {mode === 'login' ? <>
        <label className="field-label" htmlFor="username">{t('username')}</label>
        <div className="input-wrap"><span className="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg></span><input autoComplete="username" autoFocus id="username" name="username" onChange={(event) => setUsername(event.target.value)} placeholder={t('usernamePlaceholder')} required value={username} /></div>
        <div className="password-label-row"><label className="field-label" htmlFor="password">{t('password')}</label></div>
        <div className="input-wrap"><span className="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></svg></span><input autoComplete="current-password" id="password" name="password" onChange={(event) => setPassword(event.target.value)} placeholder={t('passwordPlaceholder')} required type={showPassword ? 'text' : 'password'} value={password} /><button aria-label={showPassword ? t('hidePassword') : t('showPassword')} className="password-toggle" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? t('hide') : t('show')}</button></div>
        <div className="password-label-row"><span className="login-help">{t('passwordHelp')}</span><button type="button" className="login-recovery-link" onClick={() => {setMode('forgot');setError(null);setNotice('')}}>{t('forgotPassword')}</button></div>
        <button className="button button-primary login-submit" disabled={isSubmitting} type="submit">{isSubmitting ? <><span className="spinner" aria-hidden="true" />{t('signingIn')}</> : <>{t('signIn')}<span aria-hidden="true">→</span></>}</button>
        <p className="login-security"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>{t('secureNotice')}</p>
      </> : mode === 'forgot' ? <>
        <label className="field-label" htmlFor="recovery-email">{t('email')}</label>
        <div className="input-wrap"><input autoComplete="email" id="recovery-email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder={t('emailPlaceholder')} required type="email" value={email} /></div>
        <button className="button button-primary login-submit" disabled={isSubmitting} type="submit">{isSubmitting ? t('sendingResetLink') : t('sendResetLink')}</button>
        <button type="button" className="login-recovery-link" onClick={backToLogin}>{t('backToLogin')}</button>
      </> : <>
        <label className="field-label" htmlFor="new-password">{t('newPassword')}</label>
        <div className="input-wrap"><input autoComplete="new-password" id="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></div>
        <label className="field-label" htmlFor="confirm-password">{t('confirmNewPassword')}</label>
        <div className="input-wrap"><input autoComplete="new-password" id="confirm-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} /></div>
        <button className="button button-primary login-submit" disabled={isSubmitting} type="submit">{isSubmitting ? t('updatingPassword') : t('updatePassword')}</button>
        <button type="button" className="login-recovery-link" onClick={backToLogin}>{t('backToLogin')}</button>
      </>}
    </form>
  )
}
