import type { StatusTone } from '@/shared/ui'
import type { BookingStatus } from './api/bookings'

export const bookingStatusView: Record<BookingStatus, { label: string; tone: StatusTone }> = {
  PartiallyPaid: { label: 'Передоплату внесено', tone: 'success' },
  Paid: { label: 'Оплачено повністю', tone: 'success' },
  Cancelled: { label: 'Скасовано', tone: 'error' },
  Completed: { label: 'Завершено', tone: 'pending' },
}

export const bookingTitle: Record<BookingStatus, string> = {
  PartiallyPaid: 'Бронювання підтверджено',
  Paid: 'Бронювання підтверджено',
  Cancelled: 'Бронювання скасовано',
  Completed: 'Бронювання завершено',
}
