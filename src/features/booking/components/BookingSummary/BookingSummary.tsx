import { formatDateRange } from '@/shared/lib/date'
import { formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import styles from './BookingSummary.module.css'

interface Props {
  title: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  pricePerNight: number
  total: number
  payNow: number
  balance: number
}

export function BookingSummary({
  title,
  checkIn,
  checkOut,
  guests,
  nights,
  pricePerNight,
  total,
  payNow,
  balance,
}: Props) {
  return (
    <aside className={styles.panel}>
      <div className={styles.card}>
        <h3>Ваше бронювання</h3>
        <div className={styles.apartment}>
          <span className={styles.title}>{title}</span>
          <span className={styles.muted}>
            {formatDateRange(checkIn, checkOut)} · {formatGuests(guests)}
          </span>
        </div>
        <hr className={styles.divider} />
        <div className={styles.lines}>
          <span>
            {formatNights(nights)} × {formatPrice(pricePerNight)}
          </span>
          <span className={styles.strong}>Загальна вартість {formatPrice(total)}</span>
        </div>
        <div className={styles.lines}>
          <span className={styles.strong}>До сплати зараз {formatPrice(payNow)}</span>
          <span className={styles.small}>Залишок {formatPrice(balance)}</span>
        </div>
      </div>
    </aside>
  )
}
