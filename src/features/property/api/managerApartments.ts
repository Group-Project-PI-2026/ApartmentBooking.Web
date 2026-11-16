import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import demoPhoto from '../assets/owners-hero.jpg'

export type PublicationState = 'Published' | 'Draft' | 'Archived'

export interface ApartmentPhoto {
  id: string
  url: string
  name: string
}

export interface ManagerApartment {
  id: string
  title: string
  description: string
  propertyType: string
  rooms: number
  maxGuests: number
  district: string
  street: string
  building: string
  flat: string
  ownerName: string | null
  amenities: string[]
  photos: ApartmentPhoto[]
  pricePerNight: number
  checkIn: string
  checkOut: string
  rules: string
  checkInInstructions: string
  state: PublicationState
}

export type ApartmentInput = Omit<ManagerApartment, 'id' | 'ownerName'>

export const kyivDistricts = [
  'Голосіївський',
  'Дарницький',
  'Деснянський',
  'Дніпровський',
  'Оболонський',
  'Печерський',
  'Подільський',
  'Святошинський',
  'Солом’янський',
  'Шевченківський',
]

const photo = (id: string): ApartmentPhoto => ({ id, url: demoPhoto, name: 'Фото (демо)' })

const base = {
  description: 'Апартаменти для короткострокового проживання в Києві.',
  propertyType: 'Апартаменти',
  flat: '',
  amenities: ['Wi-Fi', 'Кухня', 'Пральна машина', 'Самостійне заселення'],
  checkIn: 'Після 15:00',
  checkOut: 'До 11:00',
  rules: 'Без куріння у помешканні.',
  checkInInstructions: 'Після прибуття скористайтеся інструкцією, надісланою в день заселення.',
}

let store: ManagerApartment[] = [
  {
    ...base,
    id: 'demo-1',
    title: 'Апартаменти на Подолі',
    rooms: 1,
    maxGuests: 2,
    district: 'Подільський',
    street: 'Демонстраційна вулиця',
    building: '1',
    ownerName: 'Власник 01 (демо)',
    photos: [photo('p1')],
    pricePerNight: 1800,
    state: 'Published',
  },
  {
    ...base,
    id: 'demo-2',
    title: 'Квартира біля метро',
    propertyType: 'Квартира',
    rooms: 1,
    maxGuests: 2,
    district: 'Шевченківський',
    street: 'Демонстраційна вулиця',
    building: '2',
    ownerName: 'Власник 02 (демо)',
    photos: [photo('p2')],
    pricePerNight: 1600,
    state: 'Draft',
  },
  {
    ...base,
    id: 'demo-3',
    title: 'Апартаменти на Печерську',
    rooms: 2,
    maxGuests: 4,
    district: 'Печерський',
    street: 'Демонстраційна вулиця',
    building: '3',
    ownerName: 'Власник 03 (демо)',
    photos: [photo('p3')],
    pricePerNight: 2200,
    state: 'Archived',
  },
]

const delay = () => new Promise((resolve) => setTimeout(resolve, 300))
const key = ['manager', 'apartments'] as const

export function apartmentAddress(a: Pick<ManagerApartment, 'street' | 'building' | 'flat'>) {
  return [a.street, a.building, a.flat && `кв. ${a.flat}`].filter(Boolean).join(', ')
}

export function useManagerApartments() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      await delay()
      return [...store]
    },
  })
}

export function useManagerApartment(id: string) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: async () => {
      await delay()
      const found = store.find((a) => a.id === id)
      if (!found) throw new Error('Not found')
      return found
    },
    enabled: Boolean(id),
    retry: false,
  })
}

export function useSaveApartment(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ApartmentInput) => {
      await delay()
      if (id) {
        store = store.map((a) => (a.id === id ? { ...a, ...input } : a))
        return store.find((a) => a.id === id)!
      }
      const created: ManagerApartment = { ...input, id: crypto.randomUUID(), ownerName: null }
      store = [created, ...store]
      return created
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useArchiveApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      store = store.map((a) => (a.id === id ? { ...a, state: 'Archived' } : a))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
