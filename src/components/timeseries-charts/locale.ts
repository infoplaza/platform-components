import type { SupportedLocale } from '@/src/utilities/date'

export function toSupportedLocale(locale: string | undefined): SupportedLocale {
  if (
    locale === 'nl' ||
    locale === 'de' ||
    locale === 'it' ||
    locale === 'es' ||
    locale === 'fr' ||
    locale === 'en'
  ) {
    return locale
  }
  return 'en'
}
