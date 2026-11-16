import { useCurrentUser } from '@/shared/auth'
import styles from './ProfilePage.module.css'

export function NotificationsPage() {
  const { profile } = useCurrentUser()

  return (
    <div className={styles.page}>
      <h1>Сповіщення</h1>
      <section className={styles.card}>
        <h2>Електронна пошта</h2>
        <p>Отримувач: {profile?.email ?? '—'}</p>
        <p className={styles.muted}>
          Повідомлення про бронювання, оплату й заселення надходитимуть на вашу електронну пошту.
        </p>
      </section>
    </div>
  )
}
