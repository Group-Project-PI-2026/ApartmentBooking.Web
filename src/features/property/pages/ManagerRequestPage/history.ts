import { requestStatus, type OwnerRequestDetailsDto } from '../../api/ownerRequests'
import { formatShortDate } from '../../format'

const actionLabel = {
  New: 'Заявку подано',
  NeedsClarification: 'Запит на уточнення',
  Approved: 'Заявку схвалено',
  Rejected: 'Заявку відхилено',
} as const

export interface HistoryLine {
  key: string
  text: string
  message?: string
  muted?: boolean
}

export function historyLines(request: OwnerRequestDetailsDto): HistoryLine[] {
  const [created, ...rest] = request.history
  const createdAt = formatShortDate(created?.changedAt ?? request.createdAt)
  const lines: HistoryLine[] = [
    { key: 'created', text: `${createdAt} · ${request.contactName} · ${actionLabel.New}` },
    { key: 'review', text: `${createdAt} · Система · На розгляді` },
  ]

  if (!rest.some((h) => requestStatus(h.status) === 'NeedsClarification')) {
    lines.push({ key: 'no-clarifications', text: 'Попередніх уточнень немає', muted: true })
  }

  rest.forEach((h, i) => {
    const status = requestStatus(h.status)
    const who = h.changedBy === request.ownerId ? request.contactName : 'Менеджер'
    lines.push({
      key: `${h.changedAt}-${i}`,
      text: `${formatShortDate(h.changedAt)} · ${who} · ${actionLabel[status]}`,
      message: status === 'NeedsClarification' ? (h.message ?? undefined) : undefined,
    })
  })

  return lines
}

export function lastMessage(request: OwnerRequestDetailsDto, status: string) {
  return [...request.history].reverse().find((h) => requestStatus(h.status) === status)?.message
}
