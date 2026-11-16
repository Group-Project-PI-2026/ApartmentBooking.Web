import { useQuery } from '@tanstack/react-query'
import { api, unwrap, type components } from '@/shared/api'

export type ApartmentCardDto = components['schemas']['ApartmentCardDto']
export type ApartmentDetailsDto = components['schemas']['ApartmentDetailsDto']
export type DistrictDto = components['schemas']['DistrictDto']

export interface ApartmentSearch {
  districtId?: string
  checkIn?: string
  checkOut?: string
  guestsCount?: string
}

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== '' && v != null),
  ) as Partial<T>
}

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: () => unwrap(api.GET('/api/apartments/districts')),
    staleTime: Infinity,
  })
}

export function useApartments(search: ApartmentSearch = {}, enabled = true) {
  const query = compact(search)
  return useQuery({
    queryKey: ['apartments', query],
    queryFn: () => unwrap(api.GET('/api/apartments', { params: { query } })),
    enabled,
  })
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => unwrap(api.GET('/api/apartments/{id}', { params: { path: { id } } })),
  })
}
