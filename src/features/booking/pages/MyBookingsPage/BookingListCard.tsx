import { generatePath } from 'react-router'
import { formatDateRange } from '@/shared/lib/date'
import { formatNights, formatPrice } from '@/shared/lib/format'
import { ButtonLink, Status } from '@/shared/ui'
import type { ApartmentCardDto } from '../../api/apartments'
import { bookingNumber, bookingStatus, type BookingListItemDto } from '../../api/bookings'
import { bookingStatusView } from '../../bookingStatus'
import { bookingPaths } from '../../paths'
import styles from './MyBookingsPage.module.css'

interface Props {
  booking: BookingListItemDto
  apartment?: ApartmentCardDto
}

export function BookingListCard({ booking, apartment }: Props) {
  const status = bookingStatus(booking)
  const view = bookingStatusView[status]
  const balance = Number(booking.balanceDue)

  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        {booking.photoUrl ? (
          <img src={booking.photoUrl} alt="" className={styles.photo} />
        ) : (
          <div className={styles.photo} />
        )}
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h3>{booking.apartmentTitle}</h3>
            <Status tone={view.tone}>{view.label}</Status>
          </div>
          {apartment && <span className={styles.muted}>Київ, {apartment.districtName} район</span>}
          <span>
            {formatDateRange(booking.checkIn, booking.checkOut)} ·{' '}
            {formatNights(Number(booking.nights))}
          </span>
          {apartment && apartment.amenities.length > 0 && (
            <span className={styles.amenities}>{apartment.amenities.join(' · ')}</span>
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.cardFooter}>
        <div className={styles.number}>
          <span className={styles.caption}>Номер бронювання</span>
          <strong>{bookingNumber(booking.id)}</strong>
        </div>
        <div className={styles.paid}>
          <span>
            Внесено {formatPrice(booking.paidAmount)} із {formatPrice(booking.totalPrice)}
          </span>
          {balance > 0 && status !== 'Cancelled' && (
            <span className={styles.caption}>Залишок {formatPrice(balance)}</span>
          )}
        </div>
        <ButtonLink
          to={generatePath(bookingPaths.bookingDetails, { id: booking.id })}
          className={styles.detailsButton}
        >
          Деталі бронювання
        </ButtonLink>
      </div>
    </article>
  )
}
