import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatDateRange,
  formatMonthTitle,
  fromIso,
  monthGrid,
  nightsBetween,
  startOfMonth,
  toIso,
} from './date'

const normalize = (s: string) => s.replace(/\s/g, ' ')

describe('ISO date helpers', () => {
  it('toIso pads month and day', () => {
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('fromIso -> toIso round-trip keeps the local date', () => {
    expect(toIso(fromIso('2026-11-17'))).toBe('2026-11-17')
  })

  it.each([
    ['2026-01-31', 1, '2026-02-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2028-02-28', 1, '2028-02-29'],
    ['2026-03-01', -1, '2026-02-28'],
  ])('addDays(%s, %i) = %s', (iso, days, expected) => {
    expect(addDays(iso, days)).toBe(expected)
  })

  it.each([
    ['2026-11-17', '2026-11-20', 3],
    ['2026-10-24', '2026-10-27', 3], // across the autumn DST switch
    ['2026-03-28', '2026-03-31', 3], // across the spring DST switch
    ['2026-12-30', '2027-01-02', 3],
  ])('nightsBetween(%s, %s) = %i', (from, to, nights) => {
    expect(nightsBetween(from, to)).toBe(nights)
  })

  it('startOfMonth / addMonths', () => {
    expect(toIso(startOfMonth(new Date(2026, 10, 17)))).toBe('2026-11-01')
    expect(toIso(addMonths(new Date(2026, 10, 17), 2))).toBe('2027-01-01')
  })
})

describe('monthGrid', () => {
  it('starts on Monday: November 2026 begins on Sunday -> 6 empty cells', () => {
    const grid = monthGrid(new Date(2026, 10, 1))
    expect(grid.slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(grid[6]).toBe('2026-11-01')
    expect(grid.filter(Boolean)).toHaveLength(30)
  })

  it('month starting on Monday has no offset', () => {
    const grid = monthGrid(new Date(2027, 1, 1)) // 1 Feb 2027 is Monday
    expect(grid[0]).toBe('2027-02-01')
    expect(grid).toHaveLength(28)
  })
})

describe('human readable dates', () => {
  it('formatMonthTitle capitalises the month', () => {
    expect(formatMonthTitle(new Date(2026, 10, 1))).toBe('Листопад 2026')
  })

  it('same month range is compact', () => {
    expect(normalize(formatDateRange('2026-11-17', '2026-11-20'))).toBe('17–20 листопада 2026')
  })

  it('range across months', () => {
    expect(normalize(formatDateRange('2026-11-29', '2026-12-02'))).toBe(
      '29 листопада – 2 грудня 2026',
    )
  })

  it('range across years shows both years', () => {
    expect(normalize(formatDateRange('2026-12-30', '2027-01-02'))).toBe(
      '30 грудня 2026 – 2 січня 2027',
    )
  })
})
