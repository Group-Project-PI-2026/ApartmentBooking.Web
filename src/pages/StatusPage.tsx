import { paths } from '@/shared/routes/paths'
import { Button, ButtonLink, Container } from '@/shared/ui'
import styles from './StatusPage.module.css'

interface Props {
  title: string
  text: string
  onReload?: () => void
}

export function StatusPage({ title, text, onReload }: Props) {
  return (
    <Container className={styles.page}>
      <section className={styles.card}>
        <h1>{title}</h1>
        <p className={styles.text}>{text}</p>
        <div className={styles.actions}>
          {onReload && (
            <Button className={styles.action} onClick={onReload}>
              Оновити сторінку
            </Button>
          )}
          <ButtonLink
            to={paths.home}
            variant={onReload ? 'secondary' : 'primary'}
            className={styles.action}
          >
            На головну
          </ButtonLink>
        </div>
      </section>
    </Container>
  )
}
