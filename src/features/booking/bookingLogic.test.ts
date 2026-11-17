import { describe, expect, it } from 'vitest'
import type { ApartmentCardDto } from './api/apartments'
import { bookingStatusView, bookingTitle } from './bookingStatus'
import { clearPendingPayment, readPendingPayment, savePendingPayment } from './pendingPayment'
import {
  applyFilters,
  collectAmenities,
  emptyFilters,
  hasFilters,
} from './pages/SearchPage/filters'
import { DEPOSIT_PERCENT, paymentSplit } from './pricing'
import { emptySearch, readSearch, searchUrl } from './searchQuery'

const card = (patch: Partial<ApartmentCardDto>): ApartmentCardDto =>
  ({
    id: crypto.randomUUID(),
    photoUrl: null,
    title: 'Квартира',
    districtId: 6,
    districtName: 'Печерський',
    pricePerNight: 1000,
    totalPrice: null,
    maxGuests: 2,
    amenities: [],
    ...patch,
  }) as ApartmentCardDto

describe('searchQuery', () => {
  it('readSearch returns empty strings for missing params', () => {
    expect(readSearch(new URLSearchParams())).toEqual(emptySearch)
  })

  it('readSearch reads all params', () => {
    const params = new URLSearchParams(
      'districtId=6&checkIn=2026-12-01&checkOut=2026-12-03&guests=2',
    )
    expect(readSearch(params)).toEqual({
      districtId: '6',
      checkIn: '2026-12-01',
      checkOut: '2026-12-03',
      guests: '2',
    })
  })

  it('searchUrl drops empty values', () => {
    expect(searchUrl({ districtId: '6', checkIn: '', guests: '3' })).toBe(
      '/apartments?districtId=6&guests=3',
    )
    expect(searchUrl(emptySearch)).toBe('/apartments')
  })
})

describe('client-side filters and sorting', () => {
  const cheap = card({ pricePerNight: 900, districtId: 7, amenities: ['Wi-Fi'] })
  const mid = card({ pricePerNight: 1500, districtId: 6, amenities: ['Wi-Fi', 'Кухня'] })
  const pricey = card({ pricePerNight: 3200, districtId: 10, amenities: ['Кухня', 'Балкон'] })
  const all = [mid, pricey, cheap]

  it('hasFilters is false for empty filters', () => {
    expect(hasFilters(emptyFilters)).toBe(false)
    expect(hasFilters({ ...emptyFilters, amenities: ['Wi-Fi'] })).toBe(true)
  })

  it('price range is inclusive on both ends', () => {
    const result = applyFilters(
      all,
      { ...emptyFilters, priceFrom: '900', priceTo: '1500' },
      'recommended',
    )
    expect(result).toEqual([mid, cheap])
  })

  it('district filter accepts several districts', () => {
    const result = applyFilters(all, { ...emptyFilters, districtIds: ['7', '10'] }, 'recommended')
    expect(result).toEqual([pricey, cheap])
  })

  it('amenities filter requires ALL selected amenities', () => {
    const result = applyFilters(
      all,
      { ...emptyFilters, amenities: ['Wi-Fi', 'Кухня'] },
      'recommended',
    )
    expect(result).toEqual([mid])
  })

  it('sorts by price asc / desc without mutating the input', () => {
    const copy = [...all]
    expect(applyFilters(all, emptyFilters, 'priceAsc').map((a) => a.pricePerNight)).toEqual([
      900, 1500, 3200,
    ])
    expect(applyFilters(all, emptyFilters, 'priceDesc').map((a) => a.pricePerNight)).toEqual([
      3200, 1500, 900,
    ])
    expect(all).toEqual(copy)
  })

  it('collectAmenities returns unique, alphabetically sorted list', () => {
    expect(collectAmenities(all)).toEqual(
      ['Балкон', 'Кухня', 'Wi-Fi'].sort((a, b) => a.localeCompare(b, 'uk')),
    )
  })
})

describe('paymentSplit', () => {
  it('pay in full -> nothing left', () => {
    expect(paymentSplit(4000, true)).toEqual({ payNow: 4000, balance: 0 })
  })

  it('deposit + balance always add up to total', () => {
    for (const total of [1, 999, 1801, 12345]) {
      const { payNow, balance } = paymentSplit(total, false)
      expect(payNow + balance).toBeCloseTo(total, 2)
    }
  })

  // BUG-FE-001 (fixed): deposit comes from bookingPolicy.ts, same value as backend Booking:DepositPercent.
  it('BUG-FE-001: deposit shown on checkout matches backend DepositPercent (30 %)', () => {
    expect(DEPOSIT_PERCENT).toBe(30)
    expect(paymentSplit(4000, false).payNow).toBe(1200)
  })
})

describe('booking status view', () => {
  it('every backend status has a label and title', () => {
    for (const s of ['PartiallyPaid', 'Paid', 'Cancelled', 'Completed'] as const) {
      expect(bookingStatusView[s].label).toBeTruthy()
      expect(bookingTitle[s]).toBeTruthy()
    }
    expect(bookingStatusView.Cancelled.tone).toBe('error')
  })
})

describe('pending payment storage', () => {
  const value = {
    apartmentId: 'a1',
    title: 'Студія',
    districtName: 'Печерський',
    checkIn: '2026-12-01',
    checkOut: '2026-12-03',
    guests: 2,
    amount: 1080,
    expiresAt: '2026-11-17T10:15:00Z',
  }

  it('save -> read -> clear round-trip', () => {
    savePendingPayment(value)
    expect(readPendingPayment()).toEqual(value)
    clearPendingPayment()
    expect(readPendingPayment()).toBeNull()
  })

  it('corrupted JSON returns null instead of crashing the page', () => {
    sessionStorage.setItem('booking:pendingPayment', '{broken')
    expect(readPendingPayment()).toBeNull()
  })
})
