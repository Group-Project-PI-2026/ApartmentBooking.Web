import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import {
  addDays,
  formatDateRange,
  formatLongDate,
  formatMonthTitle,
  fromIso,
  todayIso,
  type IsoDate,
} from '@/shared/lib/date'
import { Button, ComingSoon, Input, Loader, Modal, Select } from '@/shared/ui'
import {
  useDateBlocks,
  useManagerApartments,
  useManagerBookings,
  useRetrySync,
  useSyncState,
  type ManagerBooking,
} from '../../api/manager'
import { DemoNotice } from '../../components/DemoNotice/DemoNotice'
import { formatDateTime } from '../../managerLabels'
import { BlockDatesModal } from './BlockDatesModal'
import { BookingPanelModal, InfoRows } from './ManagerModals'
import styles from './Manager.module.css'

const WINDOW = 14

type CellKind = 'free' | 'reserved' | 'confirmed' | 'blocked' | 'external'

const cellLabel: Record<CellKind, string> = {
  free: 'Вільно',
  reserved: 'Резерв',
  confirmed: 'Підтв.',
  blocked: 'Блок',
  external: 'Зовнішнє',
}

const legend: Array<[CellKind, string]> = [
  ['free', 'Вільно'],
  ['reserved', 'Резерв'],
  ['confirmed', 'Підтверджено'],
  ['blocked', 'Заблоковано'],
  ['external', 'Зовнішнє бронювання'],
]

function kindOf(booking: ManagerBooking): CellKind {
  if (booking.source === 'ChannelManager') return 'external'
  return booking.status === 'Reserved' ? 'reserved' : 'confirmed'
}

export function ManagerCalendarPage() {
  const today = todayIso()
  const [start, setStart] = useState(() => addDays(today, -3))
  const [apartmentFilter, setApartmentFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ManagerBooking | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)
  const [syncNotice, setSyncNotice] = useState(false)

  const apartments = useManagerApartments()
  const bookings = useManagerBookings()
  const blocks = useDateBlocks()
  const sync = useSyncState()
  const retrySync = useRetrySync()

  const days = useMemo(() => Array.from({ length: WINDOW }, (_, i) => addDays(start, i)), [start])
  const end = days[days.length - 1]

  const rows = (apartments.data ?? []).filter(
    (a) =>
      (!apartmentFilter || a.id === apartmentFilter) &&
      a.title.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const cell = (apartmentId: string, day: IsoDate) => {
    const booking = (bookings.data ?? []).find(
      (b) =>
        b.apartmentId === apartmentId &&
        b.status !== 'Cancelled' &&
        b.checkIn <= day &&
        day < b.checkOut,
    )
    if (booking) return { kind: kindOf(booking), booking }
    const blocked = (blocks.data ?? []).some(
      (b) => b.apartmentId === apartmentId && b.from <= day && day < b.to,
    )
    return { kind: (blocked ? 'blocked' : 'free') as CellKind, booking: null }
  }

  if (apartments.isLoading || bookings.isLoading) {
    return <Loader />
  }

  const syncError = sync.data?.status === 'error'

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h1>Календар доступності</h1>
        <ComingSoon />
      </div>
      <DemoNotice />

      <div className={styles.periodNav}>
        <Button
          variant="secondary"
          className={styles.navButton}
          onClick={() => setStart(addDays(start, -WINDOW))}
        >
          Попередній
        </Button>
        <h3 className={styles.period}>{formatDateRange(start, end)}</h3>
        <Button
          variant="secondary"
          className={styles.navButton}
          onClick={() => setStart(addDays(start, WINDOW))}
        >
          Наступний
        </Button>
        <Button
          variant="secondary"
          className={styles.navButton}
          onClick={() => setStart(addDays(today, -3))}
        >
          Сьогодні
        </Button>
      </div>

      <div className={styles.filtersRow}>
        <Select
          label="Апартаменти"
          className={styles.filter}
          options={[
            { value: '', label: 'Усі апартаменти' },
            ...(apartments.data ?? []).map((a) => ({ value: a.id, label: a.title })),
          ]}
          value={apartmentFilter}
          onChange={(e) => setApartmentFilter(e.target.value)}
        />
        <Input
          label="Пошук"
          className={styles.filter}
          placeholder="Назва апартаментів"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className={styles.panel}>
        <h2>Синхронізація</h2>
        <dl className={styles.syncGrid}>
          <div>
            <dt>Джерело</dt>
            <dd>{sync.data?.source ?? '—'}</dd>
          </div>
          <div>
            <dt>Стан</dt>
            <dd className={syncError ? styles.errorText : undefined}>
              {syncError ? 'Помилка синхронізації' : 'Синхронізовано'}
            </dd>
          </div>
          <div>
            <dt>Остання успішна синхронізація</dt>
            <dd>{sync.data ? `${formatDateTime(sync.data.lastSuccessAt)} (демо)` : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.panel}>
        <h2>{formatMonthTitle(fromIso(start))}</h2>
        <span className={styles.caption}>Поточна дата: {formatLongDate(today)}</span>
        <div className={styles.gridWrapper}>
          <table className={styles.grid}>
            <thead>
              <tr>
                <th className={styles.gridHead}>Апартаменти</th>
                {days.map((d) => (
                  <th key={d} className={cn(styles.gridHead, d === today && styles.today)}>
                    {fromIso(d).getDate()}
                    {d === today && (
                      <>
                        {' ·'}
                        <br />
                        сьогодні
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className={styles.gridApartment}>
                    {a.title}
                  </th>
                  {days.map((d) => {
                    const c = cell(a.id, d)
                    return (
                      <td key={d} className={cn(styles.gridCell, styles[c.kind])}>
                        {c.booking ? (
                          <button
                            type="button"
                            className={styles.cellButton}
                            onClick={() => setSelected(c.booking)}
                            aria-label={`${cellLabel[c.kind]}: ${c.booking.number}`}
                          >
                            {cellLabel[c.kind]}
                          </button>
                        ) : (
                          cellLabel[c.kind]
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <h3>Позначення</h3>
        <ul className={styles.legend}>
          {legend.map(([kind, label]) => (
            <li key={kind} className={cn(styles.legendItem, styles[kind])}>
              {label}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actionsRow}>
        <Button className={styles.navButton} onClick={() => setBlockOpen(true)}>
          Заблокувати дати
        </Button>
      </div>

      <BookingPanelModal
        booking={selected}
        apartment={apartments.data?.find((a) => a.id === selected?.apartmentId)}
        onClose={() => setSelected(null)}
      />

      {blockOpen && (
        <BlockDatesModal
          open
          onClose={() => setBlockOpen(false)}
          apartments={apartments.data ?? []}
        />
      )}

      <Modal
        open={syncError && !syncNotice}
        onClose={() => setSyncNotice(true)}
        title="Не вдалося оновити дані календаря"
        description="До успішної синхронізації дані календаря можуть бути неактуальними."
        actions={
          <>
            <Button
              onClick={() => retrySync.mutate(undefined, { onSuccess: () => setSyncNotice(true) })}
              disabled={retrySync.isPending}
            >
              Повторити синхронізацію
            </Button>
            <Button variant="secondary" onClick={() => setSyncNotice(true)}>
              До календаря
            </Button>
          </>
        }
      >
        <p className={styles.warningBox}>
          Дані можуть бути неактуальними до успішної синхронізації.
        </p>
        <InfoRows
          rows={[
            ['Джерело', sync.data?.source ?? '—'],
            [
              'Остання успішна синхронізація',
              sync.data ? `${formatDateTime(sync.data.lastSuccessAt)} (демо)` : '—',
            ],
          ]}
        />
      </Modal>
    </div>
  )
}
