import { formatGuests, formatPrice } from '@/shared/lib/format'
import { Button, Modal } from '@/shared/ui'
import { apartmentAddress, type ManagerApartment } from '../../api/managerApartments'
import { formatRooms } from '../../apartmentOptions'
import { publicationLabel } from '../../apartmentState'
import styles from './ManagerApartmentsPage.module.css'

interface Props {
  apartment: ManagerApartment | null
  onClose: () => void
}

export function ApartmentInfoModal({ apartment, onClose }: Props) {
  return (
    <Modal
      open={apartment !== null}
      onClose={onClose}
      title={apartment?.title}
      description={
        apartment && `Київ, ${apartment.district} район · ${apartmentAddress(apartment)}`
      }
      className={styles.infoModal}
      actions={
        <Button variant="secondary" onClick={onClose}>
          Закрити
        </Button>
      }
    >
      {apartment && (
        <div className={styles.info}>
          <p>
            {[
              apartment.ownerName ?? 'Власника не призначено',
              formatRooms(apartment.rooms),
              formatGuests(apartment.maxGuests),
            ].join(' · ')}
          </p>
          <p>
            {formatPrice(apartment.pricePerNight)} / ніч · {publicationLabel[apartment.state]}
          </p>
        </div>
      )}
    </Modal>
  )
}
