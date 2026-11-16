import { generatePath } from 'react-router'
import { formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import { ButtonLink } from '@/shared/ui'
import type { ApartmentCardDto } from '../../api/apartments'
import { bookingPaths } from '../../paths'
import styles from './ApartmentListItem.module.css'

interface Props {
  apartment: ApartmentCardDto
  nights?: number
  linkSearch?: string
}

export function ApartmentListItem({ apartment, nights, linkSearch = '' }: Props) {
  const href = generatePath(bookingPaths.apartment, { id: apartment.id }) + linkSearch
  const total = apartment.totalPrice != null ? Number(apartment.totalPrice) : null

  return (
    <article className={styles.item}>
      {apartment.photoUrl ? (
        <img className={styles.photo} src={apartment.photoUrl} alt="" loading="lazy" />
      ) : (
        <div className={styles.photo} />
      )}
      <div className={styles.info}>
        <h3 className={styles.title}>{apartment.title}</h3>
        <span className={styles.district}>Київ, {apartment.districtName} район</span>
        <span className={styles.meta}>{formatGuests(apartment.maxGuests)}</span>
        {apartment.amenities.length > 0 && (
          <span className={styles.amenities}>{apartment.amenities.join(' · ')}</span>
        )}
      </div>
      <div className={styles.aside}>
        <div className={styles.prices}>
          <span className={styles.price}>{formatPrice(apartment.pricePerNight)} / ніч</span>
          {total != null && nights ? (
            <span className={styles.total}>
              {formatPrice(total)} за {formatNights(nights)}
            </span>
          ) : null}
        </div>
        <ButtonLink to={href} fullWidth>
          Переглянути
        </ButtonLink>
      </div>
    </article>
  )
}
