const number = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 })

export function formatPrice(value: number | string): string {
  return `${number.format(Number(value))} ₴`
}

export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function formatGuests(count: number | string): string {
  const n = Number(count)
  return `${n} ${plural(n, 'гість', 'гості', 'гостей')}`
}

export function formatNights(count: number): string {
  return `${count} ${plural(count, 'ніч', 'ночі', 'ночей')}`
}

export function formatFileSize(bytes: number): string {
  const decimal = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 })
  if (bytes < 1024 * 1024) return `${decimal.format(bytes / 1024)} КБ`
  return `${decimal.format(bytes / 1024 / 1024)} МБ`
}
