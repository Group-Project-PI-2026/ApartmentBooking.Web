import { describe, expect, it } from 'vitest'
import type { OwnerRequestDetailsDto } from './api/ownerRequests'
import { requestNumber } from './api/ownerRequests'
import {
  emptyForm,
  toInput,
  validate as validateApartment,
} from './pages/ApartmentFormPage/apartmentForm'
import { historyLines, lastMessage } from './pages/ManagerRequestPage/history'
import { toRequest, validate, type ApplyForm } from './pages/OwnerApplyPage/applyForm'
import { requestStatusLabel, requestStatusTone } from './requestStatus'

const validApply: ApplyForm = {
  firstName: ' Олена ',
  lastName: 'Коваль',
  email: 'olena@myrent.local',
  phone: '+380 67 123 45 67',
  districtId: '7',
  street: 'вул. Андріївський узвіз',
  building: '5',
  flat: '3',
  propertyType: 'Квартира',
  rooms: '2',
  maxGuests: '4',
  amenities: ['Wi-Fi'],
  description: 'Світла квартира',
  comment: '',
}

describe('owner application form: validate', () => {
  it('valid form has no errors', () => {
    expect(validate(validApply)).toEqual({})
  })

  it('every required field reports "Обов’язкове поле"', () => {
    const empty = Object.fromEntries(
      Object.entries(validApply).map(([k, v]) => [k, Array.isArray(v) ? [] : '  ']),
    ) as unknown as ApplyForm
    const errors = validate(empty)
    for (const key of [
      'firstName',
      'lastName',
      'email',
      'phone',
      'districtId',
      'street',
      'building',
      'propertyType',
      'rooms',
      'maxGuests',
      'description',
    ]) {
      expect(errors[key as keyof ApplyForm]).toBe('Обов’язкове поле')
    }
    expect(errors.flat).toBeUndefined()
    expect(errors.comment).toBeUndefined()
  })

  it.each(['olena', 'olena@', 'olena@myrent', 'o lena@myrent.local'])(
    'rejects email "%s"',
    (email) => {
      expect(validate({ ...validApply, email }).email).toBe('Вкажіть коректну електронну пошту')
    },
  )

  it.each(['12345', '+38067'])('rejects too short phone "%s"', (phone) => {
    expect(validate({ ...validApply, phone }).phone).toBeDefined()
  })

  it.each(['0671234567', '+380 (67) 123-45-67'])('accepts phone "%s"', (phone) => {
    expect(validate({ ...validApply, phone }).phone).toBeUndefined()
  })

  // BUG-FE-003: phonePattern = /^\+?[\d\s()-]{10,}$/ does not require digits.
  it.fails('BUG-FE-003: phone without any digits is rejected', () => {
    expect(validate({ ...validApply, phone: '(((((-----)))))' }).phone).toBeDefined()
  })
})

describe('owner application form: toRequest', () => {
  it('builds contact name, address and title from parts', () => {
    const request = toRequest(validApply)
    expect(request.contactName).toBe('Олена Коваль')
    expect(request.address).toBe('вул. Андріївський узвіз, 5, кв. 3')
    expect(request.title).toBe('Квартира, 2 кімнати')
    expect(request.districtId).toBe(7)
    expect(request.maxGuests).toBe(4)
  })

  it('omits flat when empty and appends comment to description', () => {
    const request = toRequest({ ...validApply, flat: ' ', comment: 'Є паркінг' })
    expect(request.address).toBe('вул. Андріївський узвіз, 5')
    expect(request.description).toBe('Світла квартира\n\nКоментар: Є паркінг')
  })

  // BUG-FE-002: the form has no price field and toRequest never sends expectedPricePerNight,
  // so every request reaches the backend with price 0 (see BUG-BE-001).
  it.fails('BUG-FE-002: request contains a positive expectedPricePerNight', () => {
    const request = toRequest(validApply) as { expectedPricePerNight?: number }
    expect(request.expectedPricePerNight).toBeGreaterThan(0)
  })
})

describe('manager apartment form', () => {
  const filled = {
    ...emptyForm,
    title: ' Студія ',
    description: 'Опис',
    district: 'Печерський',
    street: 'Лаврська',
    building: '10',
    pricePerNight: '1800',
  }

  it('valid form passes and toInput trims and converts numbers', () => {
    expect(validateApartment(filled)).toEqual({})
    const input = toInput(filled)
    expect(input.title).toBe('Студія')
    expect(input.pricePerNight).toBe(1800)
    expect(input.rooms).toBe(1)
  })

  it.each(['0', '-5', 'abc'])('price "%s" is rejected', (price) => {
    expect(validateApartment({ ...filled, pricePerNight: price }).pricePerNight).toBe(
      'Вкажіть ціну більше 0',
    )
  })
})

describe('owner request status / history', () => {
  const ownerId = 'owner-1'
  const request = {
    id: 'r1',
    number: 7,
    ownerId,
    contactName: 'Олена',
    createdAt: '2026-11-01T10:00:00Z',
    history: [
      { status: 'New', message: null, changedBy: ownerId, changedAt: '2026-11-01T10:00:00Z' },
      {
        status: 'NeedsClarification',
        message: 'Додайте фото',
        changedBy: 'mgr',
        changedAt: '2026-11-02T10:00:00Z',
      },
      { status: 'Approved', message: 'ok', changedBy: 'mgr', changedAt: '2026-11-03T10:00:00Z' },
    ],
  } as unknown as OwnerRequestDetailsDto

  it('requestNumber pads to 4 digits', () => {
    expect(requestNumber(7)).toBe('OWN-0007')
    expect(requestNumber(12345)).toBe('OWN-12345')
  })

  it('every status has label and tone', () => {
    expect(requestStatusLabel.NeedsClarification).toBe('Потрібне уточнення')
    expect(requestStatusTone.Rejected).toBe('error')
  })

  it('historyLines shows clarification message and manager as author', () => {
    const lines = historyLines(request)
    expect(lines[0].text).toContain('Олена · Заявку подано')
    expect(lines.some((l) => l.key === 'no-clarifications')).toBe(false)
    const clarification = lines.find((l) => l.text.includes('Запит на уточнення'))
    expect(clarification?.text).toContain('Менеджер')
    expect(clarification?.message).toBe('Додайте фото')
    expect(lines.at(-1)?.text).toContain('Заявку схвалено')
  })

  it('historyLines notes absence of clarifications', () => {
    const fresh = { ...request, history: request.history.slice(0, 1) } as OwnerRequestDetailsDto
    expect(historyLines(fresh).map((l) => l.key)).toContain('no-clarifications')
  })

  it('lastMessage returns the latest message for a status', () => {
    expect(lastMessage(request, 'NeedsClarification')).toBe('Додайте фото')
    expect(lastMessage(request, 'Rejected')).toBeUndefined()
  })
})
