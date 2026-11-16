import { useQuery } from '@tanstack/react-query'
import { formatLongDate, toIso } from '@/shared/lib/date'
import demoPhoto from '../assets/owners-hero.jpg'
import type { PublicationState } from './managerApartments'

export interface OwnerObject {
  id: string
  title: string
  description: string
  district: string
  address: string
  rooms: number
  maxGuests: number
  amenities: string[]
  photos: string[]
  state: PublicationState
}

export interface ObjectStats {
  id: string
  title: string
  bookings: number
  nights: number
  occupancy: number
}

export interface OwnerStatistics {
  days: number
  rows: ObjectStats[]
  total: Omit<ObjectStats, 'id' | 'title'>
}

const objects: OwnerObject[] = [
  {
    id: 'demo-1',
    title: 'Апартаменти на Подолі',
    description: 'Апартаменти для короткострокового проживання у Києві.',
    district: 'Подільський',
    address: 'Демонстраційна адреса 1, Київ',
    rooms: 1,
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Кухня', 'Пральна машина', 'Самостійне заселення'],
    photos: [demoPhoto, demoPhoto, demoPhoto],
    state: 'Published',
  },
]

const bookedNights: Record<string, Record<number, [number, number]>> = {
  'demo-1': { 0: [6, 18], 1: [5, 14], 3: [4, 11] },
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 300))

export function useOwnerObjects() {
  return useQuery({
    queryKey: ['owner', 'objects'],
    queryFn: async () => {
      await delay()
      return objects
    },
  })
}

export function useOwnerObject(id: string) {
  return useQuery({
    queryKey: ['owner', 'objects', id],
    queryFn: async () => {
      await delay()
      const found = objects.find((o) => o.id === id)
      if (!found) throw new Error('Not found')
      return found
    },
    enabled: Boolean(id),
    retry: false,
  })
}

export interface Period {
  value: string
  label: string
  monthsAgo: number
  days: number
}

export function recentPeriods(count = 4, today = new Date()): Period[] {
  return Array.from({ length: count }, (_, monthsAgo) => {
    const last = new Date(today.getFullYear(), today.getMonth() - monthsAgo + 1, 0)
    return {
      value: toIso(last).slice(0, 7),
      label: `1–${formatLongDate(toIso(last))}`,
      monthsAgo,
      days: last.getDate(),
    }
  })
}

export function useOwnerStatistics(objectId: string, period: Period) {
  return useQuery({
    queryKey: ['owner', 'statistics', objectId, period.value],
    queryFn: async (): Promise<OwnerStatistics> => {
      await delay()
      const rows = objects
        .filter((o) => !objectId || o.id === objectId)
        .map((o) => {
          const [bookings, nights] = bookedNights[o.id]?.[period.monthsAgo] ?? [0, 0]
          return { id: o.id, title: o.title, bookings, nights, occupancy: nights / period.days }
        })
        .filter((r) => r.bookings > 0)
      const bookings = rows.reduce((sum, r) => sum + r.bookings, 0)
      const nights = rows.reduce((sum, r) => sum + r.nights, 0)
      const capacity = period.days * Math.max(rows.length, 1)
      return { days: period.days, rows, total: { bookings, nights, occupancy: nights / capacity } }
    },
  })
}
