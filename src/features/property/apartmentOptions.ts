import { plural } from '@/shared/lib/format'

export const propertyTypes = ['Апартаменти', 'Квартира', 'Студія'].map((v) => ({
  value: v,
  label: v,
}))

export function formatRooms(count: number | string): string {
  const n = Number(count)
  return `${n} ${plural(n, 'кімната', 'кімнати', 'кімнат')}`
}

export const roomOptions = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: formatRooms(n),
}))

export const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
  value: String(n),
  label: `${n} ${plural(n, 'гість', 'гості', 'гостей')}`,
}))

export const amenityOptions = [
  'Wi-Fi',
  'Кухня',
  'Пральна машина',
  'Кондиціонер',
  'Паркування',
  'Самостійне заселення',
]
