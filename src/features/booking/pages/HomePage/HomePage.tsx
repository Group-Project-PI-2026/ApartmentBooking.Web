import { Link } from 'react-router'
import { propertyPaths } from '@/features/property/paths'
import { ButtonLink, Container, FaqRow } from '@/shared/ui'
import { useApartments, useDistricts } from '../../api/apartments'
import pecherskyi from '../../assets/districts/pecherskyi.jpg'
import podilskyi from '../../assets/districts/podilskyi.jpg'
import shevchenkivskyi from '../../assets/districts/shevchenkivskyi.jpg'
import { ApartmentCard } from '../../components/ApartmentCard/ApartmentCard'
import { SearchForm } from '../../components/SearchForm/SearchForm'
import { DEPOSIT_PERCENT } from '../../bookingPolicy'
import { searchUrl } from '../../searchQuery'
import styles from './HomePage.module.css'

const featuredDistricts = [
  { name: 'Подільський', image: podilskyi },
  { name: 'Печерський', image: pecherskyi },
  { name: 'Шевченківський', image: shevchenkivskyi },
]

const steps = [
  { title: 'Оберіть апартаменти', text: 'Вкажіть дати та перегляньте доступні варіанти.' },
  { title: 'Підтвердіть особу', text: 'Увійдіть і пройдіть перевірку особи.' },
  { title: 'Сплатіть', text: `Оберіть передоплату ${DEPOSIT_PERCENT}% або повну оплату.` },
]

const faq = [
  'Чи можна переглядати житло без реєстрації?',
  'Чи потрібно вносити передоплату?',
  'Як скасувати бронювання?',
  'Коли будуть доступні інструкції заселення?',
]

export function HomePage() {
  const { data: districts = [] } = useDistricts()
  const { data: apartments = [] } = useApartments()

  const districtId = (name: string) => String(districts.find((d) => d.name === name)?.id ?? '')

  return (
    <Container className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <h1>Апартаменти у Києві для вашої поїздки</h1>
          <p className={styles.lead}>
            Оберіть район, дати та кількість гостей — знайдіть доступне житло.
          </p>
        </div>
        <SearchForm />
      </section>

      <section className={styles.section}>
        <h2>Оберіть район Києва</h2>
        <div className={styles.grid}>
          {featuredDistricts.map((d) => (
            <Link
              key={d.name}
              to={searchUrl({ districtId: districtId(d.name) })}
              className={styles.district}
            >
              <img src={d.image} alt="" className={styles.districtPhoto} />
              <span className={styles.districtName}>{d.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {apartments.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Апартаменти у Києві</h2>
            <Link to={searchUrl({})} className={styles.more}>
              Переглянути всі
            </Link>
          </div>
          <div className={styles.grid}>
            {apartments.slice(0, 3).map((a) => (
              <ApartmentCard key={a.id} apartment={a} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>Як забронювати</h2>
        <ol className={styles.grid}>
          {steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <h2>Хочете здавати апартаменти у Києві?</h2>
          <p className={styles.lead}>
            Подайте заявку на співпрацю. Наш менеджер зв’яжеться з вами для уточнення деталей.
          </p>
        </div>
        <ButtonLink to={propertyPaths.ownerApply} className={styles.bannerAction}>
          Подати заявку
        </ButtonLink>
      </section>

      <section className={styles.section}>
        <h2>Поширені запитання</h2>
        <div className={styles.faq}>
          {faq.map((q) => (
            <FaqRow key={q} question={q} />
          ))}
        </div>
      </section>
    </Container>
  )
}
