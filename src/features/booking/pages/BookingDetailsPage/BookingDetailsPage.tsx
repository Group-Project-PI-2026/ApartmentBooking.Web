import { generatePath, Link, useParams, useSearchParams } from 'react-router'
import { ApiError } from '@/shared/api'
import { useCurrentUser } from '@/shared/auth'
import { formatLongDate } from '@/shared/lib/date'
import { formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Button, ButtonLink, Container, InfoMessage, Loader, Status } from '@/shared/ui'
import { useApartment } from '../../api/apartments'
import { bookingNumber, bookingStatus, useBooking, usePayBalance } from '../../api/bookings'
import { cancellationTerms } from '../../bookingPolicy'
import { bookingStatusView, bookingTitle } from '../../bookingStatus'
import { bookingPaths } from '../../paths'
import styles from './BookingDetailsPage.module.css'

export function BookingDetailsPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { profile } = useCurrentUser()
  const booking = useBooking(id)
  const apartment = useApartment(booking.data?.apartmentId ?? '')
  const payBalance = usePayBalance(id)

  if (booking.isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  if (booking.error instanceof ApiError && [400, 403, 404].includes(booking.error.status)) {
    return <NotFoundPage />
  }

  const b = booking.data
  if (!b) {
    return (
      <Container className={styles.page}>
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити бронювання.
        </InfoMessage>
      </Container>
    )
  }

  const status = bookingStatus(b)
  const view = bookingStatusView[status]
  const balance = Number(b.balanceDue)
  const a = apartment.data
  const guestName = [profile?.given_name, profile?.family_name].filter(Boolean).join(' ')
  const details = [a ? formatGuests(a.maxGuests) : null, ...(a?.amenities ?? [])].filter(Boolean)

  const pay = () =>
    payBalance.mutate(undefined, { onSuccess: (data) => window.location.assign(data.checkoutUrl) })

  return (
    <Container className={styles.page}>
      <Link to={bookingPaths.myBookings} className={styles.back}>
        ← Усі мої бронювання
      </Link>

      <header className={styles.header}>
        <h1>{bookingTitle[status]}</h1>
        <div className={styles.meta}>
          <span>Номер бронювання: {bookingNumber(b.id)}</span>
          <Status tone={view.tone}>{view.label}</Status>
        </div>
      </header>

      {params.get('payment') === 'success' && balance > 0 && (
        <InfoMessage tone="info" title="Платіж перевіряється" className={styles.notice}>
          Оновіть сторінку за кілька хвилин, щоб побачити новий статус оплати.
        </InfoMessage>
      )}

      <div className={styles.columns}>
        <div className={styles.column}>
          <section className={styles.card}>
            <h2>{b.apartmentTitle}</h2>
            {b.photoUrl && <img src={b.photoUrl} alt="" className={styles.photo} />}
            {a && <span className={styles.muted}>Київ, {a.districtName} район</span>}
            {details.length > 0 && <span>{details.join(' · ')}</span>}
            <Link
              to={generatePath(bookingPaths.apartment, { id: b.apartmentId })}
              className={styles.link}
            >
              Сторінка апартаментів
            </Link>
          </section>

          <section className={styles.card}>
            <h2>Дати та гості</h2>
            <div>
              <p>Заїзд: {formatLongDate(b.checkIn)}, після 15:00</p>
              <p>Виїзд: {formatLongDate(b.checkOut)}, до 11:00</p>
            </div>
            <p>{formatNights(Number(b.nights))}</p>
          </section>

          <section className={styles.card}>
            <h2>Інформація про гостя</h2>
            {guestName && <p>{guestName}</p>}
            {profile?.email && <p>{profile.email}</p>}
          </section>
        </div>

        <div className={styles.column}>
          <section className={styles.card}>
            <h2>Оплата</h2>
            <dl className={styles.amounts}>
              <dt>Загальна вартість</dt>
              <dd>{formatPrice(b.totalPrice)}</dd>
              <dt>Сплачено</dt>
              <dd>{formatPrice(b.paidAmount)}</dd>
              {status === 'Cancelled' ? (
                <>
                  <dt>Утримано</dt>
                  <dd>{formatPrice(b.penaltyAmount)}</dd>
                  <dt>До повернення</dt>
                  <dd>{formatPrice(b.refundAmount)}</dd>
                </>
              ) : (
                <>
                  <dt>Залишок до сплати</dt>
                  <dd>{formatPrice(balance)}</dd>
                </>
              )}
            </dl>
            {balance > 0 && status !== 'Cancelled' && (
              <span className={styles.hint}>Залишок сплачується в день заселення.</span>
            )}
            {payBalance.isError && (
              <InfoMessage tone="error" title="Спробуйте ще раз">
                Не вдалося перейти до оплати.
              </InfoMessage>
            )}
            {b.canPayBalance && balance > 0 && (
              <Button fullWidth onClick={pay} disabled={payBalance.isPending}>
                Сплатити залишок · {formatPrice(balance)}
              </Button>
            )}
          </section>

          {status !== 'Cancelled' && (
            <section className={styles.card}>
              <h2>Інструкції заселення</h2>
              {b.checkInInstructions ? (
                <p className={styles.instructions}>{b.checkInInstructions}</p>
              ) : (
                <>
                  <h3 className={styles.muted}>Ще недоступні</h3>
                  <p className={styles.muted}>
                    Інструкції з’являться тут вранці в день заселення. Також надішлемо їх на email.
                  </p>
                </>
              )}
            </section>
          )}

          {b.canCancel && (
            <section className={styles.card}>
              <h2>Скасування бронювання</h2>
              {cancellationTerms.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <ButtonLink
                variant="destructive"
                fullWidth
                to={generatePath(bookingPaths.cancelBooking, { id: b.id })}
              >
                Скасувати бронювання
              </ButtonLink>
            </section>
          )}

          <Link to={bookingPaths.help} className={styles.link}>
            Звернутися до підтримки
          </Link>
        </div>
      </div>
    </Container>
  )
}
