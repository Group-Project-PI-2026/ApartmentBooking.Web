import { generatePath } from 'react-router'
import { formatGuests, formatPrice } from '@/shared/lib/format'
import { ButtonLink } from '@/shared/ui'
import type { ApartmentCardDto } from '../../api/apartments'
import { bookingPaths } from '../../paths'
import styles from './ApartmentCard.module.css'

interface Props {
  apartment: ApartmentCardDto
}

export function ApartmentCard({ apartment }: Props) {
  const href = generatePath(bookingPaths.apartment, { id: apartment.id })

  return (
    <article className={styles.card}>
      {apartment.photoUrl ? (
        <img className={styles.photo} src={apartment.photoUrl} alt="" loading="lazy" />
      ) : (
        <div className={styles.photo} />
      )}
      <div className={styles.heading}>
        <h3 className={styles.title}>{apartment.title}</h3>
        <span className={styles.muted}>Київ · {apartment.districtName} район</span>
      </div>
      <span className={styles.meta}>{formatGuests(apartment.maxGuests)}</span>
      {apartment.amenities.length > 0 && (
        <span className={styles.muted}>{apartment.amenities.join(' · ')}</span>
      )}
      <span className={styles.price}>від {formatPrice(apartment.pricePerNight)} / ніч</span>
      <ButtonLink to={href} fullWidth className={styles.action}>
        Переглянути
      </ButtonLink>
    </article>
  )
}
