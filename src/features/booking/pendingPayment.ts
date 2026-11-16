const KEY = 'booking:pendingPayment'

export interface PendingPayment {
  apartmentId: string
  title: string
  districtName: string
  checkIn: string
  checkOut: string
  guests: number
  amount: number
  expiresAt: string
}

export function savePendingPayment(value: PendingPayment) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    return
  }
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PendingPayment) : null
  } catch {
    return null
  }
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    return
  }
}
