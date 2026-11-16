import { generatePath, Link, useParams } from 'react-router'
import { formatDateRange, nightsBetween, todayIso } from '@/shared/lib/date'
import { formatDays, formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import {
  Button,
  ButtonLink,
  Container,
  InfoMessage,
  Loader,
  Status,
  type StatusTone,
} from '@/shared/ui'
import { useApartment } from '../../api/apartments'
import {
  bookingNumber,
  useBooking,
  useCancelBooking,
  useRefundPreview,
  type RefundStatus,
} from '../../api/bookings'
import { bookingPaths } from '../../paths'
import styles from './CancelBookingPage.module.css'

const refundView: Record<RefundStatus, { label: string; tone: StatusTone } | null> = {
  None: null,
  Pending: { label: 'Повернення оформлюється', tone: 'warning' },
  Succeeded: { label: 'Кошти повернуто', tone: 'success' },
  Failed: { label: 'Повернення не вдалося', tone: 'error' },
}

export function CancelBookingPage() {
  const { id = '' } = useParams()
  const booking = useBooking(id)
  const preview = useRefundPreview(id)
  const apartment = useApartment(booking.data?.apartmentId ?? '')
  const cancel = useCancelBooking(id)

  const detailsHref = generatePath(bookingPaths.bookingDetails, { id })

  if (booking.isLoading || preview.isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  const b = booking.data
  const p = preview.data
  if (!b || !p) {
    return (
      <Container className={styles.page}>
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити дані бронювання.
        </InfoMessage>
      </Container>
    )
  }

  const a = apartment.data
  const nights = Number(b.nights)
  const location = a ? `Київ, ${a.districtName} район` : ''

  if (cancel.data) {
    const refund = refundView[String(cancel.data.refundStatus) as RefundStatus]
    return (
      <Container className={styles.done}>
        {refund && <Status tone={refund.tone}>{refund.label}</Status>}
        <h1>Бронювання скасовано</h1>
        <p className={styles.muted}>
          {Number(cancel.data.refundAmount) === 0
            ? 'Кошти за це бронювання не повертаються згідно з умовами скасування.'
            : String(cancel.data.refundStatus) === 'Failed'
              ? `До повернення — ${formatPrice(cancel.data.refundAmount)}. Автоматичне повернення не вдалося, зверніться до підтримки.`
              : `До повернення — ${formatPrice(cancel.data.refundAmount)}. Повернення коштів на спосіб оплати, використаний для платежу, оформлюється.`}
        </p>
        {String(cancel.data.refundStatus) === 'Failed' && (
          <Link to={bookingPaths.help} className={styles.back}>
            Звернутися до підтримки
          </Link>
        )}
        <section className={styles.summary}>
          <h3>
            {b.apartmentTitle}
            {location && ` · ${location}`}
          </h3>
          <p>
            {formatDateRange(b.checkIn, b.checkOut)} · {formatNights(nights)}
          </p>
          <span className={styles.caption}>Номер бронювання: {bookingNumber(b.id)}</span>
        </section>
        <ButtonLink to={bookingPaths.myBookings} className={styles.doneAction}>
          До моїх бронювань
        </ButtonLink>
      </Container>
    )
  }

  const daysLeft = nightsBetween(todayIso(), b.checkIn)
  const total = Number(p.totalPrice)
  const penalty = Number(p.penaltyAmount)
  const penaltyPercent = total > 0 ? Math.round((penalty / total) * 100) : 0

  return (
    <Container className={styles.page}>
      <Link to={detailsHref} className={styles.back}>
        ← До бронювання
      </Link>

      <header className={styles.header}>
        <h1>Скасування бронювання</h1>
        <p className={styles.muted}>Перевірте суму повернення перед підтвердженням.</p>
      </header>

      <div className={styles.columns}>
        <section className={styles.card}>
          {b.photoUrl && <img src={b.photoUrl} alt="" className={styles.photo} />}
          <h2>{b.apartmentTitle}</h2>
          {location && <span className={styles.muted}>{location}</span>}
          <span>
            {formatDateRange(b.checkIn, b.checkOut)} · {formatNights(nights)}
          </span>
          {a && <span>{formatGuests(a.maxGuests)}</span>}
          {a && a.amenities.length > 0 && (
            <span className={styles.caption}>{a.amenities.join(' · ')}</span>
          )}
          <span className={styles.caption}>Номер бронювання: {bookingNumber(b.id)}</span>
        </section>

        <section className={styles.card}>
          <h2>Розрахунок повернення</h2>
          {daysLeft >= 0 && (
            <span className={styles.muted}>До заїзду — {formatDays(daysLeft)}</span>
          )}

          <dl className={styles.table}>
            <div className={styles.row}>
              <dt>Вартість бронювання</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Сплачено</dt>
              <dd>{formatPrice(p.paidAmount)}</dd>
            </div>
            <div className={styles.row}>
              <dt>
                {penalty > 0 ? `Утримання ${penaltyPercent}% вартості бронювання` : 'Утримання'}
              </dt>
              <dd>{formatPrice(penalty)}</dd>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <dt>До повернення</dt>
              <dd>{formatPrice(p.refundAmount)}</dd>
            </div>
          </dl>

          {p.canCancel ? (
            <>
              <p className={styles.muted}>
                Після скасування бронювання дати будуть звільнені. Кошти буде повернуто на спосіб
                оплати, використаний для платежу.
              </p>
              {cancel.isError && (
                <InfoMessage tone="error" title="Спробуйте ще раз">
                  Не вдалося скасувати бронювання.
                </InfoMessage>
              )}
              <div className={styles.actions}>
                <Button
                  variant="destructive"
                  className={styles.confirm}
                  onClick={() => cancel.mutate()}
                  disabled={cancel.isPending}
                >
                  Підтвердити скасування
                </Button>
                <ButtonLink variant="secondary" to={detailsHref} className={styles.keep}>
                  Зберегти бронювання
                </ButtonLink>
              </div>
            </>
          ) : (
            <InfoMessage tone="warning" title="Скасування недоступне">
              {p.reason ?? 'Це бронювання вже не можна скасувати.'}
            </InfoMessage>
          )}
        </section>
      </div>
    </Container>
  )
}
