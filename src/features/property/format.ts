import { formatLongDate, toIso } from '@/shared/lib/date'

const shortDate = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatShortDate(value: string): string {
  return shortDate.format(new Date(value))
}

export function formatSubmitted(value: string): string {
  return formatLongDate(toIso(new Date(value)))
}
