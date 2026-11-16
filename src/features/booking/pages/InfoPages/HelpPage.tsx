import { Link } from 'react-router'
import { Container, FaqRow } from '@/shared/ui'
import { bookingPaths } from '../../paths'
import styles from './InfoPages.module.css'

const topics = [
  {
    title: 'Бронювання',
    text: 'Пошук апартаментів, дати проживання та деталі підтвердженого бронювання.',
  },
  {
    title: 'Оплата й повернення',
    text: 'Передоплата, повна оплата, доплата в день заселення та правила повернення.',
  },
  {
    title: 'Заселення',
    text: 'Інструкції відкриваються вранці в день заселення та надходять на email.',
  },
  {
    title: 'Співпраця власників',
    text: 'Подайте заявку на розгляд; менеджер повідомить про подальші кроки.',
  },
]

const faq = [
  {
    question: 'Чи можна сплатити частину суми?',
    answer:
      'Так, можна внести 50% або оплатити всю суму одразу. Залишок сплачується в день заселення.',
  },
  {
    question: 'Скільки чекати підтвердження платежу?',
    answer: 'Перевірка платежу триває до 15 хвилин. Актуальний стан відображається в бронюванні.',
  },
  {
    question: 'Коли будуть доступні інструкції заселення?',
    answer: 'Вранці в день заселення — у деталях бронювання та на email.',
  },
  {
    question: 'Як скасувати бронювання?',
    answer:
      'Відкрийте деталі бронювання та оберіть скасування. Перед підтвердженням ви побачите суму повернення.',
  },
  {
    question: 'Як подати житло на співпрацю?',
    answer: 'Відкрийте розділ для власників і заповніть заявку.',
  },
]

export function HelpPage() {
  return (
    <Container className={styles.page}>
      <header className={styles.intro}>
        <h1>Контакти та допомога</h1>
        <p className={styles.lead}>
          Знайдіть відповіді на запитання про бронювання, оплату, заселення та співпрацю в Києві.
        </p>
      </header>

      <div className={styles.topics}>
        {topics.map((t) => (
          <section key={t.title} className={styles.topic}>
            <h3>{t.title}</h3>
            <p className={styles.lead}>{t.text}</p>
          </section>
        ))}
      </div>

      <section className={styles.section}>
        <h2>Поширені запитання</h2>
        <div className={styles.faq}>
          {faq.map((f) => (
            <FaqRow key={f.question} question={f.question} answer={f.answer} />
          ))}
        </div>
      </section>

      <section className={styles.contacts}>
        <h2>Контакти</h2>
        <span className={styles.caption}>Демонстраційні контактні дані</span>
        <p>Email: support@example.com</p>
        <p>Телефон: +380 XX XXX XX XX</p>
        <nav className={styles.links}>
          <Link to={bookingPaths.terms}>Умови бронювання</Link>
          <Link to={bookingPaths.privacy}>Політика конфіденційності</Link>
        </nav>
      </section>
    </Container>
  )
}
