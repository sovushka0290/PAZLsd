import type { AppLocaleCode } from '@fsd/entities/product/model/types'

const intlLocale: Record<AppLocaleCode, string> = {
  kk: 'kk-KZ',
  ru: 'ru-RU',
  en: 'en-US'
}

export function formatAmount(amount: number, locale: AppLocaleCode): string {
  return new Intl.NumberFormat(intlLocale[locale] ?? 'ru-RU', {
    maximumFractionDigits: 0
  }).format(amount)
}
