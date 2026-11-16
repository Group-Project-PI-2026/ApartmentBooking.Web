import { paths } from '@/shared/routes/paths'
import { ButtonLink, Container } from '@/shared/ui'
import styles from './StatusPage.module.css'

interface Props {
  title: string
  text: string
}

export function StatusPage({ title, text }: Props) {
  return (
    <Container className={styles.page}>
      <section className={styles.card}>
        <h1>{title}</h1>
        <p className={styles.text}>{text}</p>
        <ButtonLink to={paths.home} className={styles.action}>
          На головну
        </ButtonLink>
      </section>
    </Container>
  )
}
