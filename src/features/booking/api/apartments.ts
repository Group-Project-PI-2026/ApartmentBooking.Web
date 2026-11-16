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

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: () => unwrap(api.GET('/api/apartments/districts')),
    staleTime: Infinity,
  })
}

export function useApartments(search: ApartmentSearch = {}) {
  return useQuery({
    queryKey: ['apartments', search],
    queryFn: () => unwrap(api.GET('/api/apartments', { params: { query: search } })),
  })
}
