import type { CreateOwnerRequest } from '../../api/ownerRequests'
import { roomOptions } from '../../apartmentOptions'

export interface ApplyForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  districtId: string
  street: string
  building: string
  flat: string
  propertyType: string
  rooms: string
  maxGuests: string
  expectedPrice: string
  amenities: string[]
  description: string
  comment: string
}

export type ApplyErrors = Partial<Record<keyof ApplyForm, string>>

export { amenityOptions, guestOptions, propertyTypes, roomOptions } from '../../apartmentOptions'

const required: (keyof ApplyForm)[] = [
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
  'expectedPrice',
  'description',
]

const REQUIRED = 'Обов’язкове поле'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneChars = /^\+?[\d\s()-]+$/
const MAX_PRICE = 1_000_000

// Ukrainian number: 10 digits (0XXXXXXXXX) or 12 digits (380XXXXXXXXX)
function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return (
    phoneChars.test(value) &&
    (digits.length === 10 || (digits.length === 12 && digits.startsWith('380')))
  )
}

export function validate(form: ApplyForm): ApplyErrors {
  const errors: ApplyErrors = {}
  for (const key of required) {
    if (!String(form[key]).trim()) errors[key] = REQUIRED
  }
  if (!errors.email && !emailPattern.test(form.email.trim())) {
    errors.email = 'Вкажіть коректну електронну пошту'
  }
  if (!errors.phone && !isValidPhone(form.phone.trim())) {
    errors.phone = 'Вкажіть номер у форматі +380 XX XXX XX XX'
  }
  const price = Number(form.expectedPrice)
  if (!errors.expectedPrice && !(price > 0 && price <= MAX_PRICE)) {
    errors.expectedPrice = 'Вкажіть ціну більше 0'
  }
  return errors
}

export function toRequest(form: ApplyForm): CreateOwnerRequest {
  const rooms = roomOptions.find((o) => o.value === form.rooms)?.label ?? ''
  const address = [form.street.trim(), form.building.trim()]
  if (form.flat.trim()) address.push(`кв. ${form.flat.trim()}`)
  const comment = form.comment.trim()

  return {
    contactName: `${form.firstName.trim()} ${form.lastName.trim()}`,
    contactEmail: form.email.trim(),
    contactPhone: form.phone.trim(),
    districtId: Number(form.districtId),
    address: address.join(', '),
    title: `${form.propertyType}, ${rooms}`,
    description: comment
      ? `${form.description.trim()}\n\nКоментар: ${comment}`
      : form.description.trim(),
    maxGuests: Number(form.maxGuests),
    expectedPricePerNight: Number(form.expectedPrice),
    amenities: form.amenities,
    photoUrls: [],
  }
}
