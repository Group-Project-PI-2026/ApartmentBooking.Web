import type { StatusTone } from '@/shared/ui'
import type { PublicationState } from './api/managerApartments'

export const publicationLabel: Record<PublicationState, string> = {
  Published: 'Опубліковано',
  Draft: 'Чернетка',
  Archived: 'Архів',
}

export const publicationTone: Record<PublicationState, StatusTone> = {
  Published: 'success',
  Draft: 'warning',
  Archived: 'pending',
}
