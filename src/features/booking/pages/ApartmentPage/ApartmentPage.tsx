import { Link, useParams, useSearchParams } from 'react-router'
import { formatGuests } from '@/shared/lib/format'
import { Container, Loader } from '@/shared/ui'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ApiError } from '@/shared/api'
import { useApartment } from '../../api/apartments'
import { amenityIcon, locationIcon } from '../../amenityIcons'
import { readSearch, searchUrl } from '../../searchQuery'
import { BookingCard } from './BookingCard'
import { Gallery } from './Gallery'
import styles from './ApartmentPage.module.css'

const rules = [
  { title: 'Заїзд', text: 'після 15:00' },
  { title: 'Виїзд', text: 'до 11:00' },
  { title: 'Без куріння', text: 'У помешканні заборонено курити' },
]

const terms = [
  'Оплата: передоплата 50% або повна оплата через зовнішній платіжний сервіс.',
  'Понад 7 діб до заїзду: повне повернення сплаченої суми.',
  'Понад 24 години й до 7 діб включно: утримання 10% вартості бронювання.',
  'За 24 години або менше до заїзду: кошти не повертаються.',
]

export function ApartmentPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const search = readSearch(params)
  const { data: apartment, isLoading, error } = useApartment(id)

  if (isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage />
  }

  if (!apartment) {
    return (
      <Container className={styles.page}>
        <p className={styles.error}>Не вдалося завантажити апартаменти. Спробуйте ще раз.</p>
      </Container>
    )
  }

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumbs} aria-label="Навігація">
          <Link to={searchUrl({})}>Київ</Link>
          <span aria-hidden>/</span>
          <Link to={searchUrl({ districtId: String(apartment.districtId) })}>
            {apartment.districtName}
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{apartment.title}</span>
        </nav>
        <h1>{apartment.title}</h1>
        <p className={styles.subtitle}>
          Київ, {apartment.districtName} район · {formatGuests(apartment.maxGuests)}
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Gallery photos={apartment.photoUrls} title={apartment.title} />

          {apartment.description && (
            <section className={styles.section}>
              <h2>Про помешкання</h2>
              <p className={styles.description}>{apartment.description}</p>
            </section>
          )}

          {apartment.amenities.length > 0 && (
            <section className={styles.section}>
              <h2>Зручності</h2>
              <ul className={styles.amenities}>
                {apartment.amenities.map((a) => {
                  const icon = amenityIcon(a)
                  return (
                    <li key={a} className={styles.amenity}>
                      {icon ? (
                        <img src={icon} alt="" className={styles.amenityIcon} />
                      ) : (
                        <span className={styles.amenityIcon} />
                      )}
                      {a}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section className={styles.section}>
            <h2>Розташування</h2>
            <div className={styles.location}>
              {locationIcon && <img src={locationIcon} alt="" />}
              <h3>{apartment.districtName} район, Київ</h3>
              <span className={styles.locationHint}>Схема розташування</span>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Правила проживання</h2>
            <ul className={styles.rules}>
              {rules.map((r) => (
                <li key={r.title} className={styles.rule}>
                  <h3>{r.title}</h3>
                  <span className={styles.ruleText}>{r.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Умови оплати та скасування</h2>
            <div className={styles.terms}>
              {terms.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        </div>

        <BookingCard
          key={apartment.id}
          apartment={apartment}
          initialCheckIn={search.checkIn}
          initialCheckOut={search.checkOut}
          initialGuests={search.guests}
        />
      </div>
    </Container>
  )
}
