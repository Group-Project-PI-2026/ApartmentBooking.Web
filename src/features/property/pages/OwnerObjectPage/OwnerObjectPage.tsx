import { Link, useParams } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import { plural } from '@/shared/lib/format'
import { ButtonLink, InfoMessage, Loader } from '@/shared/ui'
import { useOwnerObject } from '../../api/ownerObjects'
import { formatRooms } from '../../apartmentOptions'
import { publicationLabel } from '../../apartmentState'
import { propertyPaths } from '../../paths'
import styles from './OwnerObjectPage.module.css'

export function OwnerObjectPage() {
  const { id = '' } = useParams()
  const { data: object, isLoading } = useOwnerObject(id)

  if (isLoading) return <Loader />

  if (!object) {
    return (
      <div className={styles.page}>
        <Link to={propertyPaths.ownerObjects} className={styles.back}>
          ← До моїх об’єктів
        </Link>
        <InfoMessage tone="error" title="Об’єкт не знайдено">
          Можливо, його вже не прив’язано до вашого акаунта.
        </InfoMessage>
      </div>
    )
  }

  const guests = `До ${object.maxGuests} ${plural(object.maxGuests, 'гостя', 'гостей', 'гостей')}`

  return (
    <div className={styles.page}>
      <Link to={propertyPaths.ownerObjects} className={styles.back}>
        ← До моїх об’єктів
      </Link>

      <header className={styles.header}>
        <h1>{object.title}</h1>
        <p className={styles.muted}>
          Київ, {object.district} район · {object.address}
        </p>
      </header>

      {object.photos.length > 0 && (
        <ul className={styles.photos}>
          {object.photos.map((url, i) => (
            <li key={`${url}-${i}`}>
              <img src={url} alt={`${object.title}, фото ${i + 1}`} className={styles.photo} />
            </li>
          ))}
        </ul>
      )}

      <section className={styles.card}>
        <h2>Про помешкання</h2>
        <p>{object.description}</p>
        <p>
          {formatRooms(object.rooms)} · {guests} · {publicationLabel[object.state]}
        </p>
      </section>

      {object.amenities.length > 0 && (
        <section className={styles.card}>
          <h2>Зручності</h2>
          <p>{object.amenities.join(' · ')}</p>
        </section>
      )}

      <div className={styles.actions}>
        <ButtonLink to={propertyPaths.ownerObjects} variant="secondary">
          До моїх об’єктів
        </ButtonLink>
        <ButtonLink to={`${propertyPaths.ownerStatistics}?object=${object.id}`}>
          Переглянути статистику
        </ButtonLink>
        <ButtonLink to={bookingPaths.help} variant="secondary">
          Звернутися до менеджера
        </ButtonLink>
      </div>
    </div>
  )
}
