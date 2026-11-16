import { fromIso, type IsoDate } from '@/shared/lib/date'
import type { BookingSource, ManagerBookingStatus, ManagerPaymentState } from './api/manager'

export const statusLabel: Record<ManagerBookingStatus, string> = {
  Confirmed: 'Підтверджено',
  Reserved: 'Резерв',
  Cancelled: 'Скасовано',
}

export const statusTone: Record<ManagerBookingStatus, 'success' | 'warning' | 'error'> = {
  Confirmed: 'success',
  Reserved: 'warning',
  Cancelled: 'error',
}

export const paymentLabel: Record<ManagerPaymentState, string> = {
  Deposit: 'Передоплату внесено',
  Paid: 'Повністю оплачено',
  Checking: 'Платіж перевіряється',
  Refunding: 'Повернення оформлюється',
  External: 'Дані від зовнішнього сервісу',
}

export const sourceLabel: Record<BookingSource, string> = {
  Internal: 'Внутрішнє',
  ChannelManager: 'Channel Manager',
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatShortRange(from: IsoDate, to: IsoDate) {
  const a = fromIso(from)
  const b = fromIso(to)
  const end = `${pad(b.getDate())}.${pad(b.getMonth() + 1)}.${b.getFullYear()}`
  if (a.getFullYear() !== b.getFullYear()) {
    return `${pad(a.getDate())}.${pad(a.getMonth() + 1)}.${a.getFullYear()}–${end}`
  }
  if (a.getMonth() !== b.getMonth()) return `${pad(a.getDate())}.${pad(a.getMonth() + 1)}–${end}`
  return `${pad(a.getDate())}–${end}`
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
