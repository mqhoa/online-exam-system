import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext'
import { messages, type Language } from './locales'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi')
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key, values) => {
      let message: string = messages[language][key]
      for (const [name, replacement] of Object.entries(values ?? {})) {
        message = message.replaceAll(`{${name}}`, replacement)
      }
      return message
    },
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
