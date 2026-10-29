import { useI18n } from '../i18n'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const nextLanguage = language === 'vi' ? 'en' : 'vi'

  return (
    <button
      className="language-switcher"
      type="button"
      aria-label={t('switchLanguage', { language: t(nextLanguage === 'vi' ? 'vietnamese' : 'english') })}
      onClick={() => setLanguage(nextLanguage)}
    >
      <span aria-hidden="true">◎</span>
      {language.toUpperCase()}
    </button>
  )
}
