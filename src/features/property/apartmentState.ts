import type { PublicationState } from './api/managerApartments'

export const publicationLabel: Record<PublicationState, string> = {
  Published: 'Опубліковано',
  Draft: 'Чернетка',
  Archived: 'Архів',
}
