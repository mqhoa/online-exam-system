import type { AuthErrorCode } from './api/authApi'
import type { TranslationKey } from '../../i18n/locales'

const errorTranslationKeys: Record<AuthErrorCode, TranslationKey> = {
  'invalid-credentials': 'invalidCredentials',
  'service-unavailable': 'serviceUnavailable',
  'auth-not-implemented': 'authNotImplemented',
  'invalid-response': 'invalidServerResponse',
  'request-failed': 'unexpectedError',
}

export function getAuthErrorMessage(
  code: AuthErrorCode,
  translate: (key: TranslationKey) => string,
) {
  return translate(errorTranslationKeys[code])
}
