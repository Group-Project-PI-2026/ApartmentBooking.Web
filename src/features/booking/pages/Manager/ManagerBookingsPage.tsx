import { useMemo, useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { todayIso } from '@/shared/lib/date'
import { formatPrice } from '@/shared/lib/format'
import {
  Button,
  ComingSoon,
  Input,
  Loader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import {
  useManagerApartments,
  useManagerBookings,
  type ManagerBooking,
  type ManagerBookingStatus,
  type ManagerPaymentState,
  type BookingSource,
} from '../../api/manager'
import { DemoNotice } from '../../components/DemoNotice/DemoNotice'
import {
  formatShortRange,
  paymentLabel,
  sourceLabel,
  statusLabel,
  statusTone,
} from '../../managerLabels'
import { bookingPaths } from '../../paths'
import { ExternalBookingModal } from './ManagerModals'
import styles from './Manager.module.css'

interface Filters {
  search: string
  period: '' | 'future' | 'current' | 'past'
  status: '' | ManagerBookingStatus
  payment: '' | ManagerPaymentState
  source: '' | BookingSource
  balanceDue: '' | 'yes' | 'no'
}

const emptyFilters: Filters = {
  search: '',
  period: '',
  status: '',
  payment: '',
  source: '',
  balanceDue: '',
}

const columns = [
  { key: 'number', title: 'Номер', width: '7%' },
  { key: 'apartment', title: 'Апартаменти', width: '14%' },
  { key: 'guest', title: 'Гість', width: '9.5%' },
  { key: 'dates', title: 'Заїзд / виїзд', width: '10.5%' },
  { key: 'status', title: 'Бронювання', width: '11%' },
  { key: 'payment', title: 'Оплата', width: '16.5%' },
  { key: 'balance', title: 'Залишок', width: '7.5%' },
  { key: 'source', title: 'Джерело', width: '11.5%' },
  { key: 'action', title: 'Дія', width: '12.5%' },
]

const options = <T extends string>(all: string, labels: Record<T, string>) => [
  { value: '', label: all },
  ...(Object.keys(labels) as T[]).map((k) => ({ value: k, label: labels[k] })),
]

function matches(b: ManagerBooking, f: Filters, apartmentTitle: string, today: string) {
  const q = f.search.trim().toLowerCase()
  if (
    q &&
    ![b.number, b.guestName ?? '', apartmentTitle].some((v) => v.toLowerCase().includes(q))
  ) {
    return false
  }
  if (f.period === 'future' && b.checkIn <= today) return false
  if (f.period === 'current' && !(b.checkIn <= today && today < b.checkOut)) return false
  if (f.period === 'past' && b.checkOut > today) return false
  if (f.status && b.status !== f.status) return false
  if (f.payment && b.payment !== f.payment) return false
  if (f.source && b.source !== f.source) return false
  if (f.balanceDue === 'yes' && !(b.balance && b.balance > 0)) return false
  if (f.balanceDue === 'no' && b.balance && b.balance > 0) return false
  return true
}

export function ManagerBookingsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(emptyFilters)
  const [external, setExternal] = useState<ManagerBooking | null>(null)
  const bookings = useManagerBookings()
  const apartments = useManagerApartments()

  const titleOf = useMemo(() => {
    const map = new Map((apartments.data ?? []).map((a) => [a.id, a.title]))
    return (id: string) => map.get(id) ?? '—'
  }, [apartments.data])

  const today = todayIso()
  const items = (bookings.data ?? []).filter((b) =>
    matches(b, filters, titleOf(b.apartmentId), today),
  )
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))

  const open = (b: ManagerBooking) => {
    if (b.source === 'ChannelManager') setExternal(b)
    else navigate(generatePath(bookingPaths.managerBookingDetails, { id: b.id }))
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h1>Бронювання</h1>
        <ComingSoon />
      </div>
      <DemoNotice />

      <section className={styles.panel}>
        <div className={styles.filtersGrid}>
          <Input
            label="Пошук"
            placeholder="Номер, гість або об’єкт"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
          />
          <Select
            label="Період заїзду"
            options={[
              { value: '', label: 'Усі дати' },
              { value: 'future', label: 'Майбутні' },
              { value: 'current', label: 'Поточні' },
              { value: 'past', label: 'Минулі' },
            ]}
            value={filters.period}
            onChange={(e) => set({ period: e.target.value as Filters['period'] })}
          />
          <Select
            label="Статус бронювання"
            options={options('Усі статуси', statusLabel)}
            value={filters.status}
            onChange={(e) => set({ status: e.target.value as Filters['status'] })}
          />
          <span aria-hidden />
          <Select
            label="Стан оплати"
            options={options('Усі стани', paymentLabel)}
            value={filters.payment}
            onChange={(e) => set({ payment: e.target.value as Filters['payment'] })}
          />
          <Select
            label="Джерело"
            options={options('Усі джерела', sourceLabel)}
            value={filters.source}
            onChange={(e) => set({ source: e.target.value as Filters['source'] })}
          />
          <Select
            label="Доплата в день заселення"
            options={[
              { value: '', label: 'Усі' },
              { value: 'yes', label: 'Потрібна' },
              { value: 'no', label: 'Не потрібна' },
            ]}
            value={filters.balanceDue}
            onChange={(e) => set({ balanceDue: e.target.value as Filters['balanceDue'] })}
          />
          <Button
            variant="secondary"
            className={styles.resetButton}
            onClick={() => setFilters(emptyFilters)}
          >
            Скинути фільтри
          </Button>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Список бронювань</h2>
        {bookings.isLoading ? (
          <Loader />
        ) : (
          <Table className={styles.wideTable}>
            <TableHeader columns={columns} />
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className={styles.emptyCell}>
                    Нічого не знайдено. Змініть пошук або скиньте фільтри.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.number}</TableCell>
                    <TableCell>{titleOf(b.apartmentId)}</TableCell>
                    <TableCell>{b.guestName ?? 'Немає даних'}</TableCell>
                    <TableCell>{formatShortRange(b.checkIn, b.checkOut)}</TableCell>
                    <TableCell className={styles[`tone_${statusTone[b.status]}`]}>
                      {statusLabel[b.status]}
                    </TableCell>
                    <TableCell>{paymentLabel[b.payment]}</TableCell>
                    <TableCell>
                      {b.balance != null ? formatPrice(b.balance) : 'Немає даних'}
                    </TableCell>
                    <TableCell>{sourceLabel[b.source]}</TableCell>
                    <TableCell>
                      <Button
                        size="compact"
                        className={styles.detailsButton}
                        onClick={() => open(b)}
                      >
                        Деталі
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </section>

      <ExternalBookingModal
        booking={external}
        apartment={apartments.data?.find((a) => a.id === external?.apartmentId)}
        onClose={() => setExternal(null)}
      />
    </div>
  )
}
