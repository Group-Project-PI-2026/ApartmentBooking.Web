export type IsoDate = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toIso(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayIso(): IsoDate {
  return toIso(new Date())
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = fromIso(iso)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

const longDate = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatLongDate(iso: IsoDate): string {
  return longDate.format(fromIso(iso)).replace(/\s*р\.$/, '')
}

const monthName = new Intl.DateTimeFormat('uk-UA', { month: 'long' })

export function formatMonthTitle(date: Date): string {
  const name = monthName.format(date)
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${date.getFullYear()}`
}

export const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

export function monthGrid(month: Date): Array<IsoDate | null> {
  const offset = (month.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<IsoDate | null> = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= days; day++) {
    cells.push(toIso(new Date(month.getFullYear(), month.getMonth(), day)))
  }
  return cells
}

export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  return Math.round((fromIso(checkOut).getTime() - fromIso(checkIn).getTime()) / 86_400_000)
}
