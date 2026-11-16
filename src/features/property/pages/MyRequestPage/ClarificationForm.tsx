import { Button, Textarea } from '@/shared/ui'
import { PhotoPicker } from '../../components/PhotoPicker/PhotoPicker'
import styles from './MyRequestPage.module.css'

export function ClarificationForm({ message }: { message: string }) {
  return (
    <form className={styles.clarification} onSubmit={(e) => e.preventDefault()}>
      <p className={styles.muted}>{message}</p>
      <Textarea
        label="Відповідь менеджеру"
        placeholder="Додайте потрібну інформацію"
        maxLength={2000}
        className={styles.textarea}
      />
      <PhotoPicker />
      <Button type="submit" className={styles.submit} disabled>
        Надіслати уточнення
      </Button>
      <p className={styles.muted}>
        Надсилання уточнень з’явиться згодом. Поки що відповідайте на лист менеджера.
      </p>
    </form>
  )
}
