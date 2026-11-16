import { useMemo, useState } from 'react'
import { CabinetShell } from '@/layouts/CabinetShell'
import { todayIso } from '@/shared/lib/date'
import { ButtonLink, Container, InfoMessage, Loader, Tabs } from '@/shared/ui'
import { useApartments } from '../../api/apartments'
import {
  bookingStatus,
  useMyBookings,
  type BookingListItemDto,
  type BookingTab,
} from '../../api/bookings'
import { bookingPaths } from '../../paths'
import { BookingListCard } from './BookingListCard'
import styles from './MyBookingsPage.module.css'

const tabLabels: Record<BookingTab, string> = {
  Future: 'Майбутні',
  Past: 'Минулі',
  Cancelled: 'Скасовані',
}

const emptyText: Record<BookingTab, string> = {
  Future: 'Немає майбутніх бронювань.',
  Past: 'Немає минулих бронювань.',
  Cancelled: 'Немає скасованих бронювань.',
}

function tabOf(booking: BookingListItemDto, today: string): BookingTab {
  const status = bookingStatus(booking)
  if (status === 'Cancelled') return 'Cancelled'
  if (status === 'Completed' || booking.checkOut <= today) return 'Past'
  return 'Future'
}

export function MyBookingsPage() {
  const [tab, setTab] = useState<BookingTab>('Future')
  const bookings = useMyBookings()
  const { data: apartments = [] } = useApartments()

  const grouped = useMemo(() => {
    const today = todayIso()
    const result: Record<BookingTab, BookingListItemDto[]> = { Future: [], Past: [], Cancelled: [] }
    for (const b of bookings.data ?? []) result[tabOf(b, today)].push(b)
    return result
  }, [bookings.data])

  if (bookings.isLoading) {
    return (
      <CabinetShell>
        <Loader />
      </CabinetShell>
    )
  }

  if (bookings.isError) {
    return (
      <CabinetShell>
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити бронювання.
        </InfoMessage>
      </CabinetShell>
    )
  }

  if ((bookings.data ?? []).length === 0) {
    return (
      <Container className={styles.empty}>
        <h1>У вас ще немає бронювань</h1>
        <p className={styles.muted}>Оберіть апартаменти у Києві для своєї наступної поїздки.</p>
        <ButtonLink to={bookingPaths.search} className={styles.emptyAction}>
          Знайти апартаменти
        </ButtonLink>
      </Container>
    )
  }

  const items = grouped[tab]
  const apartmentById = new Map(apartments.map((a) => [a.id, a]))

  return (
    <CabinetShell>
      <div className={styles.page}>
        <h1>Мої бронювання</h1>
        <Tabs<BookingTab>
          label="Бронювання"
          value={tab}
          onChange={setTab}
          items={(Object.keys(tabLabels) as BookingTab[]).map((t) => ({
            value: t,
            label: grouped[t].length ? `${tabLabels[t]} (${grouped[t].length})` : tabLabels[t],
          }))}
        />
        {items.length === 0 ? (
          <p className={styles.muted}>{emptyText[tab]}</p>
        ) : (
          <div className={styles.list}>
            {items.map((b) => (
              <BookingListCard
                key={b.id}
                booking={b}
                apartment={apartmentById.get(b.apartmentId)}
              />
            ))}
          </div>
        )}
      </div>
    </CabinetShell>
  )
}
