import { Link } from 'react-router'
import { Container } from '@/shared/ui'
import { cancellationRules, DEPOSIT_PERCENT } from '../../bookingPolicy'
import { bookingPaths } from '../../paths'
import styles from './InfoPages.module.css'

const sections = [
  {
    id: 'search',
    title: 'Пошук і бронювання',
    text: 'Шукайте доступні апартаменти в Києві за районом, датами та кількістю гостей. Перед підтвердженням перевірте деталі проживання і вартість.',
  },
  {
    id: 'auth',
    title: 'Авторизація та перевірка особи',
    text: 'Для оформлення бронювання потрібно увійти в акаунт. Якщо особу вже підтверджено, повторна перевірка не потрібна.',
  },
  {
    id: 'payment',
    title: 'Оплата',
    text: `Можна внести передоплату ${DEPOSIT_PERCENT}% або сплатити повну вартість проживання. Оплата відбувається на сторінці зовнішнього платіжного сервісу.`,
  },
  {
    id: 'balance',
    title: 'Доплата',
    text: `Якщо внесено ${DEPOSIT_PERCENT}% передоплати, залишок сплачується в день заселення.`,
  },
  {
    id: 'confirmation',
    title: 'Підтвердження платежу',
    text: 'Перевірка підтвердження платежу триває до 15 хвилин. Якщо підтвердження не надійшло, резерв звільняється. Пізній платіж після закриття резерву не підтверджує бронювання; оформлюється повернення.',
  },
  { id: 'cancellation', title: 'Умови скасування', text: '' },
  {
    id: 'refund',
    title: 'Повернення',
    text: 'Перед остаточним скасуванням показується розрахунок суми до повернення. Кошти повертаються на спосіб оплати, використаний для платежу.',
  },
  {
    id: 'instructions',
    title: 'Інструкції заселення',
    text: 'Інструкції відкриваються вранці в день заселення у деталях бронювання та надсилаються на email.',
  },
  {
    id: 'help',
    title: 'Допомога',
    text: 'Для запитань зверніться через розділ «Контакти та допомога».',
  },
]

export function TermsPage() {
  return (
    <Container className={styles.document}>
      <header className={styles.intro}>
        <h1>Умови бронювання та скасування</h1>
        <p className={styles.lead}>
          Короткі правила для пошуку, оплати, проживання та скасування бронювання.
        </p>
      </header>

      <nav className={styles.toc} aria-label="Зміст">
        <h2>Зміст</h2>
        <ol className={styles.tocList}>
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className={styles.docSection}>
          <h2>
            {i + 1}. {s.title}
          </h2>
          {s.id === 'cancellation' ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Час до заїзду</th>
                  <th>Повернення</th>
                </tr>
              </thead>
              <tbody>
                {cancellationRules.map((r) => (
                  <tr key={r.time}>
                    <td>{r.time}</td>
                    <td>{r.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.lead}>{s.text}</p>
          )}
        </section>
      ))}

      <nav className={styles.links}>
        <Link to={bookingPaths.privacy}>Політика конфіденційності</Link>
        <Link to={bookingPaths.help}>Контакти та допомога</Link>
      </nav>
    </Container>
  )
}
