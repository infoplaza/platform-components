import { format as dateFormat } from 'date-fns'
import { nl as localeNL, de as localeDE, it as localeIT, es as localeES, fr as localeFR } from 'date-fns/locale'
import type { Locale } from 'date-fns'

// Type definitions
export type SupportedLocale = 'nl' | 'de' | 'it' | 'es' | 'fr' | 'en'
export type SupportedTimezone = string | 'UTC'

interface FormatTimeResult {
    dayMonth: string
    dayWeek: string
    month: string
    hour: string
    minute: string
}

interface LocaleOptions {
    locale?: Locale
}

// Cache for locale options to avoid repeated object creation
const localeOptionsCache = new Map<SupportedLocale, LocaleOptions>()

// Cache for timezone conversions to avoid repeated expensive operations
const timezoneCache = new Map<string, Date>()

// Helper function to get locale options for date formatting with caching
function getLocaleOptions(locale: SupportedLocale): LocaleOptions {
    if (localeOptionsCache.has(locale)) {
        return localeOptionsCache.get(locale)!
    }
    
    const options: LocaleOptions = {}
    if (locale === 'nl') options.locale = localeNL
    if (locale === 'de') options.locale = localeDE
    if (locale === 'it') options.locale = localeIT
    if (locale === 'es') options.locale = localeES
    if (locale === 'fr') options.locale = localeFR
    
    localeOptionsCache.set(locale, options)
    return options
}

// Helper function to convert datetime to timezone with caching
function convertToTimezone(datetime: string | number | Date, timezone: SupportedTimezone): Date {
    // Create cache key from datetime and timezone
    const datetimeStr = typeof datetime === 'string' ? datetime : datetime.toString()
    const cacheKey = `${datetimeStr}-${timezone}`
    
    if (timezoneCache.has(cacheKey)) {
        return timezoneCache.get(cacheKey)!
    }
    
    // Convert to timezone
    const dtTime = new Date(datetime).toLocaleString('en-US', { timeZone: timezone })
    const convertedDate = new Date(dtTime)
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (timezoneCache.size > 1000) {
        timezoneCache.clear()
    }
    timezoneCache.set(cacheKey, convertedDate)
    
    return convertedDate
}

export function formatRun(runtime: number | null | undefined, locale: SupportedLocale): string | null {
    if (runtime) {
        const time = runtime * 1000
        const hour = formatDate(time, 'HH', locale, 'UTC')
        const minute = formatDate(time, 'mm', locale, 'UTC')
        const day = formatDate(time, 'd', locale, 'UTC')
        const month = formatDate(time, 'LLL', locale, 'UTC')

        if (minute === '00') {
            return `${hour}z ${day} ${month}`
        }

        return `${hour}:${minute}z ${day} ${month}`
    }

    return null
}

export function formatTime(
    datetime: string | number | Date | null | undefined,
    locale: SupportedLocale,
    timezone: SupportedTimezone,
    utcTimezone: boolean = false
): FormatTimeResult | null {
    if (datetime) {
        // Use UTC timezone if the setting is enabled, otherwise use the provided timezone
        const effectiveTimezone: SupportedTimezone = utcTimezone ? 'UTC' : timezone
        
        // Optimize for UTC: when timezone is UTC, we can format directly without conversion
        if (effectiveTimezone !== 'UTC') {
            const date = new Date(datetime)
            const options = getLocaleOptions(locale)
            
            return {
                dayMonth: dateFormat(date, 'd', options) ?? '',
                dayWeek: dateFormat(date, 'EEEEEE', options) ?? '',
                month: dateFormat(date, 'MMM', options) ?? '',
                hour: dateFormat(date, 'HH', options) ?? '',
                minute: dateFormat(date, 'mm', options) ?? '',
            }
        }
        
        return {
            dayMonth: formatDate(datetime, 'd', locale, effectiveTimezone) ?? '',
            dayWeek: formatDate(datetime, 'EEEEEE', locale, effectiveTimezone) ?? '',
            month: formatDate(datetime, 'MMM', locale, effectiveTimezone) ?? '',
            hour: formatDate(datetime, 'HH', locale, effectiveTimezone) ?? '',
            minute: formatDate(datetime, 'mm', locale, effectiveTimezone) ?? '',
        }      
    }

    return null
}

export function formatDate(
    datetime: string | number | Date | null | undefined,
    format: string,
    locale: SupportedLocale,
    timezone?: SupportedTimezone
): string | null {
    if (!datetime) {
        return ''
    }
    
    try {
        let dtTimezone: Date
        
        // Optimize for UTC: skip timezone conversion when timezone is UTC
        if (timezone) {
            dtTimezone = convertToTimezone(datetime, timezone)
        } else {
            dtTimezone = new Date(datetime)
        }

        const options = getLocaleOptions(locale)
        return dateFormat(dtTimezone, format, options)
    } catch (error) {
        console.error('Error formatting date', error, datetime, format, locale, timezone)
        return null
    }
}
