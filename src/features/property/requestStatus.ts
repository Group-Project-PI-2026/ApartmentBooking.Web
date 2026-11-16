import type { StatusTone } from '@/shared/ui'
import type { OwnerRequestStatus } from './api/ownerRequests'

export const requestStatusLabel: Record<OwnerRequestStatus, string> = {
  New: 'На розгляді',
  NeedsClarification: 'Потрібне уточнення',
  Approved: 'Схвалено',
  Rejected: 'Відмовлено',
}

export const requestStatusTone: Record<OwnerRequestStatus, StatusTone> = {
  New: 'warning',
  NeedsClarification: 'warning',
  Approved: 'success',
  Rejected: 'error',
}
