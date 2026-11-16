import { useCurrentUser } from '@/shared/auth'
import { cn } from '@/shared/lib/cn'
import { ButtonLink, Container, FaqRow } from '@/shared/ui'
import hero from '../../assets/owners-hero.jpg'
import { propertyPaths } from '../../paths'
import styles from './OwnersPage.module.css'

const steps = [
  { title: 'Подайте заявку', text: 'Розкажіть про житло й додайте фото.' },
  { title: 'Уточніть деталі', text: 'Менеджер розгляне дані та зв’яжеться з вами.' },
  { title: 'Узгодьте співпрацю', text: 'Погодьте подальші дії.' },
  {
    title: 'Отримайте доступ',
    text: 'Після налаштування доступу переглядайте свої об’єкти в кабінеті.',
  },
]

const checklist = [
  'Контактні дані',
  'Адресу апартаментів у Києві',
  'Характеристики та зручності',
  'Опис і фотографії',
]

const faq = [
  {
    question: 'Яке житло можна подати?',
    answer: 'Апартаменти для короткострокової оренди в Києві.',
  },
  {
    question: 'Що відбувається після подання заявки?',
    answer: 'Менеджер розгляне інформацію та повідомить про наступні кроки.',
  },
  {
    question: 'Хто керує календарем і бронюваннями?',
    answer: 'Календарем і бронюваннями керує менеджер.',
  },
  {
    question: 'Коли з’явиться доступ до об’єктів?',
    answer: 'Після схвалення співпраці та налаштування доступу адміністратором.',
  },
]

export function OwnersPage() {
  const { isAuthenticated } = useCurrentUser()

  return (
    <Container className={styles.page}>
      <section className={cn(styles.hero, isAuthenticated && styles.heroTop)}>
        <div className={styles.intro}>
          <h1>Здавайте апартаменти у Києві</h1>
          <p className={styles.lead}>
            Подайте заявку на співпрацю. Менеджер перевірить інформацію та зв’яжеться з вами.
          </p>
          <ButtonLink to={propertyPaths.ownerApply} className={styles.action}>
            Подати заявку
          </ButtonLink>
        </div>
        <img src={hero} alt="" className={styles.photo} />
      </section>

      <section className={styles.section}>
        <h2>Як розпочати співпрацю</h2>
        <ol className={styles.grid}>
          {steps.map((s, i) => (
            <li key={s.title} className={styles.card}>
              <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p className={styles.muted}>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2>Що підготувати</h2>
        <ul className={styles.grid}>
          {checklist.map((item) => (
            <li key={item} className={cn(styles.card, styles.checkItem)}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <h2>Як розподіляється робота</h2>
        <p className={styles.muted}>
          Ви надаєте інформацію про апартаменти. Менеджер керує публікацією, календарем і
          бронюваннями.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Поширені запитання</h2>
        <div className={styles.faq}>
          {faq.map((f) => (
            <FaqRow key={f.question} question={f.question} answer={f.answer} />
          ))}
        </div>
      </section>

      <section className={cn(styles.panel, styles.banner)}>
        <div className={styles.bannerText}>
          <h2>Готові розповісти про апартаменти?</h2>
          <p className={styles.muted}>Подайте заявку на співпрацю.</p>
        </div>
        <ButtonLink to={propertyPaths.ownerApply} className={styles.action}>
          Подати заявку
        </ButtonLink>
      </section>
    </Container>
  )
}
