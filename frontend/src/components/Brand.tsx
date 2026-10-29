import { useI18n } from '../i18n'

type BrandProps = {
  light?: boolean
}

export function Brand({ light = false }: BrandProps) {
  const { t } = useI18n()

  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label={t('brandHome')}>
      <span className="brand-symbol" aria-hidden="true">T</span>
      <span className="brand-name">thi<span>.</span>online</span>
    </a>
  )
}
