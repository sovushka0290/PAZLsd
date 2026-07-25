import type { AppLocaleCode } from '@fsd/entities/product/model/types'
import { formatAmount } from '@fsd/shared/lib/formatAmount'

export function useFormattedPrice() {
  const { locale, t } = useI18n()
  return (amount: number | null) => {
    if (amount === null || Number.isNaN(amount)) {
      return t('price.onRequest')
    }
    return formatAmount(amount, locale.value as AppLocaleCode)
  }
}
