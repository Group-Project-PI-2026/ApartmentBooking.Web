import { generatePath } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import { formatGuests } from '@/shared/lib/format'
import { ButtonLink, InfoMessage, Loader, Status } from '@/shared/ui'
import { useOwnerObjects } from '../../api/ownerObjects'
import { formatRooms } from '../../apartmentOptions'
import { publicationLabel, publicationTone } from '../../apartmentState'
import { propertyPaths } from '../../paths'
import styles from './OwnerObjectsPage.module.css'

export function OwnerObjectsPage() {
  const { data: objects, isLoading, isError } = useOwnerObjects()

  return (
    <div className={styles.page}>
      <h1>Мої об’єкти</h1>

      {isLoading && <Loader />}
      {isError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити ваші об’єкти.
        </InfoMessage>
      )}

      {objects?.length === 0 && (
        <section className={styles.empty}>
          <h2>До вашого акаунта ще не прив’язано апартаменти</h2>
          <p className={styles.muted}>Якщо співпрацю вже погоджено, зверніться до менеджера.</p>
          <ButtonLink to={bookingPaths.help} className={styles.action}>
            Звернутися до менеджера
          </ButtonLink>
        </section>
      )}

      {objects && objects.length > 0 && (
        <>
          <p className={styles.muted}>
            Тут відображаються апартаменти, прив’язані до вашого акаунта.
          </p>
          <ul className={styles.list}>
            {objects.map((o) => (
              <li key={o.id} className={styles.card}>
                {o.photos[0] && <img src={o.photos[0]} alt="" className={styles.photo} />}
                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <h3>{o.title}</h3>
                    <Status tone={publicationTone[o.state]}>{publicationLabel[o.state]}</Status>
                  </div>
                  <p className={styles.muted}>Київ, {o.district} район</p>
                  <p className={styles.muted}>{o.address}</p>
                  <p>
                    {formatRooms(o.rooms)} · {formatGuests(o.maxGuests)}
                  </p>
                  <div className={styles.actions}>
                    <ButtonLink to={generatePath(propertyPaths.ownerObjectDetails, { id: o.id })}>
                      Переглянути
                    </ButtonLink>
                    <ButtonLink
                      to={`${propertyPaths.ownerStatistics}?object=${o.id}`}
                      variant="secondary"
                    >
                      Статистика
                    </ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
