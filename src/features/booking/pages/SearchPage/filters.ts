import type { ApartmentCardDto } from '../../api/apartments'

export interface Filters {
  priceFrom: string
  priceTo: string
  districtIds: string[]
  amenities: string[]
}

export const emptyFilters: Filters = { priceFrom: '', priceTo: '', districtIds: [], amenities: [] }

export type SortOrder = 'recommended' | 'priceAsc' | 'priceDesc'

export const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'recommended', label: 'Спочатку рекомендовані' },
  { value: 'priceAsc', label: 'Спочатку дешевші' },
  { value: 'priceDesc', label: 'Спочатку дорожчі' },
]

export function hasFilters(f: Filters) {
  return Boolean(f.priceFrom || f.priceTo || f.districtIds.length || f.amenities.length)
}

export function applyFilters(items: ApartmentCardDto[], f: Filters, sort: SortOrder) {
  const from = f.priceFrom ? Number(f.priceFrom) : null
  const to = f.priceTo ? Number(f.priceTo) : null

  const filtered = items.filter((a) => {
    const price = Number(a.pricePerNight)
    if (from != null && price < from) return false
    if (to != null && price > to) return false
    if (f.districtIds.length && !f.districtIds.includes(String(a.districtId))) return false
    if (f.amenities.length && !f.amenities.every((x) => a.amenities.includes(x))) return false
    return true
  })

  if (sort === 'recommended') return filtered
  const direction = sort === 'priceAsc' ? 1 : -1
  return [...filtered].sort(
    (a, b) => (Number(a.pricePerNight) - Number(b.pricePerNight)) * direction,
  )
}

export function collectAmenities(items: ApartmentCardDto[]) {
  return [...new Set(items.flatMap((a) => a.amenities))].sort((a, b) => a.localeCompare(b, 'uk'))
}
