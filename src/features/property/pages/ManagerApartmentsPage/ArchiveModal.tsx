import { Button, InfoMessage, Modal } from '@/shared/ui'
import type { ManagerApartment } from '../../api/managerApartments'
import styles from './ManagerApartmentsPage.module.css'

interface Props {
  apartment: ManagerApartment | null
  pending: boolean
  failed: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ArchiveModal({ apartment, pending, failed, onClose, onConfirm }: Props) {
  return (
    <Modal
      open={apartment !== null}
      onClose={onClose}
      title="Архівувати апартаменти?"
      description="Об’єкт буде приховано з пошуку. Наявні бронювання та історія збережуться."
      actions={
        <>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            Архівувати
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
        </>
      }
    >
      {apartment && <p className={styles.muted}>{apartment.title}</p>}
      {failed && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося архівувати апартаменти.
        </InfoMessage>
      )}
    </Modal>
  )
}
