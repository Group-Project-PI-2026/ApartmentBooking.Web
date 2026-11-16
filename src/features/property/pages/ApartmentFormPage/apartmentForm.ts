import type {
  ApartmentInput,
  ManagerApartment,
  PublicationState,
} from '../../api/managerApartments'
import type { PickedPhoto } from '../../components/PhotoPicker/PhotoPicker'
import { guestOptions, propertyTypes, roomOptions } from '../../apartmentOptions'

export interface ApartmentForm {
  title: string
  description: string
  propertyType: string
  rooms: string
  maxGuests: string
  district: string
  street: string
  building: string
  flat: string
  amenities: string[]
  photos: PickedPhoto[]
  pricePerNight: string
  checkIn: string
  checkOut: string
  rules: string
  checkInInstructions: string
  state: PublicationState
}

export type TextField = Exclude<keyof ApartmentForm, 'amenities' | 'photos' | 'state'>
export type FormErrors = Partial<Record<TextField, string>>

export const emptyForm: ApartmentForm = {
  title: '',
  description: '',
  propertyType: propertyTypes[0].value,
  rooms: roomOptions[0].value,
  maxGuests: guestOptions[1].value,
  district: '',
  street: '',
  building: '',
  flat: '',
  amenities: [],
  photos: [],
  pricePerNight: '',
  checkIn: '',
  checkOut: '',
  rules: '',
  checkInInstructions: '',
  state: 'Draft',
}

export function fromApartment(a: ManagerApartment): ApartmentForm {
  return {
    title: a.title,
    description: a.description,
    propertyType: a.propertyType,
    rooms: String(a.rooms),
    maxGuests: String(a.maxGuests),
    district: a.district,
    street: a.street,
    building: a.building,
    flat: a.flat,
    amenities: a.amenities,
    photos: a.photos,
    pricePerNight: String(a.pricePerNight),
    checkIn: a.checkIn,
    checkOut: a.checkOut,
    rules: a.rules,
    checkInInstructions: a.checkInInstructions,
    state: a.state,
  }
}

const required: TextField[] = [
  'title',
  'description',
  'propertyType',
  'rooms',
  'maxGuests',
  'district',
  'street',
  'building',
  'pricePerNight',
]

export function validate(form: ApartmentForm): FormErrors {
  const errors: FormErrors = {}
  for (const key of required) {
    if (!form[key].trim()) errors[key] = 'Обов’язкове поле'
  }
  if (!errors.pricePerNight && !(Number(form.pricePerNight) > 0)) {
    errors.pricePerNight = 'Вкажіть ціну більше 0'
  }
  return errors
}

export function toInput(form: ApartmentForm): ApartmentInput {
  return {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    street: form.street.trim(),
    building: form.building.trim(),
    flat: form.flat.trim(),
    rooms: Number(form.rooms),
    maxGuests: Number(form.maxGuests),
    pricePerNight: Number(form.pricePerNight),
  }
}
