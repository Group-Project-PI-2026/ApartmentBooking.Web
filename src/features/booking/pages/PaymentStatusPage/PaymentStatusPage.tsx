import { useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { formatDateRange, nightsBetween } from '@/shared/lib/date'
import { formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import { Button, ButtonLink, Container, InfoMessage } from '@/shared/ui'
import { useMyBookings } from '../../api/bookings'
import { bookingPaths } from '../../paths'
import { clearPendingPayment, readPendingPayment } from '../../pendingPayment'
import styles from './PaymentStatusPage.module.css'

const icons = import.meta.glob<string>('/src/shared/assets/icons/clock.svg', {
  eager: true,
  import: 'default',
})
const clockIcon = Object.values(icons)[0]

const POLL_INTERVAL = 3000
const POLL_DURATION = 2 * 60 * 1000

export function PaymentStatusPage() {
  const navigate = useNavigate()
  const [pending] = useState(readPendingPayment)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [expired, setExpired] = useState(false)
  const polling = Boolean(pending) && !expired

  const bookings = useMyBookings('Future', polling ? POLL_INTERVAL : false)

  const found = pending
    ? bookings.data?.find(
        (b) =>
          b.apartmentId === pending.apartmentId &&
          b.checkIn === pending.checkIn &&
          b.checkOut === pending.checkOut,
      )
    : undefined

  useEffect(() => {
    if (!pending || expired) return
    const timer = setTimeout(() => setExpired(true), startedAt + POLL_DURATION - Date.now())
    return () => clearTimeout(timer)
  }, [pending, expired, startedAt])

  useEffect(() => {
    if (!found) return
    clearPendingPayment()
    navigate(generatePath(bookingPaths.bookingDetails, { id: found.id }), { replace: true })
  }, [found, navigate])

  const checkAgain = () => {
    setStartedAt(Date.now())
    setExpired(false)
    void bookings.refetch()
  }

  return (
    <Container className={styles.page}>
      <span className={styles.icon} aria-hidden>
        {clockIcon && <img src={clockIcon} alt="" width={28} height={28} />}
      </span>
      <h1>Перевіряємо платіж</h1>
      <p className={styles.lead}>
        Очікуємо підтвердження оплати. Дати залишаються зарезервованими на час перевірки.
      </p>

      {pending && (
        <section className={styles.card}>
          <div className={styles.heading}>
            <h3>{pending.title}</h3>
            <span className={styles.muted}>
              Київ, {pending.districtName} район · {formatGuests(pending.guests)}
            </span>
          </div>
          <hr className={styles.divider} />
          <p>
            {formatDateRange(pending.checkIn, pending.checkOut)} ·{' '}
            {formatNights(nightsBetween(pending.checkIn, pending.checkOut))}
          </p>
          <p>Сума платежу: {formatPrice(pending.amount)}</p>
        </section>
      )}

      <div className={styles.actions}>
        <Button className={styles.action} onClick={checkAgain} disabled={bookings.isFetching}>
          Перевірити статус
        </Button>
        <ButtonLink variant="secondary" className={styles.action} to={bookingPaths.myBookings}>
          До моїх бронювань
        </ButtonLink>
      </div>

      {pending && !polling ? (
        <InfoMessage tone="error" title="Потрібна перевірка" className={styles.message}>
          Підтвердження оплати ще не надійшло. Зверніться до підтримки, якщо кошти списано.
        </InfoMessage>
      ) : (
        <InfoMessage tone="warning" title="Очікування підтвердження" className={styles.message}>
          Не створюйте новий платіж.
        </InfoMessage>
      )}

      <p className={styles.hint}>Не створюйте новий платіж, поки перевірка не завершена.</p>
    </Container>
  )
}
