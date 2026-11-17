import { describe, expect, it } from 'vitest'
import {
  formatDays,
  formatFileSize,
  formatGuests,
  formatNights,
  formatPrice,
  plural,
} from './format'

const nbsp = /\s/g
const normalize = (s: string) => s.replace(nbsp, ' ')

describe('plural (українські форми)', () => {
  it.each([
    [1, 'ніч'],
    [21, 'ніч'],
    [101, 'ніч'],
    [2, 'ночі'],
    [4, 'ночі'],
    [22, 'ночі'],
    [5, 'ночей'],
    [11, 'ночей'],
    [12, 'ночей'],
    [14, 'ночей'],
    [111, 'ночей'],
    [0, 'ночей'],
  ])('%i -> %s', (n, expected) => {
    expect(plural(n, 'ніч', 'ночі', 'ночей')).toBe(expected)
  })
})

describe('formatters', () => {
  it('formatPrice groups thousands and adds hryvnia sign', () => {
    expect(normalize(formatPrice(12500))).toBe('12 500 ₴')
    expect(normalize(formatPrice('1800'))).toBe('1 800 ₴')
  })

  it('formatPrice rounds to whole hryvnias', () => {
    expect(normalize(formatPrice(999.6))).toBe('1 000 ₴')
  })

  it('formatGuests / formatNights / formatDays use correct forms', () => {
    expect(formatGuests(1)).toBe('1 гість')
    expect(formatGuests('3')).toBe('3 гості')
    expect(formatGuests(7)).toBe('7 гостей')
    expect(formatNights(2)).toBe('2 ночі')
    expect(formatDays(5)).toBe('5 діб')
    expect(formatDays(1)).toBe('1 доба')
  })

  it('formatFileSize switches from KB to MB at 1 MiB', () => {
    expect(normalize(formatFileSize(512 * 1024))).toBe('512 КБ')
    expect(normalize(formatFileSize(1.5 * 1024 * 1024))).toBe('1,5 МБ')
  })
})
