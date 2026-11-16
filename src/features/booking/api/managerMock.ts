import { addDays, todayIso, type IsoDate } from '@/shared/lib/date'

export type ManagerBookingStatus = 'Confirmed' | 'Reserved' | 'Cancelled'
export type ManagerPaymentState = 'Deposit' | 'Paid' | 'Checking' | 'Refunding' | 'External'
export type BookingSource = 'Internal' | 'ChannelManager'

export interface ManagerApartment {
  id: string
  title: string
  districtName: string
  rooms: number
  maxGuests: number
}

export interface HistoryEntry {
  at: string
  actor: string
  action: string
}

export interface ManagerBooking {
  id: string
  number: string
  apartmentId: string
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  guests: number
  identityVerified: boolean
  checkIn: IsoDate
  checkOut: IsoDate
  status: ManagerBookingStatus
  payment: ManagerPaymentState
  total: number | null
  paid: number | null
  balance: number | null
  refund: number | null
  source: BookingSource
  createdAt: string
  reservedUntil: string | null
  checkedInAt: string | null
  checkedOutAt: string | null
  note: string
  history: HistoryEntry[]
}

export interface DateBlock {
  id: string
  apartmentId: string
  from: IsoDate
  to: IsoDate
  reason: string
}

export interface SyncState {
  source: string
  status: 'ok' | 'error'
  lastSuccessAt: string
}

const now = () => new Date().toISOString()

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

function createStore() {
  const t = todayIso()

  const apartments: ManagerApartment[] = [
    {
      id: 'apt-podil',
      title: 'Апартаменти на Подолі',
      districtName: 'Подільський',
      rooms: 1,
      maxGuests: 2,
    },
    {
      id: 'apt-metro',
      title: 'Квартира біля метро',
      districtName: 'Шевченківський',
      rooms: 1,
      maxGuests: 2,
    },
    {
      id: 'apt-pechersk',
      title: 'Апартаменти на Печерську',
      districtName: 'Печерський',
      rooms: 1,
      maxGuests: 2,
    },
  ]

  const base = {
    guestEmail: null,
    guestPhone: null,
    identityVerified: false,
    refund: null,
    reservedUntil: null,
    checkedInAt: null,
    checkedOutAt: null,
    note: '',
    guests: 2,
  }

  const bookings: ManagerBooking[] = [
    {
      ...base,
      id: 'ky-00124',
      number: 'KY-00124',
      apartmentId: 'apt-podil',
      guestName: 'Андрій Коваль',
      guestEmail: 'name@example.com',
      guestPhone: '+380 XX XXX XX XX',
      identityVerified: true,
      checkIn: t,
      checkOut: addDays(t, 3),
      status: 'Confirmed',
      payment: 'Deposit',
      total: 5400,
      paid: 2700,
      balance: 2700,
      source: 'Internal',
      createdAt: minutesFromNow(-60 * 24 * 3),
      history: [
        {
          at: minutesFromNow(-60 * 24 * 3 + 15),
          actor: 'Система',
          action: 'Бронювання підтверджено після перевірки платежу',
        },
        {
          at: minutesFromNow(-60 * 24 * 3),
          actor: 'Андрій Коваль',
          action: 'Створено бронювання KY-00124',
        },
      ],
    },
    {
      ...base,
      id: 'ky-00125',
      number: 'KY-00125',
      apartmentId: 'apt-podil',
      guestName: 'Демо-гість',
      checkIn: addDays(t, 11),
      checkOut: addDays(t, 14),
      status: 'Confirmed',
      payment: 'Paid',
      total: 5400,
      paid: 5400,
      balance: 0,
      source: 'Internal',
      createdAt: minutesFromNow(-60 * 24),
      history: [
        {
          at: minutesFromNow(-60 * 24),
          actor: 'Демо-гість',
          action: 'Створено бронювання KY-00125',
        },
      ],
    },
    {
      ...base,
      id: 'ky-00126',
      number: 'KY-00126',
      apartmentId: 'apt-metro',
      guestName: 'Демо-гість',
      checkIn: addDays(t, 4),
      checkOut: addDays(t, 6),
      status: 'Reserved',
      payment: 'Checking',
      total: 3200,
      paid: null,
      balance: null,
      source: 'Internal',
      createdAt: now(),
      reservedUntil: minutesFromNow(15),
      history: [{ at: now(), actor: 'Демо-гість', action: 'Створено тимчасовий резерв KY-00126' }],
    },
    {
      ...base,
      id: 'ky-00127',
      number: 'KY-00127',
      apartmentId: 'apt-metro',
      guestName: 'Демо-гість',
      checkIn: addDays(t, -9),
      checkOut: addDays(t, -6),
      status: 'Cancelled',
      payment: 'Refunding',
      total: 4800,
      paid: 2400,
      balance: null,
      refund: 2400,
      source: 'Internal',
      createdAt: minutesFromNow(-60 * 24 * 20),
      history: [
        {
          at: minutesFromNow(-60 * 24 * 12),
          actor: 'Демо-гість',
          action: 'Бронювання скасовано, оформлюється повернення',
        },
        {
          at: minutesFromNow(-60 * 24 * 20),
          actor: 'Демо-гість',
          action: 'Створено бронювання KY-00127',
        },
      ],
    },
    {
      ...base,
      id: 'ext-0001',
      number: 'EXT-0001',
      apartmentId: 'apt-metro',
      guestName: null,
      checkIn: addDays(t, 7),
      checkOut: addDays(t, 9),
      status: 'Confirmed',
      payment: 'External',
      total: null,
      paid: null,
      balance: null,
      source: 'ChannelManager',
      createdAt: minutesFromNow(-60 * 5),
      history: [
        {
          at: minutesFromNow(-60 * 5),
          actor: 'Channel Manager',
          action: 'Отримано зовнішнє бронювання EXT-0001',
        },
      ],
    },
  ]

  const blocks: DateBlock[] = [
    {
      id: 'block-1',
      apartmentId: 'apt-pechersk',
      from: addDays(t, -2),
      to: t,
      reason: 'Технічне обслуговування',
    },
  ]

  const sync: SyncState = {
    source: 'Channel Manager',
    status: 'ok',
    lastSuccessAt: minutesFromNow(-90),
  }

  return { apartments, bookings, blocks, sync }
}

export const store = createStore()

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 150))

export const managerMock = {
  apartments: () => delay(store.apartments),
  bookings: () => delay(store.bookings.map((b) => ({ ...b }))),
  booking: (id: string) => delay(store.bookings.find((b) => b.id === id) ?? null),
  blocks: () => delay([...store.blocks]),
  sync: () => delay({ ...store.sync }),

  retrySync: () => {
    store.sync.status = 'ok'
    store.sync.lastSuccessAt = now()
    return delay({ ...store.sync })
  },

  addBlock: (block: Omit<DateBlock, 'id'>) => {
    const overlaps = (from: IsoDate, to: IsoDate) => block.from < to && from < block.to
    const conflict =
      store.blocks.some((b) => b.apartmentId === block.apartmentId && overlaps(b.from, b.to)) ||
      store.bookings.some(
        (b) =>
          b.apartmentId === block.apartmentId &&
          b.status !== 'Cancelled' &&
          overlaps(b.checkIn, b.checkOut),
      )
    if (conflict) return Promise.reject(new Error('conflict'))
    const created = { ...block, id: `block-${Date.now()}` }
    store.blocks.push(created)
    return delay(created)
  },

  update: (id: string, patch: Partial<ManagerBooking>, action: string) => {
    const booking = store.bookings.find((b) => b.id === id)
    if (!booking) return Promise.reject(new Error('not found'))
    Object.assign(booking, patch)
    booking.history.unshift({ at: now(), actor: 'Менеджер', action })
    return delay({ ...booking })
  },
}
