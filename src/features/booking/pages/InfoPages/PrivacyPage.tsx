import { Link } from 'react-router'
import { Container } from '@/shared/ui'
import { bookingPaths } from '../../paths'
import styles from './InfoPages.module.css'

const sections = [
  {
    title: 'Які дані надає користувач',
    text: 'Для акаунта та бронювання користувач вказує контактні дані, обрані дати й кількість гостей. Для перевірки особи користувач додає зображення документа.',
  },
  {
    title: 'Для чого використовуються дані',
    text: 'Дані потрібні для оформлення й супроводу бронювання, підтвердження особи, платежу та заселення.',
  },
  {
    title: 'Перевірка особи',
    text: 'Документ використовується для перевірки особи. Копію документа не показано в деталях бронювання для менеджера.',
  },
  {
    title: 'Обробка оплати',
    text: 'Оплата відбувається у зовнішньому платіжному сервісі. Поля банківської картки не розміщено у формі цього застосунку.',
  },
  {
    title: 'Сервісні сповіщення',
    text: 'Повідомлення про бронювання, оплату та заселення надходять на email.',
  },
  {
    title: 'Доступ до даних',
    text: 'Доступ до даних залежить від ролі та завдання користувача в сервісі. Зміст розділу буде уточнено.',
  },
  { title: 'Зберігання даних', text: 'Зміст розділу буде уточнено.' },
  {
    title: 'Звернення користувача',
    text: 'З питань щодо даних звертайтеся через розділ «Контакти та допомога». Зміст розділу буде уточнено.',
  },
]

export function PrivacyPage() {
  return (
    <Container className={styles.document}>
      <header className={styles.intro}>
        <h1>Політика конфіденційності</h1>
        <p className={styles.lead}>
          Як у навчальному сервісі використовуються дані для акаунта, бронювання та заселення.
        </p>
      </header>

      {sections.map((s) => (
        <section key={s.title} className={styles.docSection}>
          <h2>{s.title}</h2>
          <p className={styles.lead}>{s.text}</p>
        </section>
      ))}

      <nav className={styles.links}>
        <Link to={bookingPaths.terms}>Умови бронювання</Link>
        <Link to={bookingPaths.help}>Контакти та допомога</Link>
      </nav>
    </Container>
  )
}
