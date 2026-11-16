import { bookingPaths } from './paths'

export interface SearchQuery {
  districtId: string
  checkIn: string
  checkOut: string
  guests: string
}

export const emptySearch: SearchQuery = { districtId: '', checkIn: '', checkOut: '', guests: '' }

export function readSearch(params: URLSearchParams): SearchQuery {
  return {
    districtId: params.get('districtId') ?? '',
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    guests: params.get('guests') ?? '',
  }
}

export function searchUrl(query: Partial<SearchQuery>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `${bookingPaths.search}?${qs}` : bookingPaths.search
}
